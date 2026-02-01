"use client";

import AppLink from "@/components/ui/Link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";
import styles from "../HomePage.module.css";

export default function HomeAboutSection({ id = "meist", className, showAdminLinks = false }) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-30 w-full py-[clamp(2.8rem,7vw,5rem)] pb-[clamp(0.6rem,1.6vw,1rem)] touch-pan-y",
        styles["home-section"],
        styles["home-about"],
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-[min(92vw,58rem)] flex flex-col gap-[1.5rem]",
          styles["home-section-inner"]
        )}
      >
        <div className={styles["home-about-card"]}>
          <h2
            className={cn(
              "text-center text-[clamp(1.9rem,3.9vw,2.6rem)] font-[var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-medium tracking-[0.02em] mt-0 mb-[1.1rem]",
              styles["home-section-title"]
            )}
          >
            Meist
          </h2>
          <div className="text-center text-[clamp(1.1rem,1.6vw,1.28rem)] leading-[1.7] tracking-[0.01em] space-y-[0.95rem] [color:var(--home-prose-color)]">
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
                className={cn(styles["home-link"], linkBrandInlineClass)}
              >
                OSKA raport (2025)
              </AppLink>
              . Meie eesmärk on tuua selgust, lihtsustada igapäevast tööd ning pakkuda tuge nii professionaalidele kui abiotsijatele.
            </p>
          </div>
        </div>
        <div className={styles["home-before"]}>
          <div className={styles["home-before-content"]}>
            <p className={styles["home-before-title"]}>
              Enne kasutamist
            </p>
            <ul className="flex flex-wrap items-center justify-center list-none p-0 m-0 gap-x-[1.05rem] gap-y-[0.45rem]">
              <li>
                <AppLink href="/kasutusjuhend" className={cn(styles["home-link"], linkBrandInlineClass)}>
                  Platvormi kasutusjuhend
                </AppLink>
              </li>
              <li>
                <AppLink href="/kasutustingimused" className={cn(styles["home-link"], linkBrandInlineClass)}>
                  Kasutustingimused
                </AppLink>
              </li>
              <li>
                <AppLink href="/privaatsustingimused" className={cn(styles["home-link"], linkBrandInlineClass)}>
                  Privaatsuspoliitika
                </AppLink>
              </li>
              <li>
                <InstallAppLink variant="row" className={cn(styles["home-link"], linkBrandInlineClass)} />
              </li>
              {showAdminLinks ? (
                <>
                  <li>
                    <AppLink href="/admin/analytics" className={cn(styles["home-link"], linkBrandInlineClass)}>
                      Analüütika
                    </AppLink>
                  </li>
                  <li>
                    <AppLink href="/admin/rag" className={cn(styles["home-link"], linkBrandInlineClass)}>
                      RAG andmebaasi haldus
                    </AppLink>
                  </li>
                </>
              ) : null}
            </ul>
            <p>
              <AppLink href="mailto:info@sotsiaal.ai" className={cn(styles["home-link"], linkBrandInlineClass)}>
                info@sotsiaal.ai
              </AppLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
