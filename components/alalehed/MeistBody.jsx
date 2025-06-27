"use client";

export default function MeistBody() {
  return (
    <div className="meist-hero">
      <div className="meist-inner">
        <div className="meist-box">
          <h1 className="meist-title centered">Meist</h1>
          <section className="meist-section">
            <p>
              Sotsiaal.AI on kaasaegne tehisintellektil põhinev platvorm, loodud selleks, et pakkuda kiiret, usaldusväärset ja selgelt mõistetavat tuge nii sotsiaalvaldkonna spetsialistidele kui ka inimestele, kes otsivad abi elulistes sotsiaalküsimustes.
            </p>
            <p>
              Meie AI-assistendid — SotsiaalAI ja SotsiaalA&lt;B&gt;I — töötavad ööpäevaringselt ning aitavad leida vastuseid seadustest, toetustest ja sotsiaalteenustest, tuginedes nii õigusaktidele kui ka praktilistele lahendustele. Teenus on anonüümne, kasutajasõbralik ning ligipääsetav kõigile.
            </p>
            <p>
              Sotsiaalvaldkonda iseloomustab suur töökoormus, killustunud info ja keeruline orienteerumine süsteemis — seda kinnitab ka{" "}
              <a
                href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande"
                target="_blank"
                rel="noopener noreferrer"
              >
                OSKA raport
              </a>
              . Sellises keskkonnas on kvaliteetne ja kättesaadav nõuandeplatvorm hädavajalik. Meie eesmärk on pakkuda selgust, lihtsustada igapäevatööd ning toetada otsuste langetamist nii professionaalide kui abivajajate jaoks.
            </p>
            <p>
              Sotsiaal.AI-d arendab ja haldab SotsiaalAI OÜ. Platvorm areneb pidevalt, et tagada ajakohane ja praktiline tugi kõigile kasutajatele.
            </p>
          </section>

          <section className="meist-section">
            <h2 className="meist-heading">Kontakt</h2>
            <ul className="meist-contact">
              <li>
                <strong>E-post:</strong>{" "}
                <a href="mailto:info@sotsiaal.ai">info@sotsiaal.ai</a>
              </li>
            </ul>
          </section>

          <section className="meist-section">
            <p className="meist-disclaimer">
              <strong>Enne lehe kasutamist tutvu kindlasti:</strong>
            </p>
            <ul className="meist-links">
              <li>
                <a href="/privaatsus">Privaatsuspoliitika</a>
              </li>
              <li>
                <a href="/kasutustingimused">Kasutustingimused</a>
              </li>
            </ul>
          </section>

          <div>
            <a href="/" className="back-link">&larr; Tagasi</a>
          </div>

          <footer className="meist-footer">
            &copy; 2025 sotsiaal.ai
          </footer>
        </div>
      </div>
    </div>
  );
}
