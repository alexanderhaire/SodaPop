// Cloudflare Worker: routes/wallstreetbetsBtcProxy.ts

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // normalize trailing slashes
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    // direct .btc routing
    if (url.hostname === "wall-street-bets.btc") {
      console.log("redirecting to app domain");
      return Response.redirect(`https://wallstreetbets.app${url.pathname}`, 301);
    }

    // fallback to BNS gateway
    if (url.hostname.endsWith(".btc")) {
      const target = `https://${url.hostname}.btc.us${url.pathname}`;
      console.log("gateway redirect", target);
      return Response.redirect(target, 302);
    }

    return new Response("Not found", { status: 404 });
  },
};
