import "./globals.css";

export const metadata = {
  title: "MacroWire",
  description: "Noticias económicas con IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, Arial" }}>
        <header style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
          <b>⚡ MacroWire</b>
        </header>
        <main style={{ maxWidth: 960, margin: "16px auto", padding: "0 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
