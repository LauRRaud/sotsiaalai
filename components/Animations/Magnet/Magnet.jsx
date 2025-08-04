import { useState, useEffect, useRef } from "react";

const Magnet = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 100,
  activeTransition = "transform 0.8s ease-out",
  inactiveTransition = "transform 0.8s ease-in-out",
  wrapperClassName = "",
  innerClassName = "",
  zIndex = 22,
  ...props
}) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef(null);

  useEffect(() => {
    if (disabled) {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      return;
    }
const maxMove = 150; // px - kui palju kaart võib liikuda max

const handleMouseMove = (e) => {
  if (!magnetRef.current) return;
  const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  const distX = Math.abs(centerX - e.clientX);
  const distY = Math.abs(centerY - e.clientY);

  if (distX < width / 2 + padding && distY < height / 2 + padding) {
    setIsActive(true);
    // Võimenda, AGA PIIRA!
    let offsetX = (e.clientX - centerX) * 0.1; // 1.4x kaugemale
    let offsetY = (e.clientY - centerY) * 0.1;

    // Limiteeri liikumist, et kaart ei “lenda” liiga kaugele
    offsetX = Math.max(-maxMove, Math.min(offsetX, maxMove));
    offsetY = Math.max(-maxMove, Math.min(offsetY, maxMove));

    setPosition({ x: offsetX, y: offsetY });
  } else {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
  }
};

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [padding, disabled, magnetStrength]);

  const transitionStyle = isActive ? activeTransition : inactiveTransition;

  // Kui children on funktsioon, anname isActive prop'i
  const child = typeof children === "function"
    ? children({ isActive })
    : children;

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
        // ÄRA PANE pointerEvents: "none" wrapperile
      }}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          width: "100%",
          height: "100%",
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: transitionStyle,
          willChange: isActive ? "transform" : "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none" // ainult seesoleval glow/divil, mitte wrapperil!
        }}
      >
        {/* Laps (kaart) – see saab eventid, pointerEvents jääb "auto" */}
        {child}
      </div>
    </div>
  );
};

export default Magnet;
