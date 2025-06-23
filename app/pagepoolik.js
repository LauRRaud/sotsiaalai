"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import SplashCursor from '@/components/SplashCursor';

// Osakeste taust ainult kliendis
const Particles = dynamic(() => import('@/components/backgrounds/Particles'), { ssr: false });

export default function HomePage() {
  // Viited kaartide wrapperitele
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  // Liigutab kaarti hiire suunas (väike tõmme)
  const handleMouseMove = (e, ref) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    // max 22px nihutust mõlemas suunas
    const moveX = Math.max(-22, Math.min(22, x * 0.12));
    const moveY = Math.max(-22, Math.min(22, y * 0.12));
    card.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  // Kaart läheb tagasi nulli, kui hiir ära läheb
  const handleMouseLeave = (ref) => {
    const card = ref.current;
    if (card) card.style.transform = `translate(0px,0px)`;
  };

  return (
    <>
      {/* Osakeste taust */}
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
        {/* Vasak kaart */}
        <div className="side left">
          <div className="three-d-card float-card left">
            <div
              className="card-wrapper"
              ref={leftCardRef}
              onMouseMove={e => handleMouseMove(e, leftCardRef)}
              onMouseLeave={() => handleMouseLeave(leftCardRef)}
            >
              <div className="card-face front">
                <div className="glass-card glass-card-light left-card-primary card-fadein">
                  <div className="card-title">
                    <span className="brand-title brand-title-left">SotsiaalAI</span>
                  </div>
                  <div className="card-content">
                    <div className="card-headline">
                      <span className="headline-bold">
                        Sotsiaaltöö<br />spetsialistile
                      </span>
                      <div className="card-info-bottom">
                        <span className="card-description">
                          Info, seadused ja nõuanded.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Vasaku kaardi tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-light left-card-primary centered-back card-fadein">
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

        {/* Parem kaart */}
        <div className="side right">
          <div className="three-d-card float-card right">
            <div
              className="card-wrapper"
              ref={rightCardRef}
              onMouseMove={e => handleMouseMove(e, rightCardRef)}
              onMouseLeave={() => handleMouseLeave(rightCardRef)}
            >
              <div className="card-face front">
                <div className="glass-card glass-card-dark right-card-primary card-fadein">
                  <div className="card-title">
                    <span className="brand-title brand-title-right">SotsiaalA&lt;B&gt;I</span>
                  </div>
                  <div className="card-content">
                    <div className="card-headline">
                      <span className="headline-bold">
                        Eluküsimusega<br />pöördujale
                      </span>
                      <div className="card-info-bottom">
                        <span className="card-description">
                          Õigused, võimalused ja tugi.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Parema kaardi tagakülg */}
              <div className="card-face back">
                <div className="glass-card glass-card-dark right-card-primary centered-back card-fadein">
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
