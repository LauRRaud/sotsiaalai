"use client";
import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import SplashCursor from '@/components/SplashCursor';

const Particles = dynamic(() => import('@/components/backgrounds/Particles'), { ssr: false });

export default function HomePage() {
  // Vasak kaart
  const magnetLeft = useRef(null);
  const cardLeft = useRef(null);
  const coordsLeft = useRef({ x: 0, y: 0 });
  const targetLeft = useRef({ x: 0, y: 0 });
  const animLeft = useRef();

  // Parem kaart
  const magnetRight = useRef(null);
  const cardRight = useRef(null);
  const coordsRight = useRef({ x: 0, y: 0 });
  const targetRight = useRef({ x: 0, y: 0 });
  const animRight = useRef();

  // ANIMATSIOONIFUNKTID — lerp liikumiseks
  function animateLeft() {
    coordsLeft.current.x += (targetLeft.current.x - coordsLeft.current.x) * 0.02;
    coordsLeft.current.y += (targetLeft.current.y - coordsLeft.current.y) * 0.02;
    if (magnetLeft.current) {
      magnetLeft.current.style.transform = `translate(${coordsLeft.current.x}px, ${coordsLeft.current.y}px)`;
    }
    animLeft.current = requestAnimationFrame(animateLeft);
  }
  function animateRight() {
    coordsRight.current.x += (targetRight.current.x - coordsRight.current.x) * 0.02;
    coordsRight.current.y += (targetRight.current.y - coordsRight.current.y) * 0.02;
    if (magnetRight.current) {
      magnetRight.current.style.transform = `translate(${coordsRight.current.x}px, ${coordsRight.current.y}px)`;
    }
    animRight.current = requestAnimationFrame(animateRight);
  }

  // Vasak kaart — hiire liigutamine ja lahkumine
  function handleMouseMoveLeft(e) {
    if (!magnetLeft.current || !cardLeft.current) return;
    const rect = cardLeft.current.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(mx * mx + my * my);
    if (dist < 340) {
      targetLeft.current.x = (mx / rect.width) * 30;
      targetLeft.current.y = (my / rect.height) * 30;
    } else {
      targetLeft.current.x = 0;
      targetLeft.current.y = 0;
    }
    if (!animLeft.current) animateLeft();
  }
  function handleMouseLeaveLeft() {
    targetLeft.current.x = 0;
    targetLeft.current.y = 0;
    if (!animLeft.current) animateLeft();
  }

  // Parem kaart — hiire liigutamine ja lahkumine
  function handleMouseMoveRight(e) {
    if (!magnetRight.current || !cardRight.current) return;
    const rect = cardRight.current.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(mx * mx + my * my);
    if (dist < 340) {
      targetRight.current.x = (mx / rect.width) * 30;
      targetRight.current.y = (my / rect.height) * 30;
    } else {
      targetRight.current.x = 0;
      targetRight.current.y = 0;
    }
    if (!animRight.current) animateRight();
  }
  function handleMouseLeaveRight() {
    targetRight.current.x = 0;
    targetRight.current.y = 0;
    if (!animRight.current) animateRight();
  }

  // Cleanup animatsioonid
  useEffect(() => {
    return () => {
      if (animLeft.current) cancelAnimationFrame(animLeft.current);
      if (animRight.current) cancelAnimationFrame(animRight.current);
    };
  }, []);

  return (
    <>
      <Particles
        particleColors={["#4851fa", "#a133e1", "#18181866", "#e2e2e2"]}
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

      <div className="main-content">
        {/* Vasak kaart */}
        <div
          className="side left"
          onMouseMove={handleMouseMoveLeft}
          onMouseLeave={handleMouseLeaveLeft}
        >
          <div className="three-d-card float-card left" ref={cardLeft}>
            <div
              className="magnet-wrapper"
              ref={magnetLeft}
              style={{
                transition: "none",
                willChange: "transform"
              }}
            >
              <div className="card-wrapper">
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
                    <button
                      type="button"
                      className="sr-only"
                      tabIndex={0}
                      aria-label="Küsi nõu"
                    >
                      Küsi nõu
                    </button>
                  </div>
                </div>
                {/* Vasaku kaardi tagakülg */}
                <div className="card-face back">
                  <div className="centered-back-outer">
                    <div className="centered-back-inner-left">
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
          </div>
        </div>

        {/* Parem kaart */}
        <div
          className="side right"
          onMouseMove={handleMouseMoveRight}
          onMouseLeave={handleMouseLeaveRight}
        >
          <div className="three-d-card float-card right" ref={cardRight}>
            <div
              className="magnet-wrapper"
              ref={magnetRight}
              style={{
                transition: "none",
                willChange: "transform"
              }}
            >
              <div className="card-wrapper">
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
                    <button
                      type="button"
                      className="sr-only"
                      tabIndex={0}
                      aria-label="Küsi nõu"
                    >
                      Küsi nõu
                    </button>
                  </div>
                </div>
                {/* Parema kaardi tagakülg */}
                <div className="card-face back">
                  <div className="centered-back-outer">
                    <div className="centered-back-inner-right">
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
        </div>
      </div>

      {/* Footer */}
      <div className="footer-row">
        <div className="footer-left">sotsiaal.ai © 2025</div>
        <div className="footer-right">
          <a href="about.html" className="footer-link">Meist</a>
        </div>
      </div>

      <SplashCursor />
    </>
  );
}
