import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("light and mid glow controls keep the dynamic edge layer enabled", () => {
  const css = readCss("app/styles/components/glass.css");

  for (const control of [
    "ui-glow-button-frame",
    "ui-glow-option-card-frame",
    "ui-glow-field",
  ]) {
    const block = css.match(
      new RegExp(
        `:root\\.theme-light \\.${control} > \\[class\\*="edgeLight"\\][\\s\\S]*?:root\\.theme-mid \\.${control} > \\[class\\*="edgeLight"\\][\\s\\S]*?\\n\\}`
      )
    );

    assert.ok(block, `${control} should define light/mid edgeLight display`);
    assert.match(block[0], /display:\s*block\s*!important/);
    assert.doesNotMatch(block[0], /display:\s*none\s*!important/);
  }
});

test("light and mid glow controls do not jump pointer edge state on hover", () => {
  const css = readCss("app/styles/components/glass.css");

  for (const control of [
    "ui-glow-button-frame",
    "ui-glow-option-card-frame",
    "ui-glow-field",
  ]) {
    const hoverBlock = css.match(
      new RegExp(
        `:root\\.theme-light \\.${control}:hover[\\s\\S]*?:root\\.theme-mid \\.${control}:hover[\\s\\S]*?\\n\\}`
      )
    );

    assert.ok(hoverBlock, `${control} should define light/mid hover styling`);
    assert.match(hoverBlock[0], /background:/);
    assert.match(hoverBlock[0], /box-shadow:/);
    assert.doesNotMatch(hoverBlock[0], /--edge-proximity:\s*100/);
    assert.doesNotMatch(hoverBlock[0], /--cursor-angle:\s*90deg/);
  }
});

