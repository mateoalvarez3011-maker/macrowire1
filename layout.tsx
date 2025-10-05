import "./../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MacroWire — Portal Económico con IA",
  description: "Noticias financieras y políticas con IA (Next.js + Supabase + OpenAI)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="p-4 border-b">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold">⚡ MacroWire</h1>
            <p className="text-sm opacity-70">IA para entender la economía — Demo</p>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4">{children}</main>
        <footer className="text-center text-sm opacity-70 my-10">
          © 2025 MacroWire · Next.js · Supabase · OpenAI
        </footer>
      </body>
    </html>
  );
}
