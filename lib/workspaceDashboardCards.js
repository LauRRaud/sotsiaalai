function text(t, key, fallback) {
  return typeof t === "function" ? t(key, fallback) : fallback;
}

function withDisabled(card, hasPaidAccess, requiresPaid = false) {
  return {
    ...card,
    disabled: Boolean(requiresPaid && !hasPaidAccess)
  };
}

export const WORKSPACE_ROUTE_PREFETCH_PATHS = Object.freeze([
  "/documents",
  "/dokreziim",
  "/eelpoordumised",
  "/kovisioon",
  "/materjalid",
  "/teenusekaart",
  "/teenuseprofiil",
  "/tooheaolu"
]);

export function createWorkspaceDashboardRows({
  activeRole = "CLIENT",
  hasPaidAccess = false,
  t,
  navigateTo,
  openHelpPanel,
  openInvite
} = {}) {
  const role = String(activeRole || "CLIENT").trim().toUpperCase();
  const isClientView = role === "CLIENT";
  const isProviderView = role === "SERVICE_PROVIDER";
  const makeCard = (card, options = {}) => withDisabled(card, hasPaidAccess, options.requiresPaid);

  const serviceMapCard = makeCard({
    key: "service_map",
    icon: "map",
    title: text(t, "chat.workspace.cards.service_map.title", "Teenusekaart"),
    meta: text(t, "chat.workspace.cards.service_map.meta", "Kaardivaade"),
    onClick: () => navigateTo?.("/teenusekaart"),
    route: "/teenusekaart"
  });

  if (isProviderView) {
    return [
      [
        makeCard({
          key: "help_requests",
          icon: "help-request",
          title: text(t, "chat.workspace.cards.help_requests.title", "Abisoovid"),
          meta: text(t, "chat.workspace.cards.help_requests.meta", "Kuulutused"),
          onClick: () => openHelpPanel?.("help_requests")
        }),
        makeCard({
          key: "help_offers",
          icon: "help-offer",
          title: text(t, "chat.workspace.cards.help_offers.title", "Abipakkumised"),
          meta: text(t, "chat.workspace.cards.help_offers.meta", "Pakkumised"),
          onClick: () => openHelpPanel?.("help_offers")
        })
      ],
      [
        serviceMapCard,
        makeCard({
          key: "service_profile",
          icon: "service-profile",
          title: text(t, "chat.workspace.cards.service_profile.title", "Teenuseprofiil"),
          meta: text(t, "chat.workspace.cards.service_profile.meta", "Profiil"),
          onClick: () => navigateTo?.("/teenuseprofiil"),
          route: "/teenuseprofiil"
        }, { requiresPaid: true })
      ],
      [
        makeCard({
          key: "documents",
          icon: "document",
          title: text(t, "chat.workspace.cards.documents.title", "Dokumendid"),
          meta: text(t, "chat.workspace.cards.documents.meta", "Teek"),
          onClick: () => navigateTo?.("/documents"),
          route: "/documents"
        }, { requiresPaid: true }),
        makeCard({
          key: "document_drafting",
          icon: "compose",
          title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
          meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
          onClick: () => navigateTo?.("/dokreziim"),
          route: "/dokreziim"
        }, { requiresPaid: true })
      ],
      [
        makeCard({
          key: "pre_inquiries",
          icon: "compose",
          title: text(t, "chat.workspace.cards.pre_inquiries.title_staff", "Pöördumised"),
          meta: text(t, "chat.workspace.cards.pre_inquiries.meta_staff", "Saabunud ja saadetud"),
          onClick: () => navigateTo?.("/eelpoordumised"),
          route: "/eelpoordumised"
        }, { requiresPaid: true }),
        makeCard({
          key: "add_person",
          icon: "invite",
          title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
          meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
          onClick: openInvite
        }, { requiresPaid: true })
      ],
      [
        makeCard({
          key: "materials",
          icon: "materials",
          title: text(t, "chat.workspace.cards.materials.title", "Materjalid"),
          meta: text(t, "chat.workspace.cards.materials.meta", "Andmebaas"),
          onClick: () => navigateTo?.("/materjalid"),
          route: "/materjalid"
        }, { requiresPaid: true })
      ]
    ];
  }

  return [
    [
      makeCard({
        key: "help_requests",
        icon: "help-request",
        title: text(t, "chat.workspace.cards.help_requests.title", "Abisoovid"),
        meta: text(t, "chat.workspace.cards.help_requests.meta", "Kuulutused"),
        onClick: () => openHelpPanel?.("help_requests")
      }),
      makeCard({
        key: "help_offers",
        icon: "help-offer",
        title: text(t, "chat.workspace.cards.help_offers.title", "Abipakkumised"),
        meta: text(t, "chat.workspace.cards.help_offers.meta", "Pakkumised"),
        onClick: () => openHelpPanel?.("help_offers")
      })
    ],
    ...(!isClientView
      ? [[
          makeCard({
            key: "documents",
            icon: "document",
            title: text(t, "chat.workspace.cards.documents.title", "Dokumendid"),
            meta: text(t, "chat.workspace.cards.documents.meta", "Teek"),
            onClick: () => navigateTo?.("/documents"),
            route: "/documents"
          }, { requiresPaid: true }),
          makeCard({
            key: "document_drafting",
            icon: "compose",
            title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
            meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
            onClick: () => navigateTo?.("/dokreziim"),
            route: "/dokreziim"
          }, { requiresPaid: true })
        ]]
      : []),
    [
      makeCard({
        key: "pre_inquiries",
        icon: "compose",
        title: isClientView
          ? text(t, "chat.workspace.cards.pre_inquiries.title_client", "Eelpöördumine")
          : text(t, "chat.workspace.cards.pre_inquiries.title_staff", "Pöördumised"),
        meta: isClientView
          ? text(t, "chat.workspace.cards.pre_inquiries.meta_client", "Pöördumise mustand")
          : text(t, "chat.workspace.cards.pre_inquiries.meta_staff", "Saabunud ja saadetud"),
        onClick: () => navigateTo?.("/eelpoordumised"),
        route: "/eelpoordumised"
      }, { requiresPaid: true }),
      isClientView
        ? makeCard({
            key: "document_drafting",
            icon: "compose",
            title: text(t, "chat.workspace.cards.document_drafting.title", "Dokumendi koostamine"),
            meta: text(t, "chat.workspace.cards.document_drafting.meta", "Koostamise tooruum"),
            onClick: () => navigateTo?.("/dokreziim"),
            route: "/dokreziim"
          }, { requiresPaid: true })
        : makeCard({
            key: "add_person",
            icon: "invite",
            title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
            meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
            onClick: openInvite
          }, { requiresPaid: true })
    ],
    ...(isClientView
      ? [[
          makeCard({
            key: "add_person",
            icon: "invite",
            title: text(t, "chat.workspace.cards.add_person.title", "Kutsed"),
            meta: text(t, "chat.workspace.cards.add_person.meta", "Kutsed"),
            onClick: openInvite
          }, { requiresPaid: true }),
          serviceMapCard
        ]]
      : [
          [
            makeCard({
              key: "kovision",
              icon: "room",
              title: text(t, "chat.workspace.cards.kovision.title", "Kovisioon"),
              meta: text(t, "chat.workspace.cards.kovision.meta", "Ruumid"),
              onClick: () => navigateTo?.("/kovisioon"),
              route: "/kovisioon"
            }, { requiresPaid: true }),
            makeCard({
              key: "wellbeing",
              icon: "wellbeing",
              title: text(t, "chat.workspace.cards.wellbeing.title", "Tööheaolu"),
              meta: text(t, "chat.workspace.cards.wellbeing.meta", "Koormus ja tugi"),
              description: text(
                t,
                "chat.workspace.cards.wellbeing.description",
                "Märka töökoormust, vaata ülevaateid ning hoia fookuses taastumine, piirid ja tööprotsessid."
              ),
              onClick: () => navigateTo?.("/tooheaolu"),
              route: "/tooheaolu"
            }, { requiresPaid: true })
          ],
          [
            makeCard({
              key: "materials",
              icon: "materials",
              title: text(t, "chat.workspace.cards.materials.title", "Materjalid"),
              meta: text(t, "chat.workspace.cards.materials.meta", "Andmebaas"),
              onClick: () => navigateTo?.("/materjalid"),
              route: "/materjalid"
            }, { requiresPaid: true }),
            serviceMapCard
          ]
        ])
  ];
}
