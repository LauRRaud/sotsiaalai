"use client";

import React, { forwardRef } from "react";
import styled from "styled-components";
const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: var(--cursor-pointer);
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-sizing: border-box;
  }
  .svg {
    width: 20px;
    height: 20px;
    display: block;
  }
  .shape {
    fill: none;
    stroke: var(--pt-200, #e0e0e0);
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
    color: var(--pt, #c9c7c2);
    font: inherit;
  }
  .a11y-modal & {
    gap: 0.9rem;
    min-height: 48px;
  }
  .a11y-modal & .box {
    width: 36px;
    height: 36px;
  }
  .a11y-modal & .svg {
    width: 26px;
    height: 26px;
  }
  .a11y-modal & .text {
    font-size: 1.3rem;
  }

  &.fancy-checkbox--top {
    align-items: flex-start;
  }

  &.fancy-checkbox--top .box {
    margin-top: 0.08rem;
    flex-shrink: 0;
  }

  &.fancy-checkbox--otp .box {
    background: transparent;
    border: 0;
    width: var(--otp-check-box-size, 1.82rem);
    height: var(--otp-check-box-size, 1.82rem);
    border-radius: 0.44rem;
    flex-shrink: 0;
  }

  &.fancy-checkbox--otp .svg {
    width: calc(var(--otp-check-box-size, 1.82rem) * 0.8);
    height: calc(var(--otp-check-box-size, 1.82rem) * 0.8);
  }

  &.fancy-checkbox--otp .shape {
    stroke: var(--otp-check-shape, var(--pt-200, #e0e0e0));
    stroke-width: 2.2;
  }

  &.fancy-checkbox--otp .tick {
    stroke: var(--otp-check-tick, var(--brand-primary, #ffd24d));
    stroke-width: 2.5;
    transform: scale(0.86);
    transform-origin: center;
  }

  &.fancy-checkbox--otp .text {
    color: var(--otp-check-text, var(--pt-150, #c9c7c2));
    font-size: var(--otp-check-font-size, 1.3rem);
    font-weight: 500;
    line-height: var(--otp-check-line-height, 1.24);
    white-space: nowrap;
  }

  &.fancy-checkbox--multiline {
    align-items: flex-start;
  }

  &.fancy-checkbox--multiline .box {
    margin-top: var(--otp-check-box-offset, 0.08rem);
    flex-shrink: 0;
  }

  &.fancy-checkbox--multiline .text {
    max-width: var(--otp-check-text-max-width, 100%);
    white-space: normal;
    text-align: left;
    line-height: var(--otp-check-line-height, 1.36);
    overflow-wrap: anywhere;
  }

  &.fancy-checkbox--otp {
    align-items: center;
    gap: 0.58rem;
  }

  &.fancy-checkbox--otp .box {
    transform: translate(0.08rem, -0.08rem);
  }

  &.fancy-checkbox--otp.fancy-checkbox--multiline {
    align-items: flex-start;
  }

  &.fancy-checkbox--otp.fancy-checkbox--multiline .box {
    margin-top: var(--otp-check-box-offset, 0.08rem);
    transform: translate(0.08rem, 0);
  }

  &.fancy-checkbox--otp:focus-within .box {
    outline: none;
    box-shadow: none;
  }

  &.login-otp-remember .box {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    width: 1.98rem !important;
    height: 1.98rem !important;
  }

  &.login-otp-remember .svg {
    width: 1.58rem !important;
    height: 1.58rem !important;
  }

  &.login-otp-remember .tick {
    transform: scale(0.9);
  }

  @media (max-width: 768px) {
    &.fancy-checkbox--otp {
      width: 100%;
      max-width: 100%;
      justify-content: flex-start;
      box-sizing: border-box;
      padding-inline: 0;
    }

    &.fancy-checkbox--otp .text {
      max-width: min(100%, 18rem);
      white-space: normal;
      text-align: left;
      overflow-wrap: anywhere;
    }
  }
`;
const FancyCheckbox = forwardRef(function FancyCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled,
  name,
  className
}, ref) {
  return <Label className={className}>
      <input ref={ref} id={id} name={name} type="checkbox" className="visually-hidden" checked={!!checked} onChange={e => onChange?.(e.target.checked, e)} onKeyDown={e => {
      if (e.key === "Enter") {
        e.preventDefault();
        onChange?.(!checked, e);
      }
    }} disabled={disabled} aria-checked={!!checked} aria-disabled={!!disabled} />
      <span aria-hidden="true" className="box">
        <svg className="svg" viewBox="0 0 24 24" focusable="false">
          <rect className="shape" x="3" y="3" width="18" height="18" rx="4" ry="4" />
          <polyline className="tick" points="6,12 10,16 18,8" />
        </svg>
      </span>
      {label && <span className="text">{label}</span>}
    </Label>;
});
export default FancyCheckbox;
