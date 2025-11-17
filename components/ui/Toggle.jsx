\"use client\";
import EyeIcon from \"@/public/logo/silma.svg\";

export default function Toggle({ id = \"toggle\", checked, onChange, ariaDescribedBy }) {
  const handleChange = (event) => {
    const next = event.target.checked;
    if (onChange) onChange(next);
  };

  const inputId = id || \"toggle\";

  return (
    <label className=\"switch-button\" htmlFor={inputId}>
      <div className=\"switch-outer\">
        <input
          id={inputId}
          type=\"checkbox\"
          checked={!!checked}
          onChange={handleChange}
          aria-describedby={ariaDescribedBy}
          className=\"switch-input\"
        />
        <div className=\"button\">
          <span className=\"button-toggle\">
            <EyeIcon aria-hidden=\"true\" className=\"switch-eye-icon\" />
          </span>
          <span className=\"button-indicator\" />
        </div>
      </div>
    </label>
  );
}
