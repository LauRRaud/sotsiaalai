import "./globals.css";
import BackgroundLayer from "./BackgroundLayer";

export const metadata = {
  title: "SotsiaalAI",
  description: "Sotsiaalvaldkonna AI assistendid",
};

export default function RootLayout({ children }) {
  return (
    <html lang="et">
      <body>
        {/* Globaalne taust kõigil lehtedel */}
        <BackgroundLayer />

        {/* Lehe sisu */}
        {children}
      </body>
    </html>
  );
}