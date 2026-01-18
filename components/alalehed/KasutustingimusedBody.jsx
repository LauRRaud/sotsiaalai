"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const emailReplacement = {
  aEmail: {
    open: '<a class="link-brand" href="mailto:info@sotsiaal.ai">',
    close: "</a>"
  }
};
export default function KasutustingimusedBody() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const sections = [{
    heading: t("terms.section1.heading"),
    content: [{
      value: t("terms.section1.body")
    }]
  }, {
    heading: t("terms.section2.heading"),
    content: [{
      value: t("terms.section2.body")
    }]
  }, {
    heading: t("terms.section3.heading"),
    content: [{
      value: t("terms.section3.items"),
      type: "list"
    }]
  }, {
    heading: t("terms.section4.heading"),
    content: [{
      value: t("terms.section4.items"),
      type: "list"
    }]
  }, {
    heading: t("terms.section5.heading"),
    content: [{
      value: t("terms.section5.paragraph1")
    }, {
      value: t("terms.section5.paragraph2"),
      replacements: emailReplacement
    }]
  }, {
    heading: t("terms.section6.heading"),
    content: [{
      value: t("terms.section6.body")
    }]
  }, {
    heading: t("terms.section7.heading"),
    content: [{
      value: t("terms.section7.body")
    }]
  }, {
    heading: t("terms.section8.heading"),
    content: [{
      value: t("terms.section8.body")
    }]
  }, {
    heading: t("terms.section9.heading"),
    content: [{
      value: t("terms.section9.paragraph1")
    }, {
      value: t("terms.section9.paragraph2")
    }]
  }, {
    heading: t("terms.section10.heading"),
    content: [{
      value: t("terms.section10.paragraph1")
    }, {
      value: t("terms.section10.items"),
      type: "list"
    }, {
      value: t("terms.section10.paragraph2")
    }]
  }, {
    heading: t("terms.section11.heading"),
    content: [{
      value: t("terms.section11.body")
    }]
  }, {
    heading: t("terms.section12.heading"),
    content: [{
      value: t("terms.section12.body")
    }]
  }, {
    heading: t("terms.section13.heading"),
    content: [{
      value: t("terms.section13.body")
    }]
  }];
  return <article className="main-content glass-box doc-page" aria-labelledby="terms-title" lang={locale}>
      <h1 id="terms-title" className="glass-title">
        {t("terms.title")}
      </h1>
      <section className="glass-section doc-body">
        {sections.map(section => <div key={section.heading}>
            <h2 className="glass-h3 doc-section-heading">{section.heading}</h2>
            {section.content.map((item, idx) => item.type === "list" ? <RichText key={`${section.heading}-list-${idx}`} as="ul" className="glass-list" value={item.value} /> : <RichText key={`${section.heading}-p-${idx}`} as="div" value={item.value} replacements={item.replacements || {}} />)}
          </div>)}
      </section>
      <div className="back-btn-wrapper">
        <button type="button" className="back-arrow-btn" onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale))} aria-label={t("buttons.back_home")}>
          <span className="back-arrow-circle" />
        </button>
      </div>
      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </article>;
}