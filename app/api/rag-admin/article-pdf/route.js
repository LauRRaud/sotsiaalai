// app/api/rag-admin/article-pdf/route.js
import { NextResponse } from "next/server";

const RAG_API_BASE = process.env.RAG_API_BASE;
const RAG_API_KEY = process.env.RAG_API_KEY;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const filename = searchParams.get("filename") || "";

    if (!docId || !start || !end) {
      return NextResponse.json({ message: "docId, start, end on kohustuslikud" }, { status: 400 });
    }
    const ragUrl = new URL(`${RAG_API_BASE}/article/pdf/${encodeURIComponent(docId)}`);
    ragUrl.searchParams.set("start", String(start));
    ragUrl.searchParams.set("end", String(end));
    if (filename) ragUrl.searchParams.set("filename", filename);

    const res = await fetch(ragUrl.toString(), {
      headers: { "X-API-Key": RAG_API_KEY },
    });

    if (!res.ok) {
      const txt = await res.text();
      return new NextResponse(txt, { status: res.status });
    }
    // stream back the PDF
    const headers = new Headers(res.headers);
    // enforce a safe filename if missing
    if (!headers.get("Content-Disposition")) {
      headers.set("Content-Disposition", `attachment; filename="${filename || "article.pdf"}"`);
    }
    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    return NextResponse.json({ message: err?.message || "article-pdf proxy ebaõnnestus" }, { status: 500 });
  }
}
