"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KasutustingimusedBody() {
  const router = useRouter();

  return (
    <div className="main-content glass-box">
      <h1 className="glass-title">Kasutustingimused</h1>

      <section className="glass-section">
        <h2 className="glass-h2">1. Üldsätted</h2>
        <p>
          Käesolevad kasutustingimused reguleerivad <strong>SotsiaalAI</strong> platvormi
          (haldaja: <strong>SotsiaalAI OÜ</strong>; edaspidi <strong>Platvorm</strong>) kasutamist.
          Platvormi kasutades kinnitab kasutaja, et on tingimustega tutvunud ja nendega nõus.
        </p>

        <h2 className="glass-h2">2. Teenuse kirjeldus</h2>
        <p>
          Platvorm pakub tehisintellektil põhinevat infotuge sotsiaalvaldkonnas.
          Vastused koostatakse automaatselt ning võivad sisaldada ebatäpsusi.
          Teenus ei asenda ametlikku, juriidilist ega professionaalset nõustamist.
        </p>

        <h2 className="glass-h2">3. Konto ja ligipääs</h2>
        <ul className="glass-list">
          <li>Kasutaja vastutab oma konto turvalisuse ja tegevuste eest kontol.</li>
          <li>Kasutaja hoiab andmed ajakohased ja ei jaga ligipääsuõigusi loata.</li>
        </ul>

        <h2 className="glass-h2">4. Lubatud kasutus</h2>
        <ul className="glass-list">
          <li>Keelatud on turbe rikkumine, pahavara levitamine ja masspäringud.</li>
          <li>Keelatud on ebaseadusliku sisu edastamine või teiste õiguste rikkumine.</li>
        </ul>

        <h2 className="glass-h2">5. Tellimus, maksed ja tühistamine</h2>
        <p>
          Teenus põhineb igakuisel tellimusel (kuutasu 7,99 €). Arveldamine toimub
          Maksekeskus AS vahendusel valitud makseviisilt.
        </p>
        <p>
          Tellimust saab igal ajal tühistada profiililehel (“Halda tellimust”) või kirjutades
          <a className="link-brand" href="mailto:info@sotsiaal.ai"> info@sotsiaal.ai</a>.
          Tühistamisel peatub arveldamine alates järgmise arveldusperioodi algusest.
        </p>

        <h2 className="glass-h2">6. Kättesaadavus ja hooldus</h2>
        <p>
          Teeme mõistlikke pingutusi töökindluse tagamiseks, kuid katkestustevaba toimimist ei
          garanteerita. Hooldustööd ja uuendused võivad teenust ajutiselt piirata.
        </p>

        <h2 className="glass-h2">7. Vastutuse piirang</h2>
        <p>
          Platvormi kasutamine toimub kasutaja omal vastutusel. SotsiaalAI OÜ ei vastuta otsese
          ega kaudse kahju eest (sh saamata jäänud tulu, andmekadu), mis tuleneb teenuse kasutamisest.
        </p>

        <h2 className="glass-h2">8. Tingimuste muutmine</h2>
        <p>
          Võime tingimusi ajakohastada, avaldades uue versiooni platvormil. Olulistest muudatustest
          teavitatakse mõistliku aja jooksul e-posti või platvormisisese teate kaudu.
        </p>
      </section>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/meist"))}
          aria-label="Tagasi"
        >
          <span className="back-arrow-circle" />
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
