import assert from "node:assert/strict"
import {
  createArtifactDocxBuffer,
  normalizeTemplatePlaceholders,
  replaceTemplateDocumentXml
} from "../lib/documents/docxExport.js"

const splitPlaceholderXml = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>{{TI</w:t></w:r>
      <w:r><w:t>TLE}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>{{CONTENT_</w:t></w:r>
      <w:r><w:t>BLOCK}}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`

const normalizedXml = normalizeTemplatePlaceholders(splitPlaceholderXml)
assert.match(normalizedXml, /\{\{TITLE\}\}/)
assert.match(normalizedXml, /\{\{CONTENT_BLOCK\}\}/)

const renderedXml = replaceTemplateDocumentXml(splitPlaceholderXml, {
  artifact: {
    title: "Test report",
    type: "REPORT_DRAFT",
    content: "First line\nSecond line"
  },
  approvedAtLabel: "2026-02-27",
  sources: []
})

assert.doesNotMatch(renderedXml, /\{\{TITLE\}\}/)
assert.doesNotMatch(renderedXml, /\{\{CONTENT_BLOCK\}\}/)
assert.match(renderedXml, /Test report/)
assert.match(renderedXml, /First line/)
assert.match(renderedXml, /Second line/)
assert.match(renderedXml, /No source documents linked\./)

const sourcesXml = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>{{SOURCES_</w:t></w:r>
      <w:r><w:t>BLOCK}}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`

const renderedSourcesXml = replaceTemplateDocumentXml(sourcesXml, {
  artifact: {
    title: "Test report",
    type: "REPORT_DRAFT",
    content: "Body"
  },
  approvedAtLabel: "2026-02-27",
  sources: [
    {
      title: "Case input",
      originalName: "case-input.txt"
    },
    {
      title: "Template source",
      originalName: "template.docx"
    }
  ]
})

assert.doesNotMatch(renderedSourcesXml, /\{\{SOURCES_BLOCK\}\}/)
assert.match(renderedSourcesXml, /Case input/)
assert.match(renderedSourcesXml, /case-input\.txt/)
assert.match(renderedSourcesXml, /Template source/)

const invalidTemplateBuffer = Buffer.from("not-a-real-docx", "utf8")
const originalConsoleError = console.error
let fallbackDocxBuffer
try {
  console.error = () => {}
  fallbackDocxBuffer = createArtifactDocxBuffer({
    artifact: {
      id: "artifact-1",
      title: "Fallback report",
      type: "REPORT_DRAFT",
      content: "Fallback body",
      approvedAt: "2026-02-27T00:00:00.000Z"
    },
    sources: [],
    templateBuffer: invalidTemplateBuffer
  })
} finally {
  console.error = originalConsoleError
}

assert.equal(Buffer.isBuffer(fallbackDocxBuffer), true)
assert.equal(fallbackDocxBuffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])), true)

const fallbackDocxText = fallbackDocxBuffer.toString("latin1")
assert.match(fallbackDocxText, /word\/document\.xml/)
