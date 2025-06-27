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
              Sotsiaalvaldkonda iseloomustab suur töökoormus, killustunud info ja keeruline orienteerumine süsteemis — seda kinnitab ka OSKA raport. Sellises keskkonnas on kvaliteetne ja kättesaadav nõuandeplatvorm hädavajalik. Meie eesmärk on pakkuda selgust, lihtsustada igapäevatööd ning toetada otsuste langetamist nii professionaalide kui abivajajate jaoks.
            </p>
            <p>
              Sotsiaal.AI-d arendab ja haldab SotsiaalAI OÜ. Platvorm areneb pidevalt, et tagada ajakohane ja praktiline tugi kõigile kasutajatele.
            </p>
          </section>

          <section className="meist-section">
            <h2 className="meist-heading">Kontakt</h2>
            <ul className="meist-contact">
              <li><strong>E-post:</strong> <a href="mailto:info@sotsiaal.ai">info@sotsiaal.ai</a></li>
            </ul>
          </section>

          <section className="meist-section">
            <p className="meist-disclaimer">
              <strong>Enne lehe kasutamist tutvu kindlasti:</strong>
            </p>
            <ul className="meist-links">
              <li><a href="/privaatsus">Privaatsuspoliitika</a></li>
              <li><a href="/kasutustingimused">Kasutustingimused</a></li>
            </ul>
          </section>

          <footer className="meist-footer">
            &copy; 2025 sotsiaal.ai
          </footer>
        </div>
      </div>

      <style jsx>{`
        .meist-contact,
        .meist-links {
          list-style: none;
          padding-left: 0;
        }

        .meist-hero {
          background: linear-gradient(145deg, #1c1c22, #131318);
          color: #d0d1dc;
          min-height: 100vh;
          padding: 4em 1em 2em 1em;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .meist-inner {
          width: 100%;
          max-width: 900px;
          padding: 0 1em;
        }

        .meist-box {
          background: rgba(30, 30, 38, 0.88);
          border-radius: 1.4em;
          padding: 2.5em;
          box-shadow: 0 10px 40px rgba(10, 10, 20, 0.4);
          font-size: 1.15rem;
        }

        .meist-title {
          font-size: 2.6em;
          color:rgba(127, 42, 177, 0.97);
          margin-bottom: 1.2em;
        }

        .centered {
          text-align: center;
        }

        .meist-section {
          margin-bottom: 2.5em;
          line-height: 1.75;
        }

        .meist-section p {
          margin-bottom: 1.2em;
        }

        .meist-heading {
          font-size: 1.6em;
          color: rgba(127, 42, 177, 0.97);
          margin-bottom: 1em;
        }

        .meist-contact li,
        .meist-links li {
          margin-bottom: 0.5em;
        }

        .meist-contact a,
        .meist-links a {
          color: rgba(127, 42, 177, 0.97);
          text-decoration: underline dotted;
          transition: color 0.2s;
        }

        .meist-contact a:hover,
        .meist-links a:hover {
          color: #c48dfa;
          text-decoration: underline;
        }

        .meist-disclaimer {
          margin-bottom: 0.8em;
        }

        .meist-footer {
          text-align: center;
          font-size: 1em;
          color: rgba(127, 42, 177, 0.97);
          margin-top: 3em;
        }
      `}</style>
    </div>
  );
}
