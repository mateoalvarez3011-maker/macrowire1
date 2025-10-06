import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { supabase } from "@/lib/supabase";
import { generarResumen, extraerEntidadesYMetricas } from "@/lib/openai";

const parser = new Parser();
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 MacroWireBot/1.0";

export async function GET(req: NextRequest) {
  // Si decidiste protegerlo, exige el header
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const feeds = (process.env.NEWS_FEEDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!feeds.length) {
      return NextResponse.json({ error: "NEWS_FEEDS vacío" }, { status: 400 });
    }

    let inserted = 0;
    for (const url of feeds) {
      try {
        // 1) Descargamos el XML con fetch (cabeceras decentes y follow redirects)
        const res = await fetch(url, {
          headers: {
            "User-Agent": UA,
            Accept: "application/rss+xml, application/xml;q=0.9,*/*;q=0.8",
          },
          redirect: "follow",
          cache: "no-store",
        });
        if (!res.ok) {
          console.error("Feed fetch failed", url, res.status, res.statusText);
          continue;
        }
        const xml = await res.text();

        // 2) Parseamos el XML nosotros (evita handshake raros de parseURL)
        const feed = await parser.parseString(xml);

        for (const item of feed.items) {
          const title = item.title || "";
          const link =
            (item as any).link ||
            (item as any).guid ||
            ""; // algunos feeds ponen el link en guid
          if (!link) continue;

          const published_at =
            (item as any).isoDate ||
            (item as any).pubDate ||
            new Date().toISOString();

          // evita duplicados
          const { data: exists } = await supabase
            .from("articles")
            .select("id")
            .eq("source_url", link)
            .maybeSingle();
          if (exists) continue;

          const raw =
            (item as any)["content:encoded"] ||
            (item as any).contentSnippet ||
            (item as any).content ||
            title;

          // Llamadas IA (resumen + entidades/impacto)
          const summary = await generarResumen(raw);
          const {
            tickers = [],
            countries = [],
            orgs = [],
            impact = 0,
            risk = "bajo",
          } = await extraerEntidadesYMetricas(raw);

          const { error: insErr } = await supabase.from("articles").insert([
            {
              title,
              summary,
              source_url: link,
              published_at,
              impact_score: impact,
              risk_level: risk,
              topics: null,
              tickers,
              countries,
              orgs,
            },
          ]);
          if (insErr) {
            console.error("Insert error", insErr.message);
          } else {
            inserted++;
          }
        }
      } catch (e: any) {
        // Loguea feed que rompió (lo verás en Vercel → Logs)
        console.error("Feed error", url, e?.message || e);
        continue;
      }
    }

    return NextResponse.json({ ok: true, inserted });
  } catch (e: any) {
    console.error("Ingest fatal", e?.message || e);
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

