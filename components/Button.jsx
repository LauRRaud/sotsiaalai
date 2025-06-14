import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <div className="button-container">
        <div className="button">
          <span>Küsi nõu</span>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button-container {
    perspective: 1000px;
  }

  .button {
    width: 260px;
    height: 64px;
    border-radius: 32px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.05)
    );
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(255, 255, 255, 0.1);
    transform: rotateX(15deg) translateZ(0);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    position: relative;
    cursor: pointer;
    animation: pulse 2s infinite ease-in-out;
    overflow: hidden;
  }

  .button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -50px;
    width: 50px;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: skewX(-25deg);
    pointer-events: none;
    z-index: 1;
  }

  .button::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 10%;
    width: 80%;
    height: 10px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.3) 0%,
      transparent 70%
    );
    z-index: -1;
  }

  .button span {
    position: relative;
    z-index: 2;
    color: white;
    font-size: 22px;
    font-family: Arial, sans-serif;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    display: block;
    line-height: 64px;
    text-align: center;
  }

  .button:hover {
    transform: rotateX(0deg) translateZ(15px) scale(1.05);
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(255, 255, 255, 0.25);
  }

  .button:active {
    transform: rotateX(0deg) translateZ(-5px) scale(0.95);
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 10px rgba(255, 255, 255, 0.1);
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.2),
        0 0 20px rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.4),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.2),
        0 0 30px rgba(255, 255, 255, 0.2);
    }
  }

  @keyframes shine {
    0% {
      left: -50px;
    }
    100% {
      left: 310px;
    }
  }
`;

export default Button;
