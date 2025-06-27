"use client";

export default function KasutustingimusedBody() {
  return (
    <div className="tingimused-hero">
      <div className="tingimused-inner">
        <div className="tingimused-box">
          <h1 className="tingimused-title centered">Kasutustingimused</h1>

          <section className="tingimused-section">
            <p>
              Sotsiaal.AI veebiplatvormi kasutamisel nõustud alljärgnevate kasutustingimustega. Platvorm on loodud selleks, et pakkuda informatiivset tuge sotsiaalvaldkonna teemadel ning ei asenda professionaalset nõustamist ega juriidilist konsultatsiooni.
            </p>
            <p>
              Meie AI-assistendid vastavad küsimustele tuginedes seadustele ja praktikatele, kuid vastused ei pruugi hõlmata kõiki konkreetse juhtumiga seotud nüansse. Kasutaja vastutab esitatud info alusel tehtud otsuste eest.
            </p>
            <p>
              Platvormil kogutud andmeid ei seota kasutaja isikuga, kuid palume siiski vältida isikuandmete esitamist vestlustes AI-assistentidega.
            </p>
            <p>
              SotsiaalAI OÜ võib kasutustingimusi vajadusel ajakohastada. Olulistest muudatustest anname teada sobival viisil.
            </p>
          </section>

          <footer className="tingimused-footer">
            &copy; 2025 sotsiaal.ai
          </footer>
        </div>
      </div>

      <style jsx>{`
        .tingimused-hero {
          background: linear-gradient(145deg, #1c1c22, #131318);
          color: #d0d1dc;
          min-height: 100vh;
          padding: 4em 1em 2em 1em;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .tingimused-inner {
          width: 100%;
          max-width: 900px;
          padding: 0 1em;
        }

        .tingimused-box {
          background: rgba(30, 30, 38, 0.88);
          border-radius: 1.4em;
          padding: 2.5em;
          box-shadow: 0 10px 40px rgba(10, 10, 20, 0.4);
          font-size: 1.15rem;
        }

        .tingimused-title {
          font-size: 2.6em;
          color: rgba(127, 42, 177, 0.97);
          margin-bottom: 1.2em;
        }

        .centered {
          text-align: center;
        }

        .tingimused-section {
          margin-bottom: 2.5em;
          line-height: 1.75;
        }

        .tingimused-section p {
          margin-bottom: 1.2em;
        }

        .tingimused-footer {
          text-align: center;
          font-size: 1em;
          color: rgba(127, 42, 177, 0.97);
          margin-top: 3em;
        }
      `}</style>
    </div>
  );
}
