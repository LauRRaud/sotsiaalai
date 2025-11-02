"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
const DarkMode = () => {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    try {
      const lsTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDark(lsTheme ? lsTheme === "dark" : prefersDark);
    } catch {}
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark-mode", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
    // dispatch event for BackgroundLayer
    try {
      window.dispatchEvent(new CustomEvent("themechange", { detail: { dark } }));
    } catch {}
  }, [dark, mounted]);
  if (!mounted) return null; // väldib vale SSR renderdust
  return (
    <StyledWrapper>
      <label
        htmlFor="themeToggle"
        className="themeToggle st-sunMoonThemeToggleBtn"
        aria-label={dark ? "Lülita hele režiim" : "Lülita tume režiim"}
      >
        <input
          type="checkbox"
          id="themeToggle"
          className="themeToggleInput"
          checked={dark}
          onChange={() => setDark((v) => !v)}
        />
        <svg
          width={32}
          height={32}
          viewBox="0 0 20 20"
          fill="currentColor"
          stroke="none"
          aria-hidden="true"
        >
          <mask id="moon-mask">
            <rect x={0} y={0} width={20} height={20} fill="white" />
            <circle cx={11} cy={3} r={8} fill="black" />
          </mask>
          <circle className="sunMoon" cx={10} cy={10} r={8} mask="url(#moon-mask)" />
          <g>
            <circle className="sunRay sunRay1" cx={18} cy={10} r="1.5" />
            <circle className="sunRay sunRay2" cx={14} cy="16.928" r="1.5" />
            <circle className="sunRay sunRay3" cx={6} cy="16.928" r="1.5" />
            <circle className="sunRay sunRay4" cx={2} cy={10} r="1.5" />
            <circle className="sunRay sunRay5" cx={6} cy="3.1718" r="1.5" />
            <circle className="sunRay sunRay6" cx={14} cy="3.1718" r="1.5" />
          </g>
        </svg>
      </label>
    </StyledWrapper>
  );
};
const StyledWrapper = styled.div`
  /* NB: enam ei sea positsiooni! Parent (layout.js) juhib asukohta */
  z-index: auto;
  .themeToggle {
    color: #bbb;
    width: 3em;
  }
  .st-sunMoonThemeToggleBtn {
    position: relative;
    cursor: pointer;
  }
  .st-sunMoonThemeToggleBtn .themeToggleInput {
    opacity: 0;
    width: 100%;
    aspect-ratio: 1;
    position: absolute;
    inset: 0;
    cursor: pointer;
  }
  .st-sunMoonThemeToggleBtn svg {
    position: relative;
    width: 32px;
    height: 32px;
    transition: transform 0.4s ease;
    transform: rotate(40deg);
    background: none;
    border-radius: 50%;
  }
  .st-sunMoonThemeToggleBtn svg .sunMoon {
    transform-origin: center center;
    transition: inherit;
    transform: scale(1);
  }
  .st-sunMoonThemeToggleBtn svg .sunRay {
    transform-origin: center center;
    transform: scale(0);
  }
  .st-sunMoonThemeToggleBtn svg mask > circle {
    transition: transform 0.64s cubic-bezier(0.41, 0.64, 0.32, 1.575);
    transform: translate(0px, 0px);
  }
  .st-sunMoonThemeToggleBtn svg .sunRay2 { animation-delay: 0.05s !important; }
  .st-sunMoonThemeToggleBtn svg .sunRay3 { animation-delay: 0.1s !important; }
  .st-sunMoonThemeToggleBtn svg .sunRay4 { animation-delay: 0.17s !important; }
  .st-sunMoonThemeToggleBtn svg .sunRay5 { animation-delay: 0.25s !important; }
  .st-sunMoonThemeToggleBtn svg .sunRay6 { animation-delay: 0.29s !important; }
  .st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg {
    transform: rotate(90deg);
  }
  .st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg mask > circle {
    transform: translate(16px, -3px);
  }
  .st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg .sunMoon {
    transform: scale(0.55);
  }
  .st-sunMoonThemeToggleBtn .themeToggleInput:checked + svg .sunRay {
    animation: showRay1832 0.4s ease 0s 1 forwards;
  }
  @keyframes showRay1832 {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
`;
export default DarkMode;
