import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse
) => unknown | Promise<unknown>;

export function pagesApiHandler(handler: Handler) {
  return async function routeHandler(
    request: NextRequest,
    ctx: { params: Promise<Record<string, string | string[]>> }
  ) {
    const url = new URL(request.url);
    const searchParams: Record<string, string | string[]> = {};
    url.searchParams.forEach((v, k) => {
      const existing = searchParams[k];
      if (existing === undefined) searchParams[k] = v;
      else if (Array.isArray(existing)) existing.push(v);
      else searchParams[k] = [existing, v];
    });
    const resolved = ctx?.params ? await ctx.params : ({} as Record<string, string | string[]>);
    const query = { ...searchParams, ...(resolved as Record<string, string | string[]>) };

    let body: unknown = undefined;
    const contentType = request.headers.get("content-type") ?? "";
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        if (contentType.includes("application/json")) {
          body = await request.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          const fd = await request.formData();
          body = Object.fromEntries(fd.entries());
        } else if (contentType.includes("multipart/form-data")) {
          body = await request.formData();
        } else {
          const text = await request.text();
          body = text.length > 0 ? text : undefined;
        }
      } catch {
        body = undefined;
      }
    }

    const headersObj: Record<string, string> = {};
    request.headers.forEach((v, k) => {
      headersObj[k] = v;
    });

    const cookiesParsed: Record<string, string> = {};
    const cookieHeader = request.headers.get("cookie") ?? "";
    if (cookieHeader) {
      cookieHeader.split(";").forEach((pair) => {
        const idx = pair.indexOf("=");
        if (idx > 0) {
          const k = pair.slice(0, idx).trim();
          const v = pair.slice(idx + 1).trim();
          cookiesParsed[k] = decodeURIComponent(v);
        }
      });
    }

    const req = {
      method: request.method,
      headers: headersObj,
      query,
      cookies: cookiesParsed,
      body,
      url: request.url,
    } as unknown as NextApiRequest;

    let statusCode = 200;
    const resHeaders = new Headers();
    let responseBody: BodyInit | null = null;

    const res = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      json(data: unknown) {
        resHeaders.set("content-type", "application/json");
        responseBody = JSON.stringify(data);
        return res;
      },
      send(data: unknown) {
        if (
          typeof data === "object" &&
          data !== null &&
          !(data instanceof Uint8Array)
        ) {
          resHeaders.set("content-type", "application/json");
          responseBody = JSON.stringify(data);
        } else {
          responseBody = data as BodyInit;
        }
        return res;
      },
      end(data?: unknown) {
        if (data !== undefined) responseBody = data as BodyInit;
        return res;
      },
      setHeader(name: string, value: string | string[]) {
        if (Array.isArray(value)) value.forEach((v) => resHeaders.append(name, v));
        else resHeaders.set(name, value);
        return res;
      },
      getHeader(name: string) {
        return resHeaders.get(name);
      },
      removeHeader(name: string) {
        resHeaders.delete(name);
      },
      writeHead(code: number, headers?: Record<string, string>) {
        statusCode = code;
        if (headers) Object.entries(headers).forEach(([k, v]) => resHeaders.set(k, v));
        return res;
      },
      redirect(url: string, code = 307) {
        statusCode = code;
        resHeaders.set("location", url);
        return res;
      },
    } as unknown as NextApiResponse;

    try {
      await handler(req, res);
    } catch (e) {
      console.error("pagesApiHandler: handler threw", e);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    return new NextResponse(responseBody, {
      status: statusCode,
      headers: resHeaders,
    });
  };
}
