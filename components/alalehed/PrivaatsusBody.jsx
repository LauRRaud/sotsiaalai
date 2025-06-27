"use client";

export default function PrivaatsusBody() {
  return (
    <div className="meist-hero">
      <div className="meist-inner">
        <div className="meist-box">
          <h1 className="meist-title centered">Privaatsustingimused</h1>

          <section className="meist-section">
            <h2 className="meist-heading">1. Üldsätted</h2>
            <p>1.1 Sotsiaal.AI platvorm (haldaja: SotsiaalAI OÜ) järgib Eesti ja Euroopa Liidu isikuandmete kaitse seadusi (sh GDPR).</p>
            <p>1.2 Tingimused kirjeldavad, kuidas me kogume, kasutame ja kaitseme isikuandmeid.</p>

            <h2 className="meist-heading">2. Kogutavad andmed</h2>
            <p>2.1 Kasutajakonto info: nimi, e-posti aadress, krüpteeritud parool.</p>
            <p>2.2 Tellimused ja maksed: makseandmed, tellimuse tüüp, ajatemperatuur.</p>
            <p>2.3 Tehnilised metaandmed: IP-aadress, brauseri tüüp, logid turbe- ja tõrkeotstarbel.</p>

            <h2 className="meist-heading">3. Andmete kasutamine</h2>
            <p>3.1 Kasutajakonto haldus ja autentimine.</p>
            <p>3.2 Tellimuste töötlemine ja teenuste pakkumine.</p>
            <p>3.3 Platvormi arendus ja tehniline turvalisus.</p>
            <p>3.4 Kasutajatoe pakkumine.</p>

            <h2 className="meist-heading">4. Vestluste privaatsus</h2>
            <p>4.1 Vestluste sisu ei salvestata, logita ega kasutata turunduse või analüütika eesmärgil.</p>

            <h2 className="meist-heading">5. Tehisintellekti teenused</h2>
            <p>5.1 Kasutame kolmanda osapoole teenuseid (nt OpenAI), mis võivad töödelda teksti serverites väljaspool EL-i.</p>

            <h2 className="meist-heading">6. Andmete jagamine</h2>
            <p>6.1 Andmeid ei edastata kolmandatele isikutele, välja arvatud seadusest tulenevatel juhtudel.</p>
            <p>6.2 Makseandmeid haldab Maksekeskus AS; platvorm neid ei salvesta.</p>

            <h2 className="meist-heading">7. Andmete säilitamine</h2>
            <p>7.1 Andmeid säilitatakse kuni konto kustutamiseni või seaduses sätestatud perioodi lõpuni.</p>

            <h2 className="meist-heading">8. Kasutaja õigused</h2>
            <p>8.1 Õigus tutvuda, parandada või kustutada oma andmed.</p>
            <p>8.2 Õigus võtta tagasi nõusolek ja esitada kaebus Andmekaitse Inspektsioonile.</p>

            <h2 className="meist-heading">9. Küpsised</h2>
            <p>9.1 Kasutame ainult vajalikke küpsiseid (nt sisselogimiseks või sessioonihalduseks).</p>

            <h2 className="meist-heading">10. Turvalisus</h2>
            <p>10.1 Kasutame asjakohaseid tehnilisi ja organisatsioonilisi meetmeid andmete kaitsmiseks.</p>

            <h2 className="meist-heading">11. Tingimuste muudatused</h2>
            <p>11.1 Platvormi haldaja võib privaatsustingimusi ajakohastada. Olulistest muudatustest teavitatakse kasutajaid mõistliku aja jooksul.</p>
          </section>

          <footer className="meist-footer">
            &copy; 2025 sotsiaal.ai
          </footer>
        </div>
      </div>

      <style jsx>{`
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
          color: rgba(127, 42, 177, 0.97);
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

        .meist-footer {
          text-align: center;
          font-size: 1em;
          color: rgba(127, 42, 177, 0.97);
          margin-top: 3em;
        }

        a {
          color: rgba(127, 42, 177, 0.97);
          text-decoration: underline dotted;
        }

        a:hover {
          color: #c48dfa;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
