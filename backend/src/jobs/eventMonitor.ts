// eslint-disable-next-line @typescript-eslint/no-var-requires
const cron = require("node-cron");
import OpenAI from "openai";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require("nodemailer");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Transaction = require("../models/transaction");
import Event from "../models/event";
import {
  OPENAI_API_KEY,
  ALERT_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} from "../utils/config";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

const lastPrices = new Map<string, number>();
const lastShares = new Map<string, number>();

async function summarize(text: string): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Summarize events for end users." },
        { role: "user", content: text },
      ],
    });
    return res.choices[0]?.message?.content || text;
  } catch (err) {
    console.error("OpenAI summary failed", err);
    return text;
  }
}

async function notify(summary: string) {
  if (transporter && ALERT_EMAIL) {
    try {
      await transporter.sendMail({
        from: SMTP_USER,
        to: ALERT_EMAIL,
        subject: "Marketplace Alert",
        text: summary,
      });
    } catch (err) {
      console.error("Failed to send email", err);
    }
  }
}

export function startEventMonitor() {
  cron.schedule("0 * * * *", async () => {
    try {
      const items = await Item.find();
      for (const item of items) {
        const prevPrice = lastPrices.get(item.id);
        if (
          prevPrice !== undefined &&
          Math.abs(item.purchasePrice - prevPrice) / prevPrice > 0.2
        ) {
          const msg = `Price changed from ${prevPrice} to ${item.purchasePrice} for ${item.name}`;
          const summary = await summarize(msg);
          await Event.create({ type: "price_change", itemId: item._id, summary });
          await notify(summary);
        }
        lastPrices.set(item.id, item.purchasePrice);

        const prevShare = lastShares.get(item.id) || 0;
        if (item.sharesSold - prevShare > 50) {
          const msg = `${item.name} sold ${item.sharesSold - prevShare} additional shares.`;
          const summary = await summarize(msg);
          await Event.create({ type: "ownership_shift", itemId: item._id, summary });
          await notify(summary);
        }
        lastShares.set(item.id, item.sharesSold);
      }

      const recentTxCount = await Transaction.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });
      if (recentTxCount > 20) {
        const msg = `There have been ${recentTxCount} transactions in the last hour.`;
        const summary = await summarize(msg);
        await Event.create({ type: "activity_spike", summary });
        await notify(summary);
      }
    } catch (err) {
      console.error("Event monitor error", err);
    }
  });
}
