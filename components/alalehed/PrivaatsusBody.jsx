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
        <p>1.1 Sotsiaal.AI platvorm (haldaja: SotsiaalAI OÜ) järgib Eesti ja Euroopa Liidu isikuandmete kaitse seadusi (sh GDPR).</p>
        <p>1.2 Tingimused kirjeldavad, kuidas me kogume, kasutame ja kaitseme isikuandmeid.</p>

        <h2 className="glass-h2">2. Kogutavad andmed</h2>
        <p>2.1 Kasutajakonto info: nimi, e-posti aadress, krüpteeritud parool.</p>
        <p>2.2 Tellimused ja maksed: makseandmed, tellimuse tüüp.</p>
        <p>2.3 Tehnilised metaandmed: IP-aadress, brauseri tüüp, logid turbe- ja tõrkeotstarbel.</p>

        <h2 className="glass-h2">3. Andmete kasutamine</h2>
        <p>3.1 Kasutajakonto haldus ja autentimine.</p>
        <p>3.2 Tellimuste töötlemine ja teenuste pakkumine.</p>
        <p>3.3 Platvormi arendus ja tehniline turvalisus.</p>
        <p>3.4 Kasutajatoe pakkumine.</p>

        <h2 className="glass-h2">4. Vestluste privaatsus</h2>
        <p>4.1 Vestluste sisu ei salvestata, logita ega kasutata turunduse või analüütika eesmärgil.</p>

        <h2 className="glass-h2">5. Tehisintellekti teenused</h2>
        <p>5.1 Kasutame kolmanda osapoole teenuseid (nt OpenAI), mis võivad töödelda teksti serverites väljaspool EL-i.</p>

        <h2 className="glass-h2">6. Andmete jagamine</h2>
        <p>6.1 Andmeid ei edastata kolmandatele isikutele, välja arvatud seadusest tulenevatel juhtudel.</p>
        <p>6.2 Makseandmeid haldab Maksekeskus AS; platvorm neid ei salvesta.</p>

        <h2 className="glass-h2">7. Andmete säilitamine</h2>
        <p>7.1 Andmeid säilitatakse kuni konto kustutamiseni või seaduses sätestatud perioodi lõpuni.</p>

        <h2 className="glass-h2">8. Kasutaja õigused</h2>
        <p>8.1 Õigus tutvuda, parandada või kustutada oma andmed.</p>
        <p>8.2 Õigus võtta tagasi nõusolek ja esitada kaebus Andmekaitse Inspektsioonile.</p>

        <h2 className="glass-h2">9. Küpsised</h2>
        <p>9.1 Kasutame ainult vajalikke küpsiseid (nt sisselogimiseks või sessioonihalduseks).</p>

        <h2 className="glass-h2">10. Turvalisus</h2>
        <p>10.1 Kasutame asjakohaseid tehnilisi ja organisatsioonilisi meetmeid andmete kaitsmiseks.</p>

        <h2 className="glass-h2">11. Tingimuste muudatused</h2>
        <p>11.1 Platvormi haldaja võib privaatsustingimusi ajakohastada. Olulistest muudatustest teavitatakse kasutajaid mõistliku aja jooksul.</p>
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

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
