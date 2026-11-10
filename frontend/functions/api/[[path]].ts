interface PagesEnv {
  BACKEND_ORIGIN?: string;
  VITE_BACKEND_PROXY_TARGET?: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnv;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;
  const targetOrigin = (
    env.BACKEND_ORIGIN ||
    env.VITE_BACKEND_PROXY_TARGET ||
    ""
  ).replace(/\/$/, "");

  if (!targetOrigin) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "BACKEND_ORIGIN belum dikonfigurasi pada Environment Variables Cloudflare Pages.",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = `${targetOrigin}${incomingUrl.pathname}${incomingUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return fetch(targetUrl, init);
};

