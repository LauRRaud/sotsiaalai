"use client";
import SplashCursor from '@/components/SplashCursor';

export default function HomePage() {
  return (
    <>
      <SplashCursor />
      <div className="main-content">
        {/* Vasak kaart – flipib vasakule */}
        <div className="side left">
          <div className="three-d-card">
            <div className="card-wrapper">
              {/* Esikülg */}
              <div className="card-face front">
                <div className="glass-card glass-card-light left-card-primary">
                  <div className="card-title">
                    <span className="brand-title">SotsiaalAI</span>
                  </div>
                  <div className="card-content">
                    <div className="card-headline">
                      <span className="headline-bold">
                        Sotsiaaltöö<br />spetsialistile
                      </span>
                      <span className="card-description">
                        Info, seadused ja nõuanded.
                      </span>
                    </div>
                    <div className="card-note">
                      <em>
                        Sinu usaldusväärne töövahend<br />
                        sotsiaalvaldkonna küsimustes.
                      </em>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-light left-card-primary centered-back">
                  <div className="card-title">
                    <span className="brand-title">Küsi nõu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Parem kaart – flipib paremale */}
        <div className="side right">
          <div className="three-d-card right">
            <div className="card-wrapper">
              {/* Esikülg */}
              <div className="card-face front">
                <div className="glass-card glass-card-dark right-card-primary">
                  <div className="card-title">
                    <span className="brand-title">SotsiaalA&lt;B&gt;I</span>
                  </div>
                  <div className="card-content">
                    <div className="card-headline">
                      <span className="headline-bold">
                        Eluküsimusega<br />pöördujale
                      </span>
                      <span className="card-description">
                        Õigused, võimalused ja tugi.
                      </span>
                    </div>
                    <div className="card-note">
                      <em>
                        Leia selgus ja kindlustunne<br />
                        elulistes sotsiaalküsimustes.
                      </em>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-dark right-card-primary centered-back">
                  <div className="card-title">
                    <span className="brand-title">Küsi nõu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="footer-row">
        <div className="footer-left">© 2025 sotsiaal.ai</div>
        <div className="footer-right">
          <a href="about.html" className="footer-link">Meist</a>
        </div>
      </div>
    </>
  );
}
