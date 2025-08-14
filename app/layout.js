import "./globals.css";
import BackgroundLayer from "../components/backgrounds/BackgroundLayer";

export default function RootLayout({ children }) {
  return (
    <html lang="et">
      <body>
        <BackgroundLayer />           {/* mount 1× kogu äpi ajal */}
        <main className="relative z-0">{children}</main>
      </body>
    </html>
  );
}