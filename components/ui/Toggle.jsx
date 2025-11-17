"use client";
import EyeIcon from "@/public/logo/silma.svg";

export default function Toggle({ id = "toggle", checked, onChange, ariaDescribedBy }) {
  const handleChange = (event) => {
    const next = event.target.checked;
    if (onChange) onChange(next);
  };

  return (
    <div className="toggle-cont">
      <input
        className="toggle-input"
        id={id}
        name={id}
        type="checkbox"
        checked={!!checked}
        onChange={handleChange}
        aria-describedby={ariaDescribedBy}
      />
      <label className="toggle-label" htmlFor={id}>
        <div className="cont-icon" aria-hidden="true">
          <span style={{ "--width": 2, "--deg": 25, "--duration": 11 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 100, "--duration": 18 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 280, "--duration": 5 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 200, "--duration": 3 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 30, "--duration": 20 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 300, "--duration": 9 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 250, "--duration": 4 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 210, "--duration": 8 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 100, "--duration": 9 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 15, "--duration": 13 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 75, "--duration": 18 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 65, "--duration": 6 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 50, "--duration": 7 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 320, "--duration": 5 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 220, "--duration": 5 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 215, "--duration": 2 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 135, "--duration": 9 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 45, "--duration": 4 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 78, "--duration": 16 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 89, "--duration": 19 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 65, "--duration": 14 }} className="sparkle" />
          <span style={{ "--width": 2, "--deg": 97, "--duration": 1 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 174, "--duration": 10 }} className="sparkle" />
          <span style={{ "--width": 1, "--deg": 236, "--duration": 5 }} className="sparkle" />
          <EyeIcon aria-hidden="true" className="toggle-icon-eye" />
        </div>
      </label>
    </div>
  );
}

