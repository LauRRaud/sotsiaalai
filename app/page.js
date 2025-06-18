"use client";
import dynamic from "next/dynamic";
import SplashCursor from '@/components/SplashCursor';

// Osakeste taust, ainult kliendis (Next.js dynamic import)
const Particles = dynamic(() => import('@/components/backgrounds/Particles'), { ssr: false });

export default function HomePage() {
  return (
    <>
      {/* Osakeste taust kõige taga */}
      <Particles
        particleColors={[
          "#4851fa",     // sinine
          "#a133e1",     // purpur
          "#18181866",   // poolläbipaistev mustjas
          "#e2e2e2",     // helehall 2
        ]}
        particleCount={170}
        particleSpread={25}
        speed={0.04}
        particleBaseSize={700}
        sizeRandomness={0.9}
        alphaParticles={true}
        moveParticlesOnHover={false}
        disableRotation={false}
        className="particles-container"
      />

      {/* Sisu */}
      <div className="main-content">
        {/* Vasak pool – tume taust */}
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
                    </div>
                    <div className="card-info-bottom">
                      <span className="card-description left-front-desc">
                        Info, seadused ja nõuanded.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-light left-card-primary centered-back">
                  <div className="card-title back">
                    <span className="brand-title brand-title-left">Küsi nõu</span>
                  </div>
                  <div className="card-note left-back">
                    Sinu usaldusväärne töövahend<br />sotsiaalvaldkonna küsimustes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parem pool – hele taust */}
        <div className="side right">
          <div className="three-d-card float-card right">
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
                    </div>
                    <div className="card-info-bottom">
                      <span className="card-description right-front-desc">
                        Õigused, võimalused ja tugi.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-dark right-card-primary centered-back">
                  <div className="card-title back">
                    <span className="brand-title brand-title-right">Küsi nõu</span>
                  </div>
                  <div className="card-note right-back">
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

      {/* SplashCursor kõige ees */}
      <SplashCursor />
    </>
  );
}
