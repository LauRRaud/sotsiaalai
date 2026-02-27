import assert from "node:assert/strict"
import { createArtifactPdfBuffer } from "../lib/documents/pdfExport.js"

const pdfBuffer = createArtifactPdfBuffer({
  artifact: {
    id: "artifact-1",
    title: "Juhtumi kokkuvõte",
    type: "CASE_BRIEF",
    content: "Esimene rida\nTeine rida",
    approvedAt: "2026-02-27T12:00:00.000Z"
  },
  sources: [
    {
      title: "Sisendmaterjal",
      originalName: "sisend.txt"
    }
  ]
})

assert.equal(Buffer.isBuffer(pdfBuffer), true)
assert.equal(pdfBuffer.subarray(0, 5).toString("latin1"), "%PDF-")

const pdfText = pdfBuffer.toString("latin1")
assert.match(pdfText, /Juhtumi kokkuvõte/)
assert.match(pdfText, /Tüüp: Case Brief/)
assert.match(pdfText, /Kinnitatud: 2026-02-27/)
assert.match(pdfText, /Esimene rida/)
assert.match(pdfText, /Sisendmaterjal/)
