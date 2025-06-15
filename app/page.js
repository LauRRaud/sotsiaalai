"use client";
import SplashCursor from '@/components/SplashCursor';

export default function HomePage() {
  return (
    <>
      <SplashCursor />
      <div className="main-content">
        {/* Vasak kaart */}
        <div className="side left">
          <div className="three-d-card float-card">
            <div className="card-wrapper">
              {/* Esikülg */}
              <div className="card-face front">
                <div className="glass-card glass-card-light left-card-primary">
                  <div className="card-title">
                    <span className="brand-title brand-title-left">SotsiaalAI</span>
                  </div>
                  <div className="card-content">
                    <div className="card-headline">
                      <span className="headline-bold">
                        Sotsiaaltöö<br />spetsialistile
                      </span>
                      <div className="card-info-bottom" style={{marginTop: "1.6em"}}>
                        <span className="card-description" style={{
                          display: "block",
                          fontWeight: 500
                        }}>
                          Info, seadused ja nõuanded.
                        </span>
                      </div>
                    </div>
                    {/* Mobiilinupp */}
                    <a href="/kysi-nou" className="mobile-ask-btn">
                      Küsi nõu
                    </a>
                  </div>
                </div>
              </div>
              {/* Tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-light left-card-primary centered-back">
                  <div
                    className="card-title"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: 0,
                      padding: 0
                    }}
                  >
                    <span className="brand-title brand-title-left" style={{margin: 0}}>Küsi nõu</span>
                  </div>
                  <div className="card-note" style={{
                    fontStyle: "italic",
                    fontSize: "1.4rem",
                    marginTop: "2.5em",
                    color: "#888",
                    textAlign: "center"
                  }}>
                    Sinu usaldusväärne töövahend<br />sotsiaalvaldkonna küsimustes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parem kaart */}
        <div className="side right">
          <div className="three-d-card right float-card">
            <div className="card-wrapper">
              {/* Esikülg */}
              <div className="card-face front">
                <div className="glass-card glass-card-dark right-card-primary">
                  <div className="card-title">
                    <span className="brand-title brand-title-right">SotsiaalA&lt;B&gt;I</span>
                  </div>
                  <div className="card-content">
                    <div className="card-headline">
                      <span className="headline-bold">
                        Eluküsimusega<br />pöördujale
                      </span>
                      <span className="card-description" style={{
                        display: "block",
                        fontWeight: 400
                      }}>
                        Õigused, võimalused ja tugi.
                      </span>
                    </div>
                    {/* Mobiilinupp */}
                    <a href="/kysi-nou" className="mobile-ask-btn">
                      Küsi nõu
                    </a>
                  </div>
                </div>
              </div>
              {/* Tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-dark right-card-primary centered-back">
                  <div
                    className="card-title"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: 0,
                      padding: 0
                    }}
                  >
                    <span className="brand-title brand-title-right" style={{margin: 0}}>Küsi nõu</span>
                  </div>
                  <div className="card-note" style={{
                    fontStyle: "italic",
                    fontSize: "1.5rem",
                    marginTop: "2.5em",
                    color: "#e0e0e0",
                    textAlign: "center"
                  }}>
                    Leia selgus ja kindlustunne<br />
                    elulistes sotsiaalküsimustes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-row">
        <div className="footer-left">sotsiaal.ai © 2025</div>
        <div className="footer-right">
          <a href="about.html" className="footer-link">Meist</a>
        </div>
      </div>
    </>
  );
}
