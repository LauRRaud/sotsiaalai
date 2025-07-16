"use client";
import Head from "next/head";
import Link from "next/link";

export default function MeistBody() {
  return (
    <>
      <Head>
        <title>Meist – SotsiaalAI</title>
        <meta
          name="description"
          content="SotsiaalAI – kaasaegne AI-platvorm sotsiaalvaldkonna abiks. Anonüümne, lihtne, usaldusväärne."
        />
        <link
          rel="preload"
          href="/fonts/Aino-Headline.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/Aino-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/Aino-Bold.otf"
          as="font"
          type="font/otf"
          crossOrigin=""
        />
      </Head>
      <div className="page-bg-gradient">
        <div className="glass-box" role="main" aria-labelledby="meist-title">
          <h1 id="meist-title" className="glass-title">
            Meist
          </h1>

<section className="glass-section">
  <p>
    <b>SotsiaalAI</b> on tehisintellektil põhinev platvorm, mille eesmärk on pakkuda usaldusväärset ja arusaadavat tuge nii sotsiaalvaldkonna spetsialistidele kui ka inimestele, kes otsivad abi elulistes sotsiaalküsimustes.
  </p>
  <p>
    Platvormil töötavad kaks rollipõhist AI-assistenti: üks spetsialistidele ja teine eluküsimustega pöördujatele. Mõlemad on loodud selleks, et pakkuda vajaduspõhist tuge – olgu see seotud seaduste, toetuste, teenuste või tööaliste olukordadega. Vastused tuginevad usaldusväärsetele allikatele, lihtsustatud selgitustele ja praktilistele juhistele.
  </p>
  <p>
    Sotsiaalvaldkonnas on info killustunud ja orienteerumine keeruline — seda kinnitab ka{" "}
    <a href="https://oskareport.ee" className="meist-external-link" target="_blank" rel="noopener noreferrer">
      OSKA raport (2025)
    </a>
    . SotsiaalAI aitab seda barjääri vähendada, pakkudes tuge nii professionaalide tööprotsessis kui ka abi vajavatele inimestele.
  </p>
  <p>
    Platvormi arendab ja haldab SotsiaalAI OÜ. Teenus täiustub pidevalt, et tagada ajakohane ning praktiline kasutajakogemus kõigile.
  </p>
</section>
          <section className="glass-section">
            <h2 className="glass-h2">Kontakt</h2>
            <p>
              <b>E-post:</b>{" "}
              <a href="mailto:info@sotsiaal.ai" className="link-brand">info@sotsiaal.ai</a>
            </p>
          </section>

          <section className="glass-section">
            <p>
              <strong>Enne lehe kasutamist tutvu kindlasti:</strong>
            </p>
            <ul className="glass-list">
              <li>
                <Link href="/privaatsustingimused" className="link-brand">
                  Privaatsuspoliitika
                </Link>
              </li>
              <li>
                <Link href="/kasutustingimused" className="link-brand">
                  Kasutustingimused
                </Link>
              </li>
            </ul>
          </section>

          <div className="back-btn-wrapper">
            <Link href="/" className="back-arrow-btn" aria-label="Tagasi avalehele">
              <span className="back-arrow-circle"></span>
            </Link>
          </div>

          <footer className="alaleht-footer">
            SotsiaalAI &copy; 2025
          </footer>
        </div>
      </div>
    </>
  );
}
