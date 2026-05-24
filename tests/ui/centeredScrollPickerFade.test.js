import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("register and accessibility dim only the edge item without scroll masks or hard panels", () => {
  const css = readCss("components/CenteredScrollPicker.css");
  const sharedBlocks = [
    ...css.matchAll(
      /\.register-scroll\.csp-container,[\s\S]*?\.a11y-csp-scroll\.csp-container\s*\{([\s\S]*?)\n\}/g
    ),
  ];
  const finalOverride = sharedBlocks.at(-1);

  assert.ok(finalOverride, "register/accessibility mask override should exist");
  assert.match(
    finalOverride[1],
    /-webkit-mask-image:\s*none\s*!important/
  );
  assert.match(
    finalOverride[1],
    /mask-image:\s*none\s*!important/
  );
  assert.match(
    finalOverride[1],
    /--csp-edge-overscan-top:\s*clamp\(/,
    "scroll area should overscan upward so content clips at the ring edge"
  );
  assert.match(
    finalOverride[1],
    /--csp-edge-overscan-bottom:\s*clamp\(/,
    "scroll area should overscan downward so content clips at the ring edge"
  );
  assert.doesNotMatch(finalOverride[1], /clip-path:/);
  assert.match(
    finalOverride[1],
    /margin-top:\s*calc\(-1 \* var\(--csp-edge-overscan-top\)\)/
  );
  assert.match(
    finalOverride[1],
    /margin-bottom:\s*calc\(-1 \* var\(--csp-edge-overscan-bottom\)\)/
  );
  assert.match(
    css,
    /\.register-scroll\.csp-container \.register-step,[\s\S]*?\.a11y-csp-scroll\.csp-container \.csp-step\s*\{[\s\S]*?opacity:\s*var\(--csp-edge-opacity,\s*1\);/
  );

  const picker = readSource("components/CenteredScrollPicker.jsx");
  assert.match(picker, /applyEdgeVisibility = false/);
  assert.match(picker, /edgeVisibilityMin = 0\.08/);
  assert.match(picker, /containerRect\.height \* 0\.26/);
  assert.match(picker, /const easedProgress = progress \*\* 1\.75;/);
  assert.match(picker, /minOpacity \+ \(1 - minOpacity\) \* easedProgress/);
  assert.match(picker, /item\.style\.setProperty\("--csp-edge-opacity",\s*opacity\.toFixed\(3\)\);/);

  const register = readSource("components/alalehed/RegistreerimineBody.jsx");
  assert.match(register, /applyItemVisibility:\s*isMobileViewport/);
  assert.match(register, /manageHiddenFocus:\s*isMobileViewport/);
  assert.match(register, /applyEdgeVisibility:\s*!isMobileViewport/);
  assert.match(register, /edgeVisibilityMin:\s*0\.06/);
  assert.match(
    register,
    /const proxyWheelToRegisterScroll = useSmoothWheelProxy\(\{[\s\S]*?scrollRef,[\s\S]*?passthroughNativeTargets:\s*false,/
  );
  assert.doesNotMatch(register, /eventTargetRef:\s*ringRef/);
  assert.match(
    register,
    /<GlassRing[\s\S]*?onWheel=\{proxyWheelToRegisterScroll\}/
  );
  assert.match(
    register,
    /const getRegisterStepClassName = \(index\) =>\s*\n\s*isMobileViewport \? getItemClassName\(index\) : "";/
  );

  const accessibility = readSource("components/accessibility/AccessibilityModal.jsx");
  assert.match(accessibility, /applyItemVisibility:\s*isMobileViewport/);
  assert.match(accessibility, /manageHiddenFocus:\s*isMobileViewport/);
  assert.match(accessibility, /applyEdgeVisibility:\s*!isMobileViewport/);
  assert.match(accessibility, /edgeVisibilityMin:\s*0\.06/);
  assert.match(
    accessibility,
    /useSmoothWheelProxy\(\{[\s\S]*?scrollRef,[\s\S]*?passthroughNativeTargets:\s*false,/
  );
  assert.match(
    accessibility,
    /const getA11yStepClassName = index =>\s*\n\s*isMobileViewport \? getItemClassName\(index\) : "";/
  );
});
