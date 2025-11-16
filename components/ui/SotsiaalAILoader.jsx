"use client";
import styles from "./SotsiaalAILoader.module.css";

export default function SotsiaalAILoader({
  size,                      // number (px) või string (nt "48px")
  color = "#b17c7c",
  pulse = 2.4,
  minScale = 0.5,
  maxScale = 1,
  ariaLabel = "Assistent koostab vastust",
  animated = true,
  ariaHidden = false,
  className = "",
  style = {},
}) {
  const stageClass = [styles.stage, !animated && styles.static, className]
    .filter(Boolean)
    .join(" ");

  const px = size != null
    ? (typeof size === "number" ? `${size}px` : String(size))
    : undefined; // kui puudu, lase CSS-il otsustada

  const accessibilityProps = ariaHidden
    ? { "aria-hidden": true }
    : { role: "status", "aria-live": "polite", "aria-busy": true, "aria-label": ariaLabel };

  return (
    <div
      className={stageClass}
      {...accessibilityProps}
      data-animated={animated ? "true" : "false"}
      style={{
        // CSS var jätkub, aga paneme KA reaalse width/height inline (üle kirjutab globaalid)
        "--size": px || "var(--sotsiaalai-loader-size, 44px)",
        width: px,              // ⟵ kriitiline rida
        height: px,             // ⟵ kriitiline rida
        "--glow": color,
        "--pulse": `${pulse}s`,
        "--minScale": animated ? minScale : 1,
        "--maxScale": animated ? maxScale : 1,
        "--glow-opacity-base": style["--glow-opacity-base"] ?? (animated ? 0.02 : 0),
        "--glow-opacity-peak": style["--glow-opacity-peak"] ?? (animated ? 0.08 : 0),
        ...style,
      }}
    >
      <svg viewBox="0 0 111.12 170.15" aria-hidden="true" className={styles.svg}>
        <defs>
          <filter id="blurGlow" filterUnits="userSpaceOnUse" x="-1000" y="-1000" width="3000" height="3000" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b2" />
            <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /></feMerge>
          </filter>
          <style>{`.st0{fill:url(#linear-gradient2);stroke:none}.st1{fill:url(#red-vertical);stroke:#8b4a45;stroke-width:3;stroke-opacity:0.4}.st2{fill:url(#linear-gradient)}`}</style>

          <linearGradient id="linear-gradient" x1="24.12" y1="74.54" x2="24.12" y2="35.3" gradientTransform="translate(0 194.78) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#050505"/>
            <stop offset=".4" stopColor="#050505"/>
            <stop offset="1" stopColor="#030303"/>
          </linearGradient>

          <linearGradient id="linear-gradient1" x1="-3468.39" y1="8.78" x2="-3468.39" y2="9.78" gradientTransform="translate(384977.26 -1494.4) scale(110.98 170.15)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fbe5df"/>
            <stop offset=".2" stopColor="#f3c6b5"/>
            <stop offset=".45" stopColor="#e09780"/>
            <stop offset=".7" stopColor="#c66a4e"/>
            <stop offset="1" stopColor="#843722"/>
          </linearGradient>

          <linearGradient id="linear-gradient2" x1="79.28" y1="2682.15" x2="79.28" y2="2717.33" gradientTransform="translate(0 -2672)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f5f5f4"/>
            <stop offset=".22" stopColor="#eeedec"/>
            <stop offset=".48" stopColor="#dad9d6"/>
            <stop offset=".72" stopColor="#c7c5c1"/>
            <stop offset="1" stopColor="#a8a59e"/>
          </linearGradient>

          <linearGradient id="red-vertical" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#883434"/>
            <stop offset="0.25" stopColor="#6c2427"/>
            <stop offset="0.5" stopColor="#541b1c"/>
            <stop offset="0.75" stopColor="#3b1112"/>
            <stop offset="1" stopColor="#2e0d0d"/>
          </linearGradient>

          <path id="ball-bottom" d="M22.75,120.35c24.06-2.42,28.53,35.69,5,38.88-27.44,3.73-31.31-36.25-5-38.88h0Z"/>
          <path id="ball-top" d="M75.38,8.47c27.75-4.37,32.82,36.21,3.92,36.76-24.7.47-25.74-33.32-3.92-36.76Z"/>
        </defs>

        <g className={`${styles.ball} ${styles.bottom}`}>
          <use href="#ball-bottom" className={styles.glow} filter="url(#blurGlow)" />
          <use href="#ball-bottom" className="st2" />
        </g>
        <path className="st1" d="M63.43,170.14c14.63-9.87,20.55-32.44,12.96-48.55-9.03-16.76-30.23-21.45-46.18-30.04-11.43-5.84-21.63-13.15-26.45-25.52C-6.92,40.04,5.82,9.89,33.52.45c2.05-.7,6.46-.85,3.59,1.54-8.55,4.89-12.89,14.74-12.47,24.47,1.53,47.78,93.1,33.55,86.1,94.99-1.53,14.18-9.09,27.4-19.91,36.53-7.76,6.26-17.19,12.3-27.38,12.17"/>
        <g className={`${styles.ball} ${styles.top}`}>
          <use href="#ball-top" className={styles.glow} filter="url(#blurGlow)" />
          <use href="#ball-top" className="st0" />
        </g>
      </svg>
    </div>
  );
}
