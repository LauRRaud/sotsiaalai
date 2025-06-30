"use client";

import Link from "next/link";

export default function PrivaatsusBody() {
  return (
    <div className="page-bg-gradient">
      <div className="glass-box" role="main" aria-labelledby="privacy-title">
        <h1 id="privacy-title" className="glass-title">
          Privaatsustingimused
        </h1>
        <section className="glass-section">
          <p>
            <span className="glass-h2-number">1.</span> <span className="glass-h2-span">Üldsätted</span>
          </p>
          <p>1.1 Sotsiaal.AI platvorm (haldaja: SotsiaalAI OÜ) järgib Eesti ja Euroopa Liidu isikuandmete kaitse seadusi (sh GDPR).</p>
          <p>1.2 Tingimused kirjeldavad, kuidas me kogume, kasutame ja kaitseme isikuandmeid.</p>
          <p>
            <span className="glass-h2-number">2.</span> <span className="glass-h2-span">Kogutavad andmed</span>
          </p>
          <p>2.1 Kasutajakonto info: nimi, e-posti aadress, krüpteeritud parool.</p>
          <p>2.2 Tellimused ja maksed: makseandmed, tellimuse tüüp.</p>
          <p>2.3 Tehnilised metaandmed: IP-aadress, brauseri tüüp, logid turbe- ja tõrkeotstarbel.</p>
          <p>
            <span className="glass-h2-number">3.</span> <span className="glass-h2-span">Andmete kasutamine</span>
          </p>
          <p>3.1 Kasutajakonto haldus ja autentimine.</p>
          <p>3.2 Tellimuste töötlemine ja teenuste pakkumine.</p>
          <p>3.3 Platvormi arendus ja tehniline turvalisus.</p>
          <p>3.4 Kasutajatoe pakkumine.</p>
          <p>
            <span className="glass-h2-number">4.</span> <span className="glass-h2-span">Vestluste privaatsus</span>
          </p>
          <p>4.1 Vestluste sisu ei salvestata, logita ega kasutata turunduse või analüütika eesmärgil.</p>
          <p>
            <span className="glass-h2-number">5.</span> <span className="glass-h2-span">Tehisintellekti teenused</span>
          </p>
          <p>5.1 Kasutame kolmanda osapoole teenuseid (nt OpenAI), mis võivad töödelda teksti serverites väljaspool EL-i.</p>
          <p>
            <span className="glass-h2-number">6.</span> <span className="glass-h2-span">Andmete jagamine</span>
          </p>
          <p>6.1 Andmeid ei edastata kolmandatele isikutele, välja arvatud seadusest tulenevatel juhtudel.</p>
          <p>6.2 Makseandmeid haldab Maksekeskus AS; platvorm neid ei salvesta.</p>
          <p>
            <span className="glass-h2-number">7.</span> <span className="glass-h2-span">Andmete säilitamine</span>
          </p>
          <p>7.1 Andmeid säilitatakse kuni konto kustutamiseni või seaduses sätestatud perioodi lõpuni.</p>
          <p>
            <span className="glass-h2-number">8.</span> <span className="glass-h2-span">Kasutaja õigused</span>
          </p>
          <p>8.1 Õigus tutvuda, parandada või kustutada oma andmed.</p>
          <p>8.2 Õigus võtta tagasi nõusolek ja esitada kaebus Andmekaitse Inspektsioonile.</p>
          <p>
            <span className="glass-h2-number">9.</span> <span className="glass-h2-span">Küpsised</span>
          </p>
          <p>9.1 Kasutame ainult vajalikke küpsiseid (nt sisselogimiseks või sessioonihalduseks).</p>
          <p>
            <span className="glass-h2-number">10.</span> <span className="glass-h2-span">Turvalisus</span>
          </p>
          <p>10.1 Kasutame asjakohaseid tehnilisi ja organisatsioonilisi meetmeid andmete kaitsmiseks.</p>
          <p>
            <span className="glass-h2-number">11.</span> <span className="glass-h2-span">Tingimuste muudatused</span>
          </p>
          <p>11.1 Platvormi haldaja võib privaatsustingimusi ajakohastada. Olulistest muudatustest teavitatakse kasutajaid mõistliku aja jooksul.</p>
        </section>
        <div>
          <Link href="/meist" className="back-link">&larr; Tagasi</Link>
        </div>
        <footer className="alaleht-footer">
          Sotsiaal.AI &copy; 2025
        </footer>
      </div>
    </div>
  );
}
