import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generarResumen(texto: string) {
  if (!texto || texto.length < 60) return texto || "";
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [{ role: "user", content: `Resume en español en 3 frases:
"""${texto}"""` }],
  });
  return r.choices[0]?.message?.content?.trim() || "";
}

export async function extraerEntidadesYMetricas(texto: string) {
  const prompt = `Extrae en JSON: tickers[], countries[], orgs[], impact(0-10), risk(bajo|medio|alto).
Texto:
"""${texto}"""`;
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });
  try {
    const content = r.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return { tickers: [], countries: [], orgs: [], impact: 0, risk: "bajo" };
  }
}
