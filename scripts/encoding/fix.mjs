import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function hasUtf8Bom(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function backupFile(file) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const bak = `${file}.bak-encoding-${stamp}`;
  fs.copyFileSync(file, bak);
  return bak;
}

function writeUtf8NoBom(file, text) {
  fs.writeFileSync(file, text, { encoding: "utf8" });
}

function fixMojibakeKnown(text) {
  const replacements = [
    ["p’┐Įsivus", "püsivus"],
    ["p’┐Įsivuse", "püsivuse"],
    ["t’┐Įhjalt", "tühjalt"],
    ["t’┐Įhjad", "tühjad"],
    ["re’┐Įiim", "režiim"],
    ["s’┐Įndmus", "sündmus"],
    ["S’┐Įnumi", "Sõnumi"],
    ["l’┐Įhtesta", "lähtesta"],
    ["l’┐Įhtestamiseks", "lähtestamiseks"],
    ["tr’┐Įkkimise", "trükkimise"],
    ["p’┐Įringuid", "päringuid"],
    ["p’┐Įrast", "pärast"],
    ["h’┐Į’┐Įli", "hääli"],
    ["v’┐Įltida", "vältida"],
    ["eba’┐Įnnestus", "ebaõnnestus"],
    ["’┐Įnnestunud", "õnnestunud"],
    ["anal’┐Į’┐Įs", "analüüs"],
    ["anal’┐Į’┐Įsi", "analüüsi"],
    ["t’┐Įna", "täna"],
    ["Saada s’┐Įnum", "Saada sõnum"],
    ["L’┐Įpeta", "Lõpeta"],
    ["Lehek’┐Įljed", "Leheküljed"],
    ["l’┐Įigus", "lõigus"],
    ["’┐Į’┐Įp’┐Įevaringselt", "ööpäevaringselt"],
  ];

  let out = text;
  for (const [a, b] of replacements) out = out.split(a).join(b);

  out = out.replaceAll("’┐Į${prev}", "-${prev}");

  return out;
}

function fixSpecificLines(text) {
  text = text.replace(
    /t\("chat\.mic\.stop",\s*[^)]*\)/g,
    't("chat.mic.stop", "Lõpeta salvestus")'
  );

  text = text.replace(
    /t\("chat\.sources\.used_multiple",\s*"[^"]*"\)/g,
    't("chat.sources.used_multiple", "Kasutatud {count} korda vestluse lõigus.")'
  );

  return text;
}

const TARGETS = [
  path.join(ROOT, "components", "alalehed", "ChatBody.jsx"),
  path.join(ROOT, "components", "chat", "hooks", "useChatStream.js"),
];

for (const file of TARGETS) {
  if (!fs.existsSync(file)) continue;

  const buf = fs.readFileSync(file);
  const bak = backupFile(file);

  let text = buf.toString("utf8");
  if (hasUtf8Bom(buf)) {
    text = text.slice(1);
  }

  const before = text;
  text = fixMojibakeKnown(text);
  text = fixSpecificLines(text);

  if (text !== before) {
    writeUtf8NoBom(file, text);
    console.log(`Fixed: ${path.relative(ROOT, file)} (backup: ${path.basename(bak)})`);
  } else {
    console.log(`No changes: ${path.relative(ROOT, file)} (backup: ${path.basename(bak)})`);
  }
}

console.log("Done.");
