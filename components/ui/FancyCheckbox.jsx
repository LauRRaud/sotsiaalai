"use client";
import React, { forwardRef } from "react";
import styled from "styled-components";
const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  min-height: 44px; /* target size */
  user-select: none;
  position: relative;
  /* Focus ring on the visual box when the input gets focus */
  &:focus-within .box {
    outline: 3px solid var(--focus-ring, #ffd24d);
    outline-offset: 3px;
  }
  .visually-hidden {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: -1px;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    overflow: hidden;
    border: 0;
    padding: 0;
  }
  .box {
    width: 28px;
    height: 28px;
    display: inline-grid;
    place-items: center;
    border-radius: 6px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.25);
    box-sizing: border-box;
  }
  .svg {
    width: 20px;
    height: 20px;
    display: block;
  }
  .shape {
    fill: none;
    stroke: var(--pt-200, #E0E0E0);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .tick {
    fill: none;
    stroke: var(--brand-primary, #ffd24d);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 18 40;
    stroke-dashoffset: 40; /* hidden */
    transition: stroke-dashoffset 180ms ease;
  }
  input:checked + .box .tick {
    stroke-dashoffset: 0; /* revealed */
  }
  .text {
    color: var(--pt, #C9C7C2);
    font: inherit;
  }
  /* A11Y modal: scale controls and text slightly larger */
  .a11y-modal & { gap: 0.75rem; }
  .a11y-modal & .box { width: 32px; height: 32px; }
  .a11y-modal & .svg { width: 22px; height: 22px; }
  .a11y-modal & .text { font-size: 1.12rem; }
`;
const FancyCheckbox = forwardRef(function FancyCheckbox(
  { id, label, checked, onChange, disabled, name }, ref
){
  return (
    <Label>
      <input
        ref={ref}
        id={id}
        name={name}
        type="checkbox"
        className="visually-hidden"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked, e)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // Toggle explicitly on Enter for better keyboard support
            onChange?.(!checked, e);
          }
        }}
        disabled={disabled}
        aria-checked={!!checked}
        aria-disabled={!!disabled}
      />
      <span aria-hidden="true" className="box">
        <svg className="svg" viewBox="0 0 24 24" focusable="false">
          <rect className="shape" x="3" y="3" width="18" height="18" rx="4" ry="4" />
          <polyline className="tick" points="6,12 10,16 18,8" />
        </svg>
      </span>
      {label && (
        <span className="text">{label}</span>
      )}
    </Label>
  );
});
export default FancyCheckbox;
