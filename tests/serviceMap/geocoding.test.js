import test from "node:test";
import assert from "node:assert/strict";

import { geocodeServiceMapAddress } from "../../lib/serviceMap/geocoding.js";

const originalFetch = globalThis.fetch;
const originalProvider = process.env.SERVICE_MAP_GEOCODER_PROVIDER;
const originalBaseUrl = process.env.SERVICE_MAP_GEOCODER_BASE_URL;

function restoreEnv() {
  if (originalProvider === undefined) delete process.env.SERVICE_MAP_GEOCODER_PROVIDER;
  else process.env.SERVICE_MAP_GEOCODER_PROVIDER = originalProvider;
  if (originalBaseUrl === undefined) delete process.env.SERVICE_MAP_GEOCODER_BASE_URL;
  else process.env.SERVICE_MAP_GEOCODER_BASE_URL = originalBaseUrl;
  globalThis.fetch = originalFetch;
}

test.afterEach(restoreEnv);

test("Maa- ja Ruumiamet provider maps In-AKS Gazetteer address response", async () => {
  process.env.SERVICE_MAP_GEOCODER_PROVIDER = "maaruum";
  process.env.SERVICE_MAP_GEOCODER_BASE_URL = "https://aks.geoportaal.ee/inaks/inaadress/gazetteer";
  globalThis.fetch = async (url, options) => {
    assert.equal(url.searchParams.get("address"), "Suur-Sepa 16, Pärnu");
    assert.equal(options.headers.Accept, "application/json");
    return Response.json({
      addresses: [
        {
          ipikkaadress: "Suur-Sepa tn 16, Pärnu linn, Pärnu linn, Pärnu maakond",
          adr_id: "3072342",
          ads_oid: "ME00706027",
          viitepunkt_b: "58.382345",
          viitepunkt_l: "24.510193",
          kvaliteet: "tapne_nr",
          primary: "true"
        }
      ]
    });
  };

  const result = await geocodeServiceMapAddress("Suur-Sepa 16, Pärnu");

  assert.equal(result.status, "MATCHED");
  assert.equal(result.provider, "maaruum");
  assert.equal(result.normalizedAddress, "Suur-Sepa tn 16, Pärnu linn, Pärnu linn, Pärnu maakond");
  assert.equal(result.latitude, 58.382345);
  assert.equal(result.longitude, 24.510193);
  assert.equal(result.adsObjectId, "3072342");
});

test("Maa- ja Ruumiamet aliases use the same provider adapter", async () => {
  process.env.SERVICE_MAP_GEOCODER_PROVIDER = "inaks";
  globalThis.fetch = async () => Response.json({
    addresses: [
      {
        pikkaadress: "Pärnu maakond, Pärnu linn, Pärnu linn, Suur-Sepa tn 16",
        adr_id: "3072342",
        viitepunkt_b: 58.382345,
        viitepunkt_l: 24.510193
      }
    ]
  });

  const result = await geocodeServiceMapAddress("Suur-Sepa 16, Pärnu");

  assert.equal(result.status, "MATCHED");
  assert.equal(result.provider, "maaruum");
});

test("Maa- ja Ruumiamet provider keeps multiple valid matches ambiguous", async () => {
  process.env.SERVICE_MAP_GEOCODER_PROVIDER = "maaamet";
  globalThis.fetch = async () => Response.json({
    addresses: [
      {
        pikkaadress: "Harju maakond, Tallinn, Testi tn 1",
        adr_id: "1",
        viitepunkt_b: 59.4,
        viitepunkt_l: 24.7
      },
      {
        pikkaadress: "Tartu maakond, Tartu linn, Testi tn 1",
        adr_id: "2",
        viitepunkt_b: 58.4,
        viitepunkt_l: 26.7
      }
    ]
  });

  const result = await geocodeServiceMapAddress("Testi 1");

  assert.equal(result.status, "AMBIGUOUS");
  assert.equal(result.raw.candidates.length, 2);
});
