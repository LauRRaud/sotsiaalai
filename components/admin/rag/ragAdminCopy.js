function isEstonian(locale) {
  return String(locale || "").toLowerCase().startsWith("et");
}

export function getRagAdminCopy(locale) {
  if (isEstonian(locale)) {
    return {
      heading: "RAG",
      subtitle: "Halda teadmistebaasi dokumente, ingest-vooge, KOV-e ja organisatsioone uhes admin-keskkonnas.",
      nav: {
        home: "Toolaud",
        documents: "Dokumendid",
        ingest: "Ingest",
        kov: "KOV",
        organizations: "Organisatsioonid"
      },
      landing: {
        title: "Toolaud",
        subtitle: "Halda RAG teadmistebaasi nelja pohisuuna kaudu: dokumentide haldus, kaesitsi ingest, kohalike omavalitsuste erihaldus ja organisatsioonide erihaldus.",
        cards: [
          {
            href: "/admin/rag/documents",
            title: "Dokumendid",
            body: "Laiem dokumentide haldusala registri, allikaloogika ja dokumentidega seotud seadistuste jaoks.",
            cta: "Ava dokumentide haldus"
          },
          {
            href: "/admin/rag/ingest",
            title: "Ingest",
            body: "Kaesitsi ingest toolaud URL-ide, PDF + metadata, artiklite ja muude sisestusvahendite jaoks.",
            cta: "Ava ingest"
          },
          {
            href: "/admin/rag/kov",
            title: "KOV haldus",
            body: "Halda kohalike omavalitsuste linke, failide seisu ja valmisolekut jargmisteks sammudeks. Korje toimub praegu valjaspool platvormi.",
            cta: "Ava KOV admin"
          },
          {
            href: "/admin/rag/organizations",
            title: "Organisatsioonid",
            body: "Halda MTU-sid, sihtasutusi, teenuseosutajaid, partnereid ja olulisi teemaveebe eraldi admin-vaates.",
            cta: "Ava organisatsioonid"
          }
        ],
        notesTitle: "Markused",
        notes: [
          "Backend endpointid jaavad samaks ja koik route'id kasutavad olemasolevat /api/rag proxy kihti.",
          "Documents vaade keskendub registrile ja detailvaatele.",
          "Ingest vaade koondab koik sisestusvood ja metadata mallid uhte kohta."
        ]
      },
      pages: {
        documents: {
          title: "Dokumentide haldus",
          subtitle: "Dokumentide register, allikaloogika ja dokumendihalduse seaded peavad siia mahtuma uhe laiema haldusala osadena."
        },
        ingest: {
          title: "Ingest toolaud",
          subtitle: "Kaesitsi ingest toolaud URL-ide, PDF-de, artiklite ja muude sisestusvoogude jaoks."
        },
        kov: {
          title: "KOV haldus",
          subtitle: "Halda kasitsi kogutud KOV andmeid, linke, failide seisu ja valmisolekut jargmisteks sammudeks."
        },
        organizations: {
          title: "Organisatsioonide haldus",
          subtitle: "Halda organisatsioone, teenuseosutajaid, partnereid ja olulisi veebiallikaid eraldi RAG admini pohiosana."
        }
      },
      kov: {
        searchPlaceholder: "Otsi KOV nime, slugi voi marksona jargi"
      }
    };
  }

  return {
    heading: "RAG",
      subtitle: "Manage documents, ingest flows, municipalities, and organizations in one admin workspace.",
    nav: {
      home: "Workspace",
      documents: "Documents",
      ingest: "Ingest",
      kov: "Municipal",
      organizations: "Organizations"
    },
      landing: {
        title: "Workspace",
        subtitle: "Manage the RAG knowledge base through four core areas: document management, manual ingest, municipal admin, and organization admin.",
      cards: [
        {
          href: "/admin/rag/documents",
          title: "Documents",
          body: "A broader document management area for the registry, source logic, and document-related settings.",
          cta: "Open documents"
        },
        {
          href: "/admin/rag/ingest",
          title: "Ingest",
          body: "Manual ingest workspace for URLs, PDF plus metadata, article imports, and related tools.",
          cta: "Open ingest"
        },
        {
          href: "/admin/rag/kov",
          title: "Municipal admin",
          body: "Manage municipality links, file status, and next-step readiness for manually collected datasets. Collection still happens outside the platform.",
          cta: "Open municipal admin"
        },
        {
          href: "/admin/rag/organizations",
          title: "Organizations",
          body: "Manage NGOs, foundations, service providers, partners, and important thematic websites in a dedicated admin area.",
          cta: "Open organizations"
        }
      ],
      notesTitle: "Notes",
      notes: [
        "Backend endpoints stay unchanged and all routes continue to use the existing /api/rag proxy layer.",
        "The documents view focuses on the registry and detail workflow.",
        "The ingest view brings all upload flows and metadata templates into one place."
      ]
    },
    pages: {
      documents: {
        title: "Document management",
        subtitle: "This area should grow beyond a registry into source logic and document-management settings."
      },
      ingest: {
        title: "Ingest workspace",
        subtitle: "Manual workspace for bringing new sources into RAG through the existing ingest flows."
      },
      kov: {
        title: "Municipal admin",
        subtitle: "Manage manually collected municipal data, links, file status, and readiness for the next steps."
      },
      organizations: {
        title: "Organization admin",
        subtitle: "Manage organizations, service providers, partners, and important source websites as a separate RAG admin domain."
      }
    },
    kov: {
      searchPlaceholder: "Search by municipality name, slug, or keyword"
    }
  };
}
