import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()

function readSource(path) {
  return readFileSync(join(root, path), "utf8")
}

test("submitted materials admin panel lives only on the RAG documents page", () => {
  const materialsPage = readSource("components/materials/MaterialsPage.jsx")
  const materialsRoute = readSource("app/materjalid/page.js")
  const ragDocumentsView = readSource("components/admin/rag/RagAdminDocumentsView.jsx")
  const sharedPanel = readSource("components/materials/MaterialsAdminSubmissionsPanel.jsx")

  assert.doesNotMatch(materialsPage, /MaterialsAdminSubmissionsPanel/)
  assert.doesNotMatch(materialsPage, /materials_page\.admin\.title/)
  assert.doesNotMatch(materialsRoute, /isAdmin/)
  assert.doesNotMatch(materialsRoute, /getServerSession/)

  assert.match(ragDocumentsView, /import MaterialsAdminSubmissionsPanel from "@\/components\/materials\/MaterialsAdminSubmissionsPanel"/)
  assert.match(ragDocumentsView, /<MaterialsAdminSubmissionsPanel\s+variant="ragAdmin"/)
  assert.match(
    ragDocumentsView,
    /id="rag-documents-settings"[\s\S]*<MaterialsAdminSubmissionsPanel\s+variant="ragAdmin"/
  )

  assert.match(sharedPanel, /export default function MaterialsAdminSubmissionsPanel/)
  assert.match(sharedPanel, /fetch\("\/api\/materials\?limit=100"/)
  assert.match(sharedPanel, /materials_page\.admin\.title/)
})

test("materials upload note field uses the extra vertical room on the standalone page", () => {
  const materialsPage = readSource("components/materials/MaterialsPage.jsx")
  const glassCss = readSource("app/styles/components/glass.css")

  assert.match(materialsPage, /materials-comment-box min-h-\[12rem\]/)
  assert.match(glassCss, /\.materials-comment-glow-field\s*\{[\s\S]*?min-height:\s*12rem;/)
})

test("materials page keeps the title close to the intro copy", () => {
  const materialsPage = readSource("components/materials/MaterialsPage.jsx")
  const glassCss = readSource("app/styles/components/glass.css")
  const glassPageStyles = readSource("components/ui/glassPageStyles.js")

  assert.match(materialsPage, /const compactSubpageTitleClassName =\s*"compact-workspace-subpage-title"/)
  assert.match(materialsPage, /<p className="m-0 text-\[1\.08rem\]/)
  assert.match(
    glassPageStyles,
    /min-\[769px\]:!mt-\[var\(--glass-subpage-title-margin-top\)\][\s\S]*min-\[769px\]:!mb-\[var\(--glass-subpage-title-margin-bottom\)\]/
  )
  assert.match(
    materialsPage,
    /<GlassSubpageHeader[\s\S]*?headerClassName="!mb-0"[\s\S]*?titleClassName=\{compactSubpageTitleClassName\}/
  )
  assert.match(
    glassCss,
    /\.glass-subpage-title\s*\{[\s\S]*?--glass-subpage-title-margin-top:\s*clamp\(2\.15rem,\s*5\.4vh,\s*3\.25rem\);[\s\S]*?--glass-subpage-title-margin-bottom:\s*clamp\(0\.35rem,\s*1\.4vh,\s*0\.8rem\);/
  )
  assert.match(
    glassCss,
    /@media\s*\(min-width:\s*769px\)\s*\{[\s\S]*?\.compact-workspace-subpage-title\.glass-subpage-title\s*\{[\s\S]*?--glass-subpage-title-margin-top:\s*clamp\(2\.15rem,\s*5\.4vh,\s*3\.25rem\);[\s\S]*?--glass-subpage-title-margin-bottom:\s*0;/
  )
})

test("materials page keeps upload controls below the intro text", () => {
  const materialsPage = readSource("components/materials/MaterialsPage.jsx")

  assert.doesNotMatch(materialsPage, /mt-\[-0\.36rem\]/)
  assert.doesNotMatch(materialsPage, /!mt-\[-0\.6rem\]/)
  assert.doesNotMatch(materialsPage, /-translate-y-\[0\.28rem\]/)
  assert.match(materialsPage, /className=\{`mt-\[0\.42rem\] grid gap-\[0\.68rem\]/)
  assert.match(materialsPage, /materials-upload-choose-button[\s\S]*?!mt-\[0\.1rem\][\s\S]*?!mb-\[0\.62rem\]/)
})
