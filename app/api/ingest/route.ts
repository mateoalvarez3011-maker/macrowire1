import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { supabase } from "@/lib/supabase";
import { generarResumen, extraerEntidadesYMetricas } from "@/lib/openai";

const parser = new Parser();
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 MacroWireBot/1.0";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const feeds = (process.env.NEWS_FEEDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!feeds.length) {
    return NextResponse.json({ error: "NEWS_FEEDS vacío" }, { status: 400 });
  }

  const stats: Array<{ url:string; fetched:boolean; items:number; inserted:number; skipped:number; error?:string }> = [];
  let totalInserted = 0;

  for (const url of feeds) {
    const s = { url, fetched:false, items:0, inserted:0, skipped:0 } as any;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          "Accept": "application/rss+xml, application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      s.fetched = true;

      const xml = await res.text();
      const feed = await parser.parseString(xml);
      const items = feed.items || [];
      s.items = items.length;

      for (const item of items) {
        const title = item.title || "";
        const link = (item as any).link || (item as any).guid || (item as any).id || "";
        if (!link) { s.skipped++; continue; }

        const published_at =
          (item as any).isoDate || (item as any).pubDate || new Date().toISOString();

        // Duplicados
        const { data: exists } = await supabase
          .from("articles").select("id").eq("source_url", link).maybeSingle();
        if (exists) { s.skipped++; continue; }

        const raw = (item as any)["content:encoded"] || (item as any).contentSnippet || (item as any).content || title;

        const summary = await generarResumen(raw);
        const { tickers = [], countries = [], orgs = [], impact = 0, risk = "bajo" } =
          await extraerEntidadesYMetricas(raw);

        const { error: insErr } = await supabase.from("articles").insert([{
          title, summary, source_url: link, published_at,
          impact_score: impact, risk_level: risk, topics: null, tickers, countries, orgs
        }]);
        if (insErr) { s.skipped++; console.error("Insert error", insErr.message); }
        else { s.inserted++; totalInserted++; }
      }
    } catch (e:any) {
      s.error = e?.message || String(e);
      console.error("Feed error", url, s.error);
    }
    stats.push(s);
  }

  return NextResponse.json({ ok:true, inserted: totalInserted, stats });
}
