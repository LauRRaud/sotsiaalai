"use client";
import { useRouter } from "next/navigation";

export default function PrivaatsusBody() {
  const router = useRouter();

  return (
    <div
      className="main-content glass-box"
      role="main"
      aria-labelledby="privacy-title"
      lang="et"
    >
      <h1 id="privacy-title" className="glass-title">
        Privaatsustingimused
      </h1>

      <section className="glass-section">
   <h2 className="glass-h2">1. Üldsätted</h2>
<p>
  Käesolevad privaatsustingimused kehtivad <strong>SotsiaalAI OÜ</strong> hallatava veebiplatvormi 
  (edaspidi <strong>SotsiaalAI</strong> või <strong>Platvorm</strong>) kasutamisel. 
  Privaatsustingimused selgitavad, kuidas SotsiaalAI kogub, kasutab ja kaitseb isikuandmeid 
  vastavalt Eesti ja Euroopa Liidu õigusaktidele.
</p>
<p>
  SotsiaalAI töötleb isikuandmeid kooskõlas Eesti isikuandmete kaitse{" "}
  <a
    className="link-brand"
    href="https://www.riigiteataja.ee/akt/112072025014"
    target="_blank"
    rel="noopener noreferrer"
  >
    seadusega
  </a>{" "}
  ning Euroopa Liidu isikuandmete kaitse{" "}
  <a
    className="link-brand"
    href="https://eur-lex.europa.eu/legal-content/ET/TXT/HTML/?uri=CELEX:02016R0679-20160504"
    target="_blank"
    rel="noopener noreferrer"
  >
    üldmäärusega
  </a>
  .
</p>

        <h2 className="glass-h2">2. Kogutavad andmed</h2>
        <p>
          <strong>2.1 Kasutajakonto andmed.</strong> E-posti aadress, roll (spetsialist või pöörduja),
          autentimisviis (nt Google, Smart-ID, Mobiil-ID). Nime ega isikukoodi ei koguta ega salvestata.
        </p>
        <p>
          <strong>2.2 Tellimused ja maksed.</strong> Tellimuse tüüp ja staatus, makse-ID. Makseid töötleb
          Maksekeskus AS; SotsiaalAI ei salvesta kaardi- ega pangakontoandmeid.
        </p>
        <p>
          <strong>2.3 Tehnilised metaandmed.</strong> IP-aadress, brauseri tüüp, seadmeinfo ja logiteave
          turbe ning tõrke diagnoosimise eesmärgil.
        </p>

        <h2 className="glass-h2">3. Eesmärgid ja õiguslikud alused</h2>
        <ul className="glass-list">
          <li>
            Teenuse osutamine (vestluse vahendamine, ligipääs kontole) — lepingu täitmine (GDPR art 6(1)(b)).
          </li>
          <li>
            Maksete töötlemine — lepingu täitmine ja õigustatud huvi pettuste ennetamiseks (art 6(1)(b),(f)).
          </li>
          <li>
            Turvalisus, veatuvastus ja töökindlus — õigustatud huvi (art 6(1)(f)).
          </li>
          <li>
            Õigusnõuete kaitse ja aruandlus — õiguslik kohustus/õigustatud huvi (art 6(1)(c),(f)).
          </li>
        </ul>

        <h2 className="glass-h2">4. Vestluste privaatsus</h2>
        <p>
          Vestluste sisu ei salvestata püsivalt ega kasutata turundus- või analüütikaks. Vestluste
          tehniline töötlemine võib toimuda volitatud teenusepakkuja kaudu (nt vastuse koostamise teenus).
        </p>

        <h2 className="glass-h2">5. Volitatud töötlejad</h2>
        <p>
          SotsiaalAI võib kasutada volitatud töötlejaid, kes töötlevad andmeid SotsiaalAI juhiste alusel,
          sh makseteenuse pakkuja (Maksekeskus AS) ja tehisintellekti teenusepakkuja. Volitatud töötlejatega
          sõlmitakse lepingud, mis tagavad andmekaitse taseme ning konfidentsiaalsuse.
        </p>

        <h2 className="glass-h2">6. Andmete edastamine ja jagamine</h2>
        <p>
          Isikuandmeid ei edastata kolmandatele isikutele, v.a kui see on vajalik teenuse osutamiseks,
          tuleneb seadusest või on selleks kasutaja nõusolek. Makseandmeid töötleb Maksekeskus AS vastavalt
          oma tingimustele.
        </p>

        <h2 className="glass-h2">7. Säilitamine</h2>
        <p>
          Kontoandmeid säilitatakse kuni konto kustutamiseni või kasutaja taotluseni. Arveldusandmeid
          säilitatakse raamatupidamise seadusest tuleneva kohustuse ulatuses. Tehnilisi logisid säilitatakse
          lühiajaliselt turbe ja tõrke diagnoosimise eesmärgil.
        </p>

        <h2 className="glass-h2">8. Kasutaja õigused</h2>
<ul className="glass-list">
  <li>Õigus tutvuda enda andmetega ja saada koopia.</li>
  <li>Õigus parandada ebaõigeid või mittetäielikke andmeid.</li>
  <li>Õigus nõuda andmete kustutamist (“õigus olla unustatud”).</li>
  <li>Õigus piirata töötlemist või esitada vastuväiteid.</li>
  <li>
    Õigus esitada kaebus{" "}
    <a
      className="link-brand"
      href="https://www.aki.ee"
      target="_blank"
      rel="noopener noreferrer"
    >
      Andmekaitse Inspektsioonile
    </a>
    .
  </li>
</ul>


        <h2 className="glass-h2">9. Küpsised</h2>
        <p>
          Kasutame üksnes vajalikke küpsiseid (sisselogimine, sessioon, keele-eelistus). Reklaami-, jälgimis-
          ega analüütikaküpsiseid ei kasutata.
        </p>

        <h2 className="glass-h2">10. Turvalisus</h2>
        <p>
          Rakendame tehnilisi ja korralduslikke meetmeid (HTTPS, juurdepääsu piiramine, logimine ja varundus),
          et kaitsta andmeid loata juurdepääsu, muutmise või hävimise eest.
        </p>

        <h2 className="glass-h2">11. Muudatused</h2>
        <p>
          Privaatsustingimusi võidakse ajakohastada. Olulistest muudatustest teavitatakse platvormis või e-posti teel.
        </p>
      </section>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/meist");
            }
          }}
          aria-label="Tagasi eelmisele lehele"
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
