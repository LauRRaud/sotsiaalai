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
              <div className="card-face back">
                <div className="glass-card glass-card-light left-card-primary centered-back">
                  <div className="card-title">
                    <span className="brand-title brand-title-left">Küsi nõu</span>
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
              <div className="card-face back">
                <div className="glass-card glass-card-dark right-card-primary centered-back">
                  <div className="card-title">
                    <span className="brand-title brand-title-right">Küsi nõu</span>
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
