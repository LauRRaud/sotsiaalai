"use client";

import Link from "next/link";

export default function MeistBody() {
  return (
    <div className="alaleht-hero">
      <div className="alaleht-inner">
        <div className="alaleht-box">
          <h1 className="alaleht-title">Meist</h1>

          <section className="alaleht-section">
            <p>
              Sotsiaal.AI on kaasaegne tehisintellektil põhinev platvorm, loodud selleks, et pakkuda kiiret, usaldusväärset ja selgelt mõistetavat tuge nii sotsiaalvaldkonna spetsialistidele kui ka inimestele, kes otsivad abi elulistes sotsiaalküsimustes.
            </p>
            <p>
              Meie AI-assistendid — <strong>SotsiaalAI</strong> ja <strong>SotsiaalA&#60;B&#62;I</strong> — töötavad ööpäevaringselt ning aitavad leida vastuseid seadustest, toetustest ja sotsiaalteenustest, tuginedes nii õigusaktidele kui ka praktilistele lahendustele. Teenus on anonüümne, kasutajasõbralik ning ligipääsetav kõigile.
            </p>
            <p>
              Sotsiaalvaldkonda iseloomustab suur töökoormus, killustunud info ja keeruline orienteerumine süsteemis — seda kinnitab ka{" "}
              <a
                href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande"
                target="_blank"
                rel="noopener noreferrer"
              >
                OSKA raport (2025)
              </a>
              . Sellises keskkonnas on kvaliteetne ja kättesaadav nõuandeplatvorm hädavajalik. Meie eesmärk on tuua selgust, lihtsustada igapäevatööd ning pakkuda toetust nii professionaalidele kui ka abi otsivatele inimestele.
            </p>
            <p>
              Sotsiaal.AI-d arendab ja haldab SotsiaalAI OÜ. Platvorm areneb pidevalt, et tagada ajakohane ja praktiline tugi kõigile kasutajatele.
            </p>
          </section>

<section className="alaleht-section">
  <h2 className="alaleht-h2">Kontakt</h2>
  <p>
    <strong>E-post:</strong>{" "}
    <a href="mailto:info@sotsiaal.ai">info@sotsiaal.ai</a>
  </p>
</section>

          <section className="alaleht-section">
            <p>
              <strong>Enne lehe kasutamist tutvu kindlasti:</strong>
            </p>
            <ul className="alaleht-list">
              <li>
                <Link href="/privaatsustingimused">Privaatsuspoliitika</Link>
              </li>
              <li>
                <Link href="/kasutustingimused">Kasutustingimused</Link>
              </li>
            </ul>
          </section>

          <div>
            <Link href="/" className="back-link">&larr; Tagasi</Link>
          </div>

          <footer className="alaleht-footer">
            &copy; 2025 sotsiaal.ai
          </footer>
        </div>
      </div>
    </div>
  );
}
