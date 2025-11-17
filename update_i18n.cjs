const fs = require("fs");

function load(path) {
  let txt = fs.readFileSync(path, "utf8");
  if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);
  return JSON.parse(txt);
}

function save(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), { encoding: "utf8" });
}

(() => {
  const et = load("temp_et_head.json");

  et.chat.upload.context_hint =
    "Kui analüüsi lüliti on väljas, kasutatakse ainult SotsiaalAI teadmistebaasi. Kui lüliti on sees, saab assistent dokumenti analüüsida - teha kokkuvõtteid, selgitusi, võrdlusi, tõlkeid ja soovitada parandusi. Dokumenti ei salvestata ühelgi juhul.";
  et.chat.upload.use_as_context = "Analüüsi vestluses";

  et.guide.chat.body = `<p>Vestlusvaade avaneb pärast sisselogimist ainult siis, kui kontol on aktiivne tellimus. Assistent on rollipõhine - vastused ja soovitused võivad erineda sõltuvalt kasutaja rollist (spetsialist või eluküsimusega pöörduja). Samuti võivad rolliti veidi erineda vestluslehel assistendiga seotud funktsioonid, kuid põhiline töövoog - sõnumite saatmine, dokumentide lisamine ja vestluste haldamine - on kõigile sarnane.</p>
<p><strong>Sõnumi sisestamine</strong></p>
<ul>
  <li>Kirjuta küsimus vestlusakna all olevasse sisestusvälja ja saada see nupu või Enteriga.</li>
  <li>Vastuse genereerimise ajal kuvatakse nupul animatsioon ja tekst "Peata vastus", mis võimaldab striimimist katkestada ja kirjutamist jätkata.</li>
</ul>
<p><strong>Sõnumivaade ja kerimine</strong></p>
<ul>
  <li>Kui kerid üles, ilmub sisestusvälja juurde nooleikoon, millega saad ühe klõpsuga vestluse lõppu naasta.</li>
</ul>
<p><strong>Dokumendi analüüs</strong></p>
<ul>
  <li>Dokumendi üleslaadimine aitab assistendil töötada just sinu tekstiga - näiteks pikema kirja, lepingu, juhendi või taotlusega.</li>
  <li>Assistent saab dokumenti kasutada selleks, et koostada dokumendist lühikokkuvõte, selgitada keerulisi või juriidilisi kohti, võrrelda tingimusi seaduste või juhistega, aidata vastuste ja taotluste koostamisel ning tõsta esile olulisi kuupäevi, nõudeid ja riskikohti.</li>
  <li>Dokumenti kasutatakse ainult jooksva vestluse kontekstis ega salvestata püsivalt.</li>
</ul>
<p><strong>Dokumendi lisamine</strong></p>
<ul>
  <li>Kirjaklambri nupp avab failivalija ja võimaldab üles laadida dokumente (kuni 50 MB), näiteks PDF, DOC/DOCX, TXT, MD või HTML.</li>
  <li>Dokumente ei salvestata püsivalt - neid kasutatakse ainult jooksva vestluse kontekstis.</li>
</ul>
<p>Pärast edukat üleslaadimist avatakse dokumendi aken, kus näed:</p>
<ul>
  <li>faili nime,</li>
  <li>lülitit "Analüüsi vestluses", millega saad valida, kas assistent võib vastust andes tugineda üleslaaditud dokumendile või ainult SotsiaalAI teadmistebaasile,</li>
  <li>selgitust, mis avaneb küsimärgi ikoonile vajutades,</li>
  <li>nuppu "Näita dokumenti" / "Peida dokument", millega saad dokumendi teksti aknas avada või peita,</li>
  <li>dokumendi teksti (keritav tekst samas dokumendi aknas), kui oled valinud "Näita dokumenti",</li>
  <li>nuppu "Vestlusesse", millega saad kiiresti naasta vestlusaknasse ja teksti sisestusväljale, et küsimustega jätkata.</li>
</ul>
<p>"Laadi dokument" nupu all kuvatakse, mitu dokumendi analüüsi sul täna veel kasutada on.</p>
<p><strong>Allikad</strong></p>
<ul>
  <li>Kui vastus kasutab dokumente, kuvatakse jaluses nupp "Allikad", mis avab kasutatud materjalide loendi.</li>
</ul>
<p><strong>Vestluste külgaken</strong></p>
<ul>
  <li>Ülanurgas olev nupp "Vestlused" avab külgpaneeli, kus saad:</li>
  <li>laadida varasemaid vestlusi,</li>
  <li>luua uue vestluse,</li>
  <li>värskendada loendit,</li>
  <li>kustutada vestlusi, mida enam ei vaja,</li>
  <li>kasutada "Lae veel", et näha vanemaid vestlusi.</li>
</ul>
<p>Aktiivne vestlus on loendis esile tõstetud ja paneel sulgub automaatselt, kui valid teise vestluse.</p>
<p><strong>Profiil ja ligipääsetavus</strong></p>
<ul>
  <li>Vestluslehe paremast ülanurgast profiili ikooni kaudu saad avada profiililehe ja ligipääsetavuse seaded.</li>
</ul>
<p><strong>Hoiatused</strong></p>
<ul>
  <li>Kui vestlus puudutab võimalikku kriisiolukorda, kuvatakse punane infokast juhistega kiireks abi kutsumiseks.</li>
</ul>`;

  et.meta = {
    home: {
      title: "SotsiaalAI – Tehisintellekt sotsiaaltöös ja elulistes küsimustes",
      description:
        "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöördujatele.",
    },
    about: {
      title: "Meist – SotsiaalAI",
      description: "Tutvu SotsiaalAI missiooni, väärtuste ja meeskonnaga.",
    },
    terms: {
      title: "Kasutustingimused – SotsiaalAI",
      description: "Tutvu SotsiaalAI platvormi kasutustingimustega.",
    },
    privacy: {
      title: "Privaatsustingimused – SotsiaalAI",
      description: "Loe, kuidas SotsiaalAI kogub, kasutab ja kaitseb sinu andmeid.",
    },
    profile: {
      title: "Minu profiil – SotsiaalAI",
      description: "Halda oma kontoandmeid, eelistusi ja ligipääsu SotsiaalAI teenustele.",
    },
    register: {
      title: "Loo konto – SotsiaalAI",
      description: "Registreeru ja vali roll, et kasutada SotsiaalAI platvormi.",
    },
    subscription: {
      title: "Tellimus – SotsiaalAI",
      description: "Vaata ja halda oma SotsiaalAI tellimust ja makseid.",
    },
    reset: {
      title: "PIN-i taastamine – SotsiaalAI",
      description: "Taasta oma konto PIN turvalise taastelingi abil.",
    },
    chat: {
      title: "Vestlus – SotsiaalAI",
      description:
        "Suhtle rollipõhise AI assistendiga ja saa vastuseid sotsiaalvaldkonna teemadel.",
    },
    start: {
      title: "Järgmine samm – SotsiaalAI",
      description: "Vali, millise tööriistaga jätkad pärast sisselogimist.",
    },
  };

  save("messages/et.json", et);
})();
