import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { supabase } from "@/lib/supabase";
import { generarResumen, extraerEntidadesYMetricas } from "@/lib/openai";

const parser = new Parser();

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const feeds = (process.env.NEWS_FEEDS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!feeds.length) return NextResponse.json({ error: "NEWS_FEEDS vacío" }, { status: 400 });

  for (const url of feeds) {
    const feed = await parser.parseURL(url);
    for (const item of feed.items) {
      const title = item.title || "";
      const link = (item as any).link || "";
      const published_at = (item as any).isoDate || (item as any).pubDate || new Date().toISOString();
      if (!link) continue;

      const { data: exists } = await supabase.from("articles").select("id").eq("source_url", link).maybeSingle();
      if (exists) continue;

      const raw = (item as any)["content:encoded"] || (item as any).contentSnippet || (item as any).content || title;
      const summary = await generarResumen(raw);
      const { tickers, countries, orgs, impact, risk } = await extraerEntidadesYMetricas(raw);

      await supabase.from("articles").insert([{
        title,
        summary,
        source_url: link,
        published_at,
        impact_score: impact ?? 0,
        risk_level: risk ?? "bajo",
        topics: null,
        tickers: tickers ?? [],
        countries: countries ?? [],
        orgs: orgs ?? []
      }]);
    }
  }
  return NextResponse.json({ ok: true });
}
