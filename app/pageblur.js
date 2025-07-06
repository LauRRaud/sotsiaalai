"use client";
import Magnet from "@/components/Animations/Magnet/Magnet";
import Particles from "@/components/backgrounds/Particles"; // Osakeste komponent

export default function DemoDoubleCard() {
  return (
    <>
      {/* Osakesed taustale */}
      <Particles className="particles-container" style={{ zIndex: 0, position: "fixed", inset: 0, pointerEvents: "none" }} />

      <div className="card-row">
        {/* Vasak kaart */}
        <div className="flip-card float-card">
          <div className="flip-inner">
            <div className="flip-front">
              <Magnet padding={80} magnetStrength={9}>
                <div className="front-content">
                  <h2>Vasak kaart</h2>
                  <p>Magnet, blur, hõljumine</p>
                </div>
              </Magnet>
            </div>
            <div className="flip-back">
              <div className="back-content">
                <h2>Tagakülg</h2>
                <p>Ka siin blur töötab</p>
              </div>
            </div>
          </div>
        </div>
        {/* Parem kaart */}
        <div className="flip-card float-card">
          <div className="flip-inner">
            <div className="flip-front">
              <Magnet padding={80} magnetStrength={9}>
                <div className="front-content">
                  <h2>Parem kaart</h2>
                  <p>Magnet, blur, hõljumine</p>
                </div>
              </Magnet>
            </div>
            <div className="flip-back">
              <div className="back-content">
                <h2>Tagakülg</h2>
                <p>Blur töötab ka siin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background: linear-gradient(90deg, #ffea00, #7e3ff2);
          min-height: 100vh;
          margin: 0;
        }
        .card-row {
          display: flex;
          gap: 3vw;
          justify-content: center;
          align-items: flex-start;
          margin-top: 8vh;
        }
        .flip-card {
          width: 350px;
          height: 350px;
          perspective: 1100px;
          z-index: 1;
        }
        .flip-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1s cubic-bezier(.6,.1,.3,1.1);
        }
        .flip-card:hover .flip-inner,
        .flip-card:focus-within .flip-inner {
          transform: rotateY(180deg);
        }
        .flip-front, .flip-back {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0; left: 0;
          border-radius: 2em;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          color: #232;
          backface-visibility: hidden;
        }
        .flip-front {
          background: rgba(255,255,255,0.13);
          backdrop-filter: blur(5px);
          box-shadow: 0 4px 48px 0 #aa86ff39;
        }
        .flip-back {
          background: rgba(60,20,180,0.15);
          backdrop-filter: blur(5px);
          color: white;
          transform: rotateY(180deg);
          box-shadow: 0 4px 48px 0 #2719643b;
        }
        .float-card {
          animation: float-vertical 6.2s ease-in-out infinite;
        }
        @keyframes float-vertical {
          0%   { transform: translateY(0);}
          50%  { transform: translateY(-18px);}
          100% { transform: translateY(0);}
        }
        .front-content, .back-content {
          text-align: center;
          width: 80%;
        }
        h2 {
          margin: 0 0 14px 0;
        }
        .particles-container {
          position: fixed !important;
          inset: 0 !important;
          z-index: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </>
  );
}
