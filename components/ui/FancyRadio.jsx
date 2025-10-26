"use client";

import React, { forwardRef } from "react";
import styled from "styled-components";

const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  min-height: 40px;
  user-select: none;
  position: relative;

  &:focus-within .outer {
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

  .outer {
    width: 20px;
    height: 20px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.25);
    box-sizing: border-box;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--brand-primary, #ffd24d);
    transform: scale(0);
    transition: transform 140ms ease;
  }

  input:checked + .outer .dot {
    transform: scale(1);
  }

  .text {
    color: var(--pt-150, #E6E5E3);
    font: inherit;
  }

  /* A11Y modal: scale controls and text slightly larger */
  .a11y-modal & {
    gap: 0.7rem;
  }
  .a11y-modal & .outer { width: 24px; height: 24px; }
  .a11y-modal & .dot { width: 12px; height: 12px; }
  .a11y-modal & .text { font-size: 1.12rem; }
`;

const FancyRadio = forwardRef(function FancyRadio(
  { id, label, checked, onChange, disabled, name, value }, ref
){
  return (
    <Label>
      <input
        ref={ref}
        id={id}
        name={name}
        value={value}
        type="radio"
        className="visually-hidden"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.value, e)}
        disabled={disabled}
        aria-checked={!!checked}
        aria-disabled={!!disabled}
      />
      <span aria-hidden="true" className="outer"><span className="dot" /></span>
      {label && (
        <span className="text">{label}</span>
      )}
    </Label>
  );
});

export default FancyRadio;
