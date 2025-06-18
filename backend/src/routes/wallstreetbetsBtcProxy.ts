// Cloudflare Worker: routes/wallstreetbetsBtcProxy.ts

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Option 1: Redirect to your app's actual domain (mirror)
    if (url.hostname === "wall-street-bets.btc") {
      return Response.redirect("https://wallstreetbets.app", 301);
    }

    // Option 2: Resolve .btc via btc.us (BNS Gateway)
    if (url.hostname.endsWith(".btc")) {
      const target = \`https://\${url.hostname}.btc.us\${url.pathname}\`;
      return Response.redirect(target, 302);
    }

    return new Response("Not found", { status: 404 });
  },
};
