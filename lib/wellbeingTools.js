export const WELLBEING_INFO_ID = "wellbeing";

export const wellbeingTools = Object.freeze([
  {
    id: "quick-check",
    slug: "kiirkontroll",
    title: "Kiirkontroll",
    description: "Lühike töökoormuse ja taastumise kontroll.",
    icon: "HeartPulse",
    route: "/tooheaolu/kiirkontroll"
  },
  {
    id: "overview",
    slug: "ulevaade",
    title: "Ülevaade",
    description: "Nädala ja kuu tööheaolu trendid, koormustegurid ja mustrid.",
    icon: "Activity",
    route: "/tooheaolu/ulevaade"
  },
  {
    id: "hard-case",
    slug: "raske-juhtum",
    title: "Raske juhtum",
    description: "Töövoog pärast rasket või emotsionaalselt koormavat juhtumit.",
    icon: "TriangleAlert",
    route: "/tooheaolu/raske-juhtum"
  },
  {
    id: "workplace-violence",
    slug: "toovagivald",
    title: "Töövägivald",
    description: "Töövoog ähvarduse, agressiooni, solvamise, jälitamise või füüsilise ohu korral.",
    icon: "ShieldAlert",
    route: "/tooheaolu/toovagivald"
  },
  {
    id: "recovery",
    slug: "taastumine",
    title: "Taastumine",
    description: "Pauside, taastumisaja ja jõuvarude taastamise töövoog.",
    icon: "HeartHandshake",
    route: "/tooheaolu/taastumine"
  },
  {
    id: "work-boundaries",
    slug: "toopiirid",
    title: "Tööpiirid",
    description: "Tööaja, kättesaadavuse, pauside, taastumisaja ja katkestuste kokkulepped.",
    icon: "Clock",
    route: "/tooheaolu/toopiirid"
  },
  {
    id: "interruptions",
    slug: "katkestused",
    title: "Katkestused",
    description: "Katkestuste, ümberlülitumise ja töörahu korduvmustri märkamine.",
    icon: "MessageSquare",
    route: "/tooheaolu/katkestused"
  },
  {
    id: "work-processes",
    slug: "tooprotsessid",
    title: "Tööprotsessid",
    description: "“Mis võtab aja ära?” audit: dokumenteerimine, dubleerimine, katkestused ja korduvtegevused.",
    icon: "Repeat",
    route: "/tooheaolu/tooprotsessid"
  },
  {
    id: "role-boundaries",
    slug: "rollipiirid",
    title: "Rollipiirid",
    description: "Rolli, vastutuse, ootuste ja koostööpiiride selgemaks sõnastamine.",
    icon: "ShieldAlert",
    route: "/tooheaolu/rollipiirid"
  },
  {
    id: "starter-support",
    slug: "alustaja-tugi",
    title: "Alustaja tugi",
    description: "“Esimesed 100 päeva” juhis, mentori küsimused ja alustava spetsialisti töötoe plaan.",
    icon: "ClipboardCheck",
    route: "/tooheaolu/alustaja-tugi"
  }
]);

export function getWellbeingToolBySlug(slug) {
  const normalized = String(slug || "").trim();
  return wellbeingTools.find((tool) => tool.slug === normalized) || null;
}

export function canUseWellbeingRole(role, admin = false) {
  if (admin) return true;
  return String(role || "").trim().toUpperCase() === "SOCIAL_WORKER";
}
