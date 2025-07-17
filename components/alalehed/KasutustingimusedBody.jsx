"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KasutustingimusedBody() {
    const router = useRouter();
  return (
    <div className="page-bg-gradient">
      <div className="glass-box" role="main" aria-labelledby="kasutustingimused-title">
        <h1 id="kasutustingimused-title" className="glass-title">
          Kasutustingimused
        </h1>

        <section className="glass-section">
          <h2 className="glass-h2">1. Üldsätted</h2>
          <p>
            Käesolevad kasutustingimused reguleerivad Sotsiaal.AI platvormi (edaspidi: <strong>Platvorm</strong>) kasutamist. Platvormi kasutades nõustub kasutaja käesolevate tingimustega ning kinnitab, et on need hoolikalt läbi lugenud ja mõistab nende sisu.
          </p>

          <h2 className="glass-h2">2. Teenuse sisu ja eesmärk</h2>
          <p>
            Platvormi tehisintellektil põhinev nõustaja kasutab OpenAI tehnoloogiat, et pakkuda informatiivset tuge nii sotsiaalvaldkonna spetsialistidele kui ka eluliste küsimustega pöördujatele.
          </p>
          <p>
            Platvormil esitatud vastused tuginevad usaldusväärsele teabele, kuid ei asenda ametlikku ega juriidilist nõustamist. Kasutaja vastutab AI poolt antud teabe kasutamise eest täielikult ise.
          </p>

          <h2 className="glass-h2">3. Andmekaitse ja privaatsus</h2>
          <p>
            Platvorm ei salvesta kasutajate vestluste sisu ega kasuta neid turunduslikel ega analüütilistel eesmärkidel. Vajadusel võib logida tehnilisi metaandmeid (nt päringute maht, veateated) teenuse stabiilsuse ja turvalisuse tagamiseks.
          </p>
          <p>
            Vestlused edastatakse töötlemiseks vastava teenuse serveritesse, mis võivad paikneda väljaspool Euroopa Liitu. Platvormi haldaja ei vastuta kolmandate osapoolte teenuste ega nende poolt kogutud ja töödeldud andmete eest.
          </p>

          <h2 className="glass-h2">4. Kasutaja õigused ja kohustused</h2>
          <ul className="glass-list">
            <li>Kasutaja kohustub kasutama Platvormi üksnes seadusega lubatud ning heade kommetega kooskõlas olevatel eesmärkidel.</li>
            <li>Keelatud on Platvormi kasutamine automatiseeritud, masspäringute, pahatahtlike või ebaseaduslike tegevuste jaoks.</li>
            <li>Kasutaja kohustub esitama oma andmed õigesti ja hoidma neid ajakohastena.</li>
            <li>Kasutaja vastutab täielikult Platvormi kaudu esitatud info ja selle kasutamise eest.</li>
          </ul>

          <h2 className="glass-h2">5. Teenuse kättesaadavus ja muudatused</h2>
          <p>
            Platvormi haldajal on õigus igal ajal ilma ette teatamata muuta, piirata või katkestada teenuse osutamist või kasutaja ligipääsu, kui tuvastatakse tingimuste rikkumine, teenuse kuritarvitamine või tehnilised probleemid.
          </p>
          <p>
            Platvormi töökindlus ja toimimine võib sõltuda kolmandate osapoolte tarkvarast või teenusest, mille katkestuste või tehniliste probleemide eest platvormi haldaja ei vastuta.
          </p>

          <h2 className="glass-h2">6. Vastutus</h2>
          <p>
            Platvormil pakutava tehisintellekti teenuse kasutamine toimub kasutaja enda riskil. Platvormi haldaja ei vastuta kasutaja poolt teenuse kasutamisel tehtud otsuste või saamata jäänud tulu, kahjude, õiguslike või muude tagajärgede eest.
          </p>

          <h2 className="glass-h2">7. Tingimuste muutmine</h2>
          <p>
            Platvormi haldajal on õigus kasutustingimusi igal ajal muuta, avaldades uue versiooni Platvormil.
          </p>
        </section>

<div className="back-btn-wrapper">
  <button
    type="button"
    className="back-arrow-btn"
    onClick={() => router.push("/meist")}
    aria-label="Tagasi Meist lehele"
  >
    <span className="back-arrow-circle"></span>
  </button>
</div>

        <footer className="alaleht-footer">
          Sotsiaal.AI &copy; 2025
        </footer>
      </div>
    </div>
  );
}
