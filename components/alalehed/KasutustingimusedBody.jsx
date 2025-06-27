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

          <div>
            <a href="/meist" className="back-link">&larr; Tagasi</a>
          </div>

          <footer className="tingimused-footer">
            &copy; 2025 sotsiaal.ai
          </footer>
        </div>
      </div>
    </div>
  );
}