test("light and mid glow controls define idle transparent glow layers", () => {
  const css = readCss("app/styles/components/glass.css");
  const buttonIdleBlock = css.match(
    /:root\.theme-light \.ui-glow-button-frame,[\s\S]*?:root\.theme-mid \.ui-glow-button-frame\s*\{([\s\S]*?)\n\}/
  );
  const optionIdleBlock = css.match(
    /:root\.theme-light \.ui-glow-option-card-frame,[\s\S]*?:root\.theme-mid \.ui-glow-option-card-frame\s*\{([\s\S]*?)\n\}/
  );
  const lightFieldIdleBlock = css.match(
    /:root\.theme-light \.ui-glow-field\s*\{([\s\S]*?)\n\}/
  );
  const midFieldIdleBlock = css.match(
    /:root\.theme-mid \.ui-glow-field\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(buttonIdleBlock, "light/mid buttons should define idle shadow shape");
  assert.ok(optionIdleBlock, "light/mid option cards should define idle shadow shape");
  assert.ok(lightFieldIdleBlock, "light fields should define idle shadow shape");
  assert.ok(midFieldIdleBlock, "mid fields should define idle shadow shape");
  assert.match(buttonIdleBlock[1], /rgba\(197,\s*113,\s*113,\s*0\)/);
  assert.match(optionIdleBlock[1], /rgba\(197,\s*113,\s*113,\s*0\)/);
  assert.match(lightFieldIdleBlock[1], /rgba\(197,\s*113,\s*113,\s*0\)/);
  assert.match(midFieldIdleBlock[1], /rgba\(197,\s*113,\s*113,\s*0\)/);
});

test("light and mid buttons use an outer glow ring without inset double edges", () => {
  const css = readCss("app/styles/components/glass.css");
  const buttonHoverBlock = css.match(
    /:root\.theme-light \.ui-glow-button-frame:hover:not\([^)]*\),[\s\S]*?:root\.theme-mid \.ui-glow-button-frame:hover:not\([^)]*\)\s*\{([\s\S]*?)\n\}/
  );
  const softEdgeHoverBlock = css.match(
    /:root\.theme-light \.ui-glow-button-frame:hover:not\([^)]*\) > \.ui-glow-button-soft-edge,[\s\S]*?:root\.theme-mid \.ui-glow-button-frame:hover:not\([^)]*\) > \.ui-glow-button-soft-edge\s*\{([\s\S]*?)\n\}/
  );
  const buttonSource = readCss("components/ui/Button.jsx");

  assert.ok(buttonHoverBlock, "light/mid buttons should define hover glow");
  assert.ok(softEdgeHoverBlock, "light/mid buttons should define a soft edge layer");
  assert.match(buttonSource, /ui-glow-button-soft-edge/);
  assert.match(buttonHoverBlock[1], /0 0 3px rgba\(122,\s*58,\s*56,\s*0\.13\)/);
  assert.match(buttonHoverBlock[1], /0 0 9px rgba\(197,\s*113,\s*113,\s*0\.095\)/);
  assert.match(buttonHoverBlock[1], /0 0 18px rgba\(197,\s*113,\s*113,\s*0\.055\)/);
  assert.doesNotMatch(buttonHoverBlock[1], /0 0 0 1px rgba\(122,\s*58,\s*56/);
  assert.doesNotMatch(buttonHoverBlock[1], /inset\s+0 0 0 1px rgba\(122,\s*58,\s*56/);
  assert.doesNotMatch(buttonHoverBlock[1], /inset\s+0 0 5px rgba\(197,\s*113,\s*113/);
  assert.doesNotMatch(softEdgeHoverBlock[1], /inset 0 0 0 1px rgba\(122,\s*58,\s*56/);
  assert.match(softEdgeHoverBlock[1], /inset 0 0 4px rgba\(122,\s*58,\s*56,\s*0\.13\)/);
  assert.match(softEdgeHoverBlock[1], /inset 0 0 9px rgba\(197,\s*113,\s*113,\s*0\.055\)/);
});

test("light and mid input fields keep edge glow without inset double edges", () => {
  const css = readCss("app/styles/components/glass.css");
  const serviceMapCss = readCss("app/styles/components/service-map.css");
  const lightFieldIdleBlock = css.match(
    /:root\.theme-light \.ui-glow-field\s*\{([\s\S]*?)\n\}/
  );
  const midFieldIdleBlock = css.match(
    /:root\.theme-mid \.ui-glow-field\s*\{([\s\S]*?)\n\}/
  );
  const lightFieldHoverBlock = css.match(
    /:root\.theme-light \.ui-glow-field:hover\s*\{([\s\S]*?)\n\}/
  );
  const midFieldHoverBlock = css.match(
    /:root\.theme-mid \.ui-glow-field:hover\s*\{([\s\S]*?)\n\}/
  );
  const fieldEdgeBlock = css.match(
    /:root\.theme-light :is\(\.ui-glow-field, \.invite-glow-field\) > \.edgeLight::before,[\s\S]*?:root\.theme-mid :is\(\.ui-glow-field, \.invite-glow-field\) > \[class\*="edgeLight"\]::before\s*\{([\s\S]*?)\n\}/
  );
  const lightServiceProfileBlock = serviceMapCss.match(
    /:root\.theme-light \.service-profile-glow-field\s*\{([\s\S]*?)\n\}/
  );
  const midServiceProfileBlock = serviceMapCss.match(
    /:root\.theme-mid \.service-profile-glow-field\s*\{([\s\S]*?)\n\}/
  );

  for (const block of [
    lightFieldIdleBlock,
    midFieldIdleBlock,
    lightFieldHoverBlock,
    midFieldHoverBlock,
    fieldEdgeBlock,
    lightServiceProfileBlock,
    midServiceProfileBlock,
  ]) {
    assert.ok(block, "light/mid fields should define field-specific glow styling");
    assert.doesNotMatch(block[1], /inset\s+0 0 0 1px rgba\(122,\s*58,\s*56/);
    assert.doesNotMatch(block[1], /0 0 0 1px rgba\(122,\s*58,\s*56/);
  }
});

test("option card glow transitions use the same slow easing as other glow controls", () => {
  const source = readCss("components/ui/OptionCard.jsx");

  assert.match(source, /duration-\[560ms\]/);
  assert.match(source, /cubic-bezier\(0\.22,0\.61,0\.36,1\)/);
  assert.doesNotMatch(
    source.match(/const baseCard = "[\s\S]*?";/)?.[0] || "",
    /duration-150 ease-out/
  );
});

test("border glow edge color enters and tracks pointer smoothly across controls", () => {
  const css = readCss("components/ui/BorderGlow.module.css");
  const source = readCss("components/ui/BorderGlow.jsx");

  assert.match(
    css,
    /transition:\s*opacity var\(--border-glow-enter-duration,\s*0\.78s\) cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/
  );
  assert.match(
    css,
    /transition:\s*opacity var\(--border-glow-exit-duration,\s*1\.05s\) cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/
  );
  assert.match(source, /currentProximityRef\.current \+= edgeDelta \* 0\.12/);
  assert.match(source, /currentAngleRef\.current \+ angleDelta \* 0\.11/);
});

test("shared border glow avoids hard full-edge outline shadows", () => {
  const css = readCss("components/ui/BorderGlow.module.css");
  const edgeBlock = css.match(/\.edgeLight::before\s*\{([\s\S]*?)\n\}/);
  const edgeOnlyBlock = css.match(/\.edgeOnly > \.edgeLight::before\s*\{([\s\S]*?)\n\}/);
  const lightMidBlock = css.match(
    /:global\(:root\.theme-light\) \.edgeLight::before,[\s\S]*?:global\(:root\.theme-mid\) \.edgeOnly > \.edgeLight::before\s*\{([\s\S]*?)\n\}/
  );

  for (const block of [edgeBlock, edgeOnlyBlock, lightMidBlock]) {
    assert.ok(block, "shared edge glow block should exist");
    assert.doesNotMatch(block[1], /inset\s+0 0 0 1px/);
    assert.doesNotMatch(block[1], /0 0 0 1px/);
    assert.doesNotMatch(block[1], /50px/);
    assert.doesNotMatch(block[1], /52px/);
  }
});
