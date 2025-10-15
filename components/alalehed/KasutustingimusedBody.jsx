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
          Vastused luuakse Eestis majutatud SotsiaalAI teadmistebaasi põhjal, mis koondab
          usaldusväärseid allikaid (nt seadused, juhendid, teenuste kirjeldused ja muu
          valdkondlik teave).
        </p>

        <h2 className="glass-h2">3. Konto ja ligipääs</h2>
        <ul className="glass-list">
          <li>Kasutaja hoiab oma konto turvalisena ja parooli enda teada.</li>
          <li>Kasutaja ei jaga oma kontot ega sisselogimisandmeid kolmandatele isikutele.</li>
          <li>Kasutaja hoiab kontakt- ja makseandmed ajakohasena.</li>
        </ul>

        <h2 className="glass-h2">4. Lubatud kasutus</h2>
        <ul className="glass-list">
          <li>Keelatud on turbe rikkumine, pahavara levitamine ja masspäringute esitamine.</li>
          <li>Keelatud on ebaseadusliku sisu edastamine või teiste õiguste rikkumine.</li>
        </ul>

        <h2 className="glass-h2">5. Tellimus, maksed ja tühistamine</h2>
        <p>
          Teenus põhineb igakuisel tellimusel (kuutasu 7,99 €). Arveldamine toimub
          Maksekeskus AS vahendusel valitud makseviisilt.
        </p>
        <p>
          Tellimust saab igal ajal hallata profiililehel (“Halda tellimust”) või kirjutades
          <a className="link-brand" href="mailto:info@sotsiaal.ai"> info@sotsiaal.ai</a>.
          Tühistamisel peatub arveldamine alates järgmise arveldusperioodi algusest.
        </p>

        <h2 className="glass-h2">6. Kättesaadavus ja hooldus</h2>
        <p>
          Teeme mõistlikke pingutusi töökindluse ja pideva kättesaadavuse tagamiseks.
          Hooldustööd ja uuendused võivad teenust ajutiselt piirata, kuid püüame katkestused
          hoida võimalikult lühikesed.
        </p>

        <h2 className="glass-h2">7. Töökindlus ja täpsus</h2>
        <p>
          SotsiaalAI eesmärk on pakkuda täpset ja ajakohast teavet. Kui süsteemis tekib viga või
          ebatäpsus, parandame selle esimesel võimalusel.
        </p>

        <h2 className="glass-h2">8. Tingimuste muutmine</h2>
        <p>
          Kasutustingimusi võidakse ajakohastada, avaldades uue versiooni platvormil. Olulistest
          muudatustest teavitatakse kasutajaid e-posti või platvormisisese teate kaudu.
        </p>

        <h2 className="glass-h2">9. Tehisintellekti kasutus ja andmetöötlus</h2>
        <p>
          <strong>SotsiaalAI</strong> kasutab <strong>OpenAI</strong> arendatud keeletehnoloogiat (GPT-mudel),
          mis loob vastuseid kasutaja poolt sisestatud keeles, tuginedes Eestis majutatud
          SotsiaalAI teadmistebaasile.
        </p>
        <p>
          OpenAI teenust kasutatakse üksnes tekstitöötluseks. Vestluste sisu ei kasutata
          mudelite arendamiseks ega koolitamiseks ning püsivalt talletatud andmed
          (kasutajakonto, tellimus ja vestluste kokkuvõtted) säilitatakse turvaliselt
          SotsiaalAI hallatavates Eesti serverites.
        </p>
      </section>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push("/meist")
          }
          aria-label="Tagasi"
        >
          <span className="back-arrow-circle" />
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
