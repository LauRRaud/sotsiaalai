"use client";

import AppLink from "@/components/ui/Link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";

export default function HomeAboutSection({ id = "meist", className, showAdminLinks = false }) {
  return (
    <section
      id={id}
      className={cn(
        "home-section",
        "relative z-30 w-full overflow-visible py-[clamp(2.8rem,7vw,5rem)] pb-[clamp(0.6rem,1.6vw,1rem)] touch-pan-y",
        className
      )}
    >
      <div
        className={cn(
          "relative z-[1] mx-auto w-[min(92vw,58rem)] flex flex-col gap-[1.5rem]"
        )}
      >
        <div
          className="relative bg-[var(--home-panel-bg)] backdrop-blur-[var(--glass-blur-radius,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] rounded-[clamp(1.25rem,2.6vw,2.4rem)] shadow-[var(--home-panel-shadow)] border-0 px-[clamp(1rem,2.6vw,2.25rem)] pt-[clamp(1.4rem,2.4vw,2.15rem)] pb-[clamp(1.4rem,2.4vw,2.25rem)] isolation-isolate"
        >
          <h2
            className={cn(
              "text-center text-[clamp(1.9rem,3.9vw,2.6rem)] font-headline tracking-[0.02em] mt-0 mb-[1.1rem] text-[color:var(--home-title-color)]"
            )}
          >
            Meist
          </h2>
          <div className="text-center text-[clamp(1.1rem,1.6vw,1.28rem)] leading-[1.7] tracking-[0.03em] space-y-[0.95rem] [color:var(--home-prose-color)]">
            <p>
              SotsiaalAI on tehisintellektil põhinev platvorm, mille eesmärk on pakkuda usaldusväärset ja arusaadavat tuge nii sotsiaalvaldkonna spetsialistidele kui ka inimestele, kes otsivad abi elulistes sotsiaalküsimustes.
            </p>
            <p>
              Platvormil on kaks rollipõhist AI-assistenti: üks spetsialistidele ja teine eluküsimustega pöördutajatele. Mõlemad on loodud selleks, et pakkuda vajaduspõhist tuge — olgu see seotud seaduste, toetuste, teenuste või tööolukordadega. Vastused tuginevad usaldusväärsetele allikatele, lihtsustatud selgitustele ja praktilistele juhistele.
            </p>
            <p>
              Sotsiaalvaldkonda iseloomustab suur töökoormus, killustunud info ja keeruline orienteerumine süsteemis — seda kinnitab ka {" "}
                <AppLink
                  href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                    linkBrandInlineClass
                  )}
                >
                  OSKA raport (2025)
                </AppLink>
              . Meie eesmärk on tuua selgust, lihtsustada igapäevast tööd ning pakkuda tuge nii professionaalidele kui abiotsijatele.
            </p>
          </div>
        </div>
        <div className="relative bg-[var(--home-panel-bg)] backdrop-blur-[var(--glass-blur-radius,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] rounded-full shadow-[var(--home-before-shadow)] border-0 w-[min(90vw,30rem)] h-[min(90vw,30rem)] mx-auto mt-[clamp(0.8rem,2.2vw,1.8rem)] flex items-center justify-center p-[clamp(1.2rem,3vw,2.4rem)] box-border">
          <div className="relative z-[1] text-center text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.7] flex flex-col gap-[clamp(0.65rem,1.2vw,0.85rem)] max-w-[min(74vw,24.5rem)] items-center pt-[clamp(0.6rem,1.4vw,1.4rem)]">
            <p className="m-0 mt-[clamp(0.4rem,1vw,1rem)] mb-[clamp(0.9rem,2vw,1.6rem)] text-[clamp(1.48rem,2.45vw,2.05rem)] font-headline tracking-[0.02em] leading-[1.2] text-[color:var(--home-prose-color)]">
              Enne kasutamist
            </p>
            <ul className="flex flex-wrap items-center justify-center list-none p-0 m-0 gap-x-[1.05rem] gap-y-[0.45rem]">
              <li>
                <AppLink
                  href="/kasutusjuhend"
                  className={cn(
                    "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                    linkBrandInlineClass
                  )}
                >
                  Platvormi kasutusjuhend
                </AppLink>
              </li>
              <li>
                <AppLink
                  href="/kasutustingimused"
                  className={cn(
                    "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                    linkBrandInlineClass
                  )}
                >
                  Kasutustingimused
                </AppLink>
              </li>
              <li>
                <AppLink
                  href="/privaatsustingimused"
                  className={cn(
                    "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                    linkBrandInlineClass
                  )}
                >
                  Privaatsuspoliitika
                </AppLink>
              </li>
              <li>
                <InstallAppLink
                  variant="row"
                  className={cn(
                    "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                    linkBrandInlineClass
                  )}
                />
              </li>
              {showAdminLinks ? (
                <>
                  <li>
                    <AppLink
                      href="/admin/analytics"
                      className={cn(
                        "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                        linkBrandInlineClass
                      )}
                    >
                      Analüütika
                    </AppLink>
                  </li>
                  <li>
                    <AppLink
                      href="/admin/rag"
                      className={cn(
                        "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                        linkBrandInlineClass
                      )}
                    >
                      RAG andmebaasi haldus
                    </AppLink>
                  </li>
                </>
              ) : null}
            </ul>
            <p>
              <AppLink
                href="mailto:info@sotsiaal.ai"
                className={cn(
                  "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
                  linkBrandInlineClass
                )}
              >
                info@sotsiaal.ai
              </AppLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
