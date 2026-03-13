import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

function readText(relativePath) {
  const absolutePath = path.join(process.cwd(), relativePath)
  return fs.readFileSync(absolutePath, "utf8")
}

test("materials page buttons are wired to theme button tokens", () => {
  const source = readText("components/materials/MaterialsPage.jsx")

  assert.match(source, /materials-page-shell/)
  assert.match(source, /materials-upload-choose-button/)
  assert.match(source, /materials-upload-submit-button/)
  assert.match(source, /\[background:var\(--btn-primary-bg\)\]/)
  assert.match(source, /shadow-\[var\(--btn-primary-shadow\)\]/)
})

test("materials page has dedicated theme overrides in light and mid", () => {
  const lightCss = readText("app/styles/theme/light.css")
  const midCss = readText("app/styles/theme/mid.css")

  assert.match(lightCss, /:root\.theme-light:not\(\.theme-mid\)/)
  assert.match(lightCss, /\.materials-page-shell/)
  assert.match(lightCss, /materials-upload-choose-button/)
  assert.match(lightCss, /--btn-primary-bg:/)

  assert.match(midCss, /:root\.theme-mid/)
  assert.match(midCss, /\.materials-page-shell/)
  assert.match(midCss, /materials-upload-submit-button/)
  assert.match(midCss, /--btn-primary-bg:/)
})

test("dark, night and hc themes provide primary button tokens for materials page", () => {
  const tokensCss = readText("app/styles/tokens.css")
  const darkCss = readText("app/styles/theme/dark.css")
  const nightCss = readText("app/styles/theme/night.css")
  const hcCss = readText("app/styles/theme/hc.css")

  assert.match(tokensCss, /--btn-primary-bg:/, "tokens.css must define --btn-primary-bg")
  assert.match(tokensCss, /--btn-primary-shadow:/, "tokens.css must define --btn-primary-shadow")
  assert.match(tokensCss, /--btn-primary-border:/, "tokens.css must define --btn-primary-border")

  assert.match(darkCss, /var\(--btn-primary-bg\)/, "dark.css must consume --btn-primary-bg")
  assert.match(darkCss, /var\(--btn-primary-shadow\)/, "dark.css must consume --btn-primary-shadow")
  assert.match(darkCss, /\.materials-page-shell/, "dark.css must define materials-page-shell overrides")
  assert.match(darkCss, /materials-upload-submit-button/, "dark.css must define materials button overrides")
  assert.doesNotMatch(darkCss, /inset 0 -1px 0 rgba\(5, 6, 9,/, "dark.css should not add bottom inset stripe")

  assert.match(nightCss, /--btn-primary-bg:/, "night.css must define --btn-primary-bg")
  assert.match(nightCss, /--btn-primary-shadow:/, "night.css must define --btn-primary-shadow")
  assert.match(nightCss, /--btn-primary-border:/, "night.css must define --btn-primary-border")
  assert.match(nightCss, /\.materials-page-shell/, "night.css must define materials-page-shell overrides")
  assert.match(nightCss, /materials-upload-submit-button/, "night.css must define materials button overrides")
  assert.doesNotMatch(nightCss, /inset 0 -1px 0 rgba\(5, 6, 9,/, "night.css should not add bottom inset stripe")

  assert.match(hcCss, /--btn-primary-bg:/, "hc.css must define --btn-primary-bg")
  assert.match(hcCss, /--btn-primary-shadow:/, "hc.css must define --btn-primary-shadow")
  assert.match(hcCss, /--btn-primary-border:/, "hc.css must define --btn-primary-border")
  assert.match(hcCss, /\.materials-page-shell/, "hc.css must define materials-page-shell overrides")
  assert.match(hcCss, /materials-upload-submit-button/, "hc.css must define materials button overrides")
  assert.doesNotMatch(hcCss, /inset 0 -1px 0 rgba\(5, 6, 9,/, "hc.css should not add bottom inset stripe")
})
