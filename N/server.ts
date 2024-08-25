import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { upload, extractNotionId } from "./upload.ts";

const port = 8000;

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  
  if (request.method === "POST" && url.pathname === "/getUploadUrl") {
    const body = await request.json();
    try {
      const uploadInfo = await upload(body);
      return new Response(uploadInfo, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (request.method === "GET" && url.pathname === "/") {
    const html = await Deno.readTextFile("./N/index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response("Not Found", { status: 404 });
};

console.log(`HTTP server running. Access it at: http://localhost:${port}/`);
await serve(handler, { port });