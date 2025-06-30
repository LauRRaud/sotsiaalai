"use client";

import Link from "next/link";

export default function MeistBody() {
  return (
    <div className="page-bg-gradient">
      <div className="glass-box" role="main" aria-labelledby="meist-title">
        <h1 id="meist-title" className="glass-title">
          Meist
        </h1>

        <section className="glass-section">
          <p>
            <b>Sotsiaal.AI</b> on kaasaegne tehisintellektil põhinev platvorm, mille eesmärk on pakkuda kiiret, usaldusväärset ja selgelt mõistetavat tuge nii sotsiaalvaldkonna spetsialistidele kui ka kõigile, kes otsivad abi elulistes sotsiaalküsimustes.
          </p>
          <p>
            Meie AI-assistendid — <strong>SotsiaalAI</strong> ja <strong>SotsiaalA&#60;B&#62;I</strong> — töötavad ööpäevaringselt ning aitavad leida vastuseid seadustest, toetustest ja sotsiaalteenustest, tuginedes nii õigusaktidele kui ka praktilistele lahendustele. Platvorm on anonüümne, kasutajasõbralik ning ligipääsetav kõigile.
          </p>
          <p>
            Sotsiaalvaldkonda iseloomustab suur töökoormus, killustunud info ja keeruline orienteerumine süsteemis — seda kinnitab ka{" "}
            <a
              href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande"
              target="_blank"
              rel="noopener noreferrer"
              className="link-brand"
            >
              OSKA raport (2025)
            </a>
            . Meie eesmärk on tuua selgust, lihtsustada igapäevatööd ning pakkuda tuge nii professionaalidele kui abiotsijatele.
          </p>
          <p>
            Sotsiaal.AI-d arendab ja haldab SotsiaalAI OÜ. Platvorm areneb pidevalt, et tagada ajakohane ning praktiline tugi kõigile kasutajatele.
          </p>
        </section>

        <section className="glass-section">
          <h2 className="glass-h2">Kontakt</h2>
          <p>
            <b>E-post:</b> <a href="mailto:info@sotsiaal.ai" className="link-brand">info@sotsiaal.ai</a>
          </p>
        </section>

        <section className="glass-section">
          <p>
            <strong>Enne lehe kasutamist tutvu kindlasti:</strong>
          </p>
          <ul className="glass-list">
            <li>
              <Link href="/privaatsustingimused" className="link-brand">
                Privaatsuspoliitika
              </Link>
            </li>
            <li>
              <Link href="/kasutustingimused" className="link-brand">
                Kasutustingimused
              </Link>
            </li>
          </ul>
        </section>

        <div>
          <Link href="/" className="back-link">
            &larr; Tagasi
          </Link>
        </div>

        <footer className="alaleht-footer">
          Sotsiaal.AI &copy; 2025
        </footer>
      </div>
    </div>
  );
}
