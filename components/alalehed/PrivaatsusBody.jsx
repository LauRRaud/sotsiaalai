// components/alalehed/PrivaatsusBody.jsx

export default function PrivaatsusBody() {
  return (
    <>
      <h1>Privaatsustingimused</h1>

      <h2>1. Üldsätted</h2>
      <p>
        Käesolevad privaatsustingimused selgitavad, kuidas Sotsiaal.ai (platvormi haldaja: <strong>SotsiaalAI OÜ</strong>) kogub, kasutab, hoiab ja kaitseb kasutajate andmeid. Platvorm järgib Eesti ja Euroopa Liidu isikuandmete kaitse seadusi (GDPR).
      </p>

      <h2>2. Kogutavad andmed</h2>
      <ul>
        <li><strong>Kasutajakonto info:</strong> nimi, e-posti aadress, parool (krüpteeritult).</li>
        <li><strong>Maksed ja tellimused:</strong> tellimuse liik, makse teostamise aeg (pangalingi, kaardimakse vms kaudu).</li>
        <li><strong>Tehnilised metaandmed:</strong> IP-aadress, brauseri tüüp, tehniline logi (vajadusel süsteemi turvalisuse või tõrkeotsingu eesmärgil).</li>
      </ul>

      <h2>3. Andmete kasutamise eesmärgid</h2>
      <ul>
        <li>Kasutajakonto haldus ja autentimine.</li>
        <li>Tasulise teenuse osutamine ning tellimuste haldamine.</li>
        <li>Teenuse arendamine ja turvalisuse tagamine.</li>
        <li>Kasutajatoe pakkumine.</li>
      </ul>

      <h2>4. Vestluste privaatsus</h2>
      <p>
        Vestluste sisu ei salvestata, logita ega kasutata turunduslikel ega analüütilistel eesmärkidel. Vajadusel võib logida tehnilisi metaandmeid (nt päringute maht, veateated) platvormi stabiilsuse ja turvalisuse tagamiseks.
      </p>

      <h2>5. Tehisintellekti teenused ja andmete liikumine</h2>
      <p>
        Sotsiaal.ai kasutab tehisintellekti teenuseid (nt OpenAI API), mis võivad töödelda kasutaja sisestatud teksti serverites, mis paiknevad väljaspool Euroopa Liitu. Andmete edastamine ja töötlemine toimub kooskõlas GDPR nõuetega ning vastavalt kolmanda osapoole teenuse tingimustele.
      </p>

      <h2>6. Andmete jagamine</h2>
      <ul>
        <li>Kasutajate andmeid ei edastata ega müüda kolmandatele isikutele, välja arvatud seadusest tulenevatel juhtudel (nt õigusorganile kohustusliku avaldamise korral).</li>
        <li>Makseandmeid töödeldakse Maksekeskus AS-i (või muu makseteenuse pakkuja) turvalises keskkonnas – platvorm ise ei näe ega salvesta makseandmeid.</li>
      </ul>

      <h2>7. Andmete säilitamine ja kustutamine</h2>
      <ul>
        <li>Kasutajakonto andmeid säilitatakse seni, kuni konto on aktiivne või kuni kasutaja taotleb kustutamist.</li>
        <li>Pärast konto kustutamist eemaldatakse andmed mõistliku aja jooksul, välja arvatud juhul kui seadus nõuab pikemat säilitamist (nt raamatupidamisandmed).</li>
      </ul>

      <h2>8. Kasutaja õigused</h2>
      <ul>
        <li>Õigus tutvuda oma andmetega ning nõuda nende parandamist või kustutamist.</li>
        <li>Õigus võtta tagasi nõusolek andmete töötlemiseks ning kustutada konto.</li>
        <li>Õigus esitada kaebus andmekaitse inspektsioonile.</li>
      </ul>

      <h2>9. Küpsised ja tehniline jälgimine</h2>
      <p>
        Platvorm kasutab ainult vajalikke küpsiseid (nt sisselogimise või sessiooni haldamiseks). Täiendavaid jälgimis- või analüütikaküpsiseid ei kasutata ilma kasutaja nõusolekuta.
      </p>

      <h2>10. Andmete turvalisus</h2>
      <p>
        Platvorm kasutab asjakohaseid tehnilisi ja organisatsioonilisi meetmeid kasutajaandmete kaitsmiseks (sh andmete krüpteerimine, regulaarne varundamine ja juurdepääsu piiramine).
      </p>

      <h2>11. Privaatsustingimuste muutmine</h2>
      <p>
        Platvormi haldajal on õigus privaatsustingimusi ajakohastada, avaldades uue versiooni platvormil. Olulisematest muudatustest teavitatakse kasutajaid ette.
      </p>

      <h2>12. Kontakt</h2>
      <p>
        Küsimuste korral võta ühendust: <a href="mailto:kontakt@sotsiaal.ai">kontakt@sotsiaal.ai</a>
      </p>

      <a href="/" className="back-link">← Tagasi avalehele</a>
    </>
  );
}
