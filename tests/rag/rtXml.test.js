import test from "node:test";
import assert from "node:assert/strict";

const [{ parseRtRegulationXml, buildRtRegulationChunks, buildKovRtXmlIngestPayload }] = await Promise.all([
  import("../../lib/admin/rag/kov/rtXml.js")
]);

function buildXml({ paragraphs = "", actReference = "406112024020" } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<oigusakt xmlns="maarus_1_10.02.2010">
  <metaandmed>
    <valjaandja>J\u00f5geva Vallavolikogu</valjaandja>
    <dokumentLiik>maarus</dokumentLiik>
    <tekstiliik>terviktekst</tekstiliik>
    <avaldamismarge>
      <aktViide>${actReference}</aktViide>
    </avaldamismarge>
    <kehtivus>
      <kehtivuseAlgus>2025-01-01</kehtivuseAlgus>
    </kehtivus>
    <globaalID>${actReference}</globaalID>
  </metaandmed>
  <aktinimi>
    <nimi>
      <pealkiri>Sotsiaalhoolekandelise abi andmise kord J\u00f5geva vallas</pealkiri>
    </nimi>
  </aktinimi>
  <sisu>
    <peatykk>
      <peatykkNr>1</peatykkNr>
      <peatykkPealkiri>\u00dclds\u00e4tted</peatykkPealkiri>
      ${paragraphs}
    </peatykk>
  </sisu>
</oigusakt>`;
}

const SIMPLE_PARAGRAPHS = `
  <paragrahv>
    <paragrahvNr>2</paragrahvNr>
    <paragrahvPealkiri>Sotsiaalhoolekandelise abi saajad</paragrahvPealkiri>
    <loige>
      <loigeNr>1</loigeNr>
      <sisuTekst>
        <tavatekst>Sotsiaalteenust ja -toetust on oigustatud taotlema J\u00f5geva vallas elav isik.</tavatekst>
      </sisuTekst>
    </loige>
    <loige>
      <loigeNr>2</loigeNr>
      <sisuTekst>
        <tavatekst>Koosk\u00f5lastatult v\u00f5ib abi osutada ka isikule, kelle elukoht ei ole J\u00f5geva vald.</tavatekst>
      </sisuTekst>
    </loige>
  </paragrahv>
`;

test("RT XML parse extracts municipality, issuer, act title and paragraph structure", () => {
  const parsed = parseRtRegulationXml(buildXml({ paragraphs: SIMPLE_PARAGRAPHS }), {
    municipality: "J\u00f5geva vald",
    sourceFile: "406112024020.xml"
  });

  assert.equal(parsed.municipality, "J\u00f5geva vald");
  assert.equal(parsed.issuer, "J\u00f5geva Vallavolikogu");
  assert.equal(parsed.actTitle, "Sotsiaalhoolekandelise abi andmise kord J\u00f5geva vallas");
  assert.equal(parsed.actReference, "406112024020");
  assert.equal(parsed.sourceFile, "406112024020.xml");
  assert.equal(parsed.chapters.length, 1);
  assert.equal(parsed.chapters[0].paragraphs.length, 1);
  assert.equal(parsed.chapters[0].paragraphs[0].number, "2");
  assert.equal(parsed.chapters[0].paragraphs[0].subsections.length, 2);
});

test("every RT chunk carries municipality and act title in text and metadata", () => {
  const act = parseRtRegulationXml(buildXml({ paragraphs: SIMPLE_PARAGRAPHS }), {
    municipality: "J\u00f5geva vald",
    sourceFile: "406112024020.xml"
  });
  const chunks = buildRtRegulationChunks(act);

  assert.ok(chunks.length >= 1);
  for (const chunk of chunks) {
    assert.match(chunk.text, /J\u00f5geva vald/);
    assert.match(chunk.text, /Sotsiaalhoolekandelise abi andmise kord J\u00f5geva vallas/);
    assert.match(chunk.text, /\u00A7 2/);
    assert.equal(chunk.metadata.source_type, "riigiteataja_regulation");
    assert.equal(chunk.metadata.municipality, "J\u00f5geva vald");
    assert.equal(chunk.metadata.act_title, "Sotsiaalhoolekandelise abi andmise kord J\u00f5geva vallas");
    assert.equal(chunk.metadata.act_reference, "406112024020");
    assert.equal(chunk.metadata.source_format, "xml");
    assert.equal(chunk.metadata.source_file, "406112024020.xml");
    assert.equal(chunk.metadata.paragraph_number, "2");
  }
});

test("long paragraph without points falls back to subsection chunks", () => {
  const longTextA = "See l\u00f5ik kirjeldab tingimusi v\u00e4ga detailselt ning peab minema eraldi chunki. ".repeat(8);
  const longTextB = "See teine l\u00f5ik kirjeldab teist tingimuste komplekti ning peab samuti eraldi chunki minema. ".repeat(7);
  const xml = buildXml({
    paragraphs: `
      <paragrahv>
        <paragrahvNr>11</paragrahvNr>
        <paragrahvPealkiri>Vajaduspohine toetus</paragrahvPealkiri>
        <loige>
          <loigeNr>1</loigeNr>
          <sisuTekst><tavatekst>${longTextA}</tavatekst></sisuTekst>
        </loige>
        <loige>
          <loigeNr>2</loigeNr>
          <sisuTekst><tavatekst>${longTextB}</tavatekst></sisuTekst>
        </loige>
      </paragrahv>
    `
  });
  const act = parseRtRegulationXml(xml, {
    municipality: "J\u00f5geva vald",
    sourceFile: "406112024020.xml"
  });
  const chunks = buildRtRegulationChunks(act, {
    paragraphMaxChars: 240,
    subsectionMaxChars: 500
  });

  assert.equal(chunks.length, 2);
  assert.deepEqual(chunks.map(chunk => chunk.metadata.chunk_level), ["subsection", "subsection"]);
  assert.deepEqual(chunks.map(chunk => chunk.metadata.subsection_number), ["1", "2"]);
});

test("long subsection with points falls back to point chunks while keeping identity", () => {
  const xml = buildXml({
    paragraphs: `
      <paragrahv>
        <paragrahvNr>3</paragrahvNr>
        <paragrahvPealkiri>Sotsiaalhoolekandelise abi liigid</paragrahvPealkiri>
        <loige>
          <loigeNr>1</loigeNr>
          <sisuTekst>
            <tavatekst>J\u00f5geva vald korraldab j\u00e4rgmisi sotsiaalteenuseid, mille taust ja tingimused on detailselt kirjeldatud allpool.</tavatekst>
          </sisuTekst>
          <alampunkt>
            <alampunktNr>1</alampunktNr>
            <sisuTekst><tavatekst>koduteenus;</tavatekst></sisuTekst>
          </alampunkt>
          <alampunkt>
            <alampunktNr>2</alampunktNr>
            <sisuTekst><tavatekst>sotsiaaltransporditeenus;</tavatekst></sisuTekst>
          </alampunkt>
          <alampunkt>
            <alampunktNr>3</alampunktNr>
            <sisuTekst><tavatekst>v\u00f5lan\u00f5ustamisteenus;</tavatekst></sisuTekst>
          </alampunkt>
        </loige>
      </paragrahv>
    `
  });
  const act = parseRtRegulationXml(xml, {
    municipality: "J\u00f5geva vald",
    sourceFile: "406112024020.xml"
  });
  const chunks = buildRtRegulationChunks(act, {
    paragraphMaxChars: 220,
    subsectionMaxChars: 120
  });

  assert.equal(chunks.length, 3);
  assert.ok(chunks.every(chunk => chunk.metadata.chunk_level === "point"));
  assert.ok(chunks.every(chunk => chunk.metadata.subsection_number === "1"));
  assert.deepEqual(chunks.map(chunk => chunk.metadata.point_number), ["1", "2", "3"]);
  assert.match(chunks[0].text, /\u00A7 3\./);
  assert.match(chunks[0].text, /\(1\)/);
  assert.match(chunks[0].text, /1\) koduteenus;/);
});

test("rebuild payload keeps the same doc_id and canonical source while regenerating the full chunk set", () => {
  const entry = {
    municipality: {
      slug: "jogeva-vald",
      displayName: "J\u00f5geva vald",
      county: "J\u00f5geva"
    },
    riigiTeatajaUrl: "https://www.riigiteataja.ee/akt/406112024020"
  };

  const payloadV1 = buildKovRtXmlIngestPayload(entry, {
    xmlText: buildXml({ paragraphs: SIMPLE_PARAGRAPHS }),
    sourceFile: "406112024020.xml"
  });

  const payloadV2 = buildKovRtXmlIngestPayload(entry, {
    xmlText: buildXml({
      paragraphs: `
        ${SIMPLE_PARAGRAPHS}
        <paragrahv>
          <paragrahvNr>16</paragrahvNr>
          <paragrahvPealkiri>Rakenduss\u00e4te</paragrahvPealkiri>
          <loige>
            <loigeNr>1</loigeNr>
            <sisuTekst><tavatekst>M\u00e4\u00e4rus j\u00f5ustub 2025-01-01.</tavatekst></sisuTekst>
          </loige>
        </paragrahv>
      `
    }),
    sourceFile: "406112024020.xml"
  });

  assert.equal(payloadV1.doc_id, "kov-rt-jogeva-vald");
  assert.equal(payloadV2.doc_id, "kov-rt-jogeva-vald");
  assert.equal(payloadV1.metadata.canonical_source_id, payloadV2.metadata.canonical_source_id);
  assert.ok(payloadV2.chunks.length > payloadV1.chunks.length);
  assert.ok(payloadV2.chunks.every(chunk => chunk.metadata.canonical_chunk_id.startsWith(payloadV2.metadata.canonical_source_id)));
});
