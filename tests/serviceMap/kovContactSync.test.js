import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { syncKovContactsToServiceMap } from "../../lib/serviceMap/kovContactSync.js";

async function makeTempKovRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), "kov-contact-sync-"));
}

test("sync reads central KOV contact registry before folder contact items", async () => {
  const kovRoot = await makeTempKovRoot();
  await fs.mkdir(path.join(kovRoot, "parnu-linn"));
  await fs.writeFile(
    path.join(kovRoot, "parnu-linn", "parnu-linn.json"),
    JSON.stringify({
      municipality_id: "parnu-linn",
      municipality_name: "Parnu linn",
      items: [
        {
          itemType: "contact",
          name: "Folder Contact",
          email: "folder@example.test"
        }
      ]
    })
  );
  await fs.writeFile(
    path.join(kovRoot, "kov_kontaktid_loplik.json"),
    JSON.stringify([
      {
        slug: "parnu-linn",
        municipality: "Parnu linn",
        name: "Central Contact",
        title: "Sotsiaaltöötaja",
        role: "sotsiaaltöötaja",
        department: "Sotsiaalosakond",
        phone: "+372 444 8200",
        email: "central@example.test",
        address: "Suur-Sepa 16, Pärnu",
        officialUrl: "https://parnu.ee/sotsiaal"
      }
    ])
  );

  const upserts = [];
  const prisma = {
    municipality: {
      findFirst: async ({ where }) => {
        assert.equal(where.OR[0].slug, "parnu-linn");
        return {
          id: "parnu-id",
          slug: "parnu-linn",
          displayName: "Parnu linn",
          county: "Parnumaa"
        };
      }
    },
    serviceMapEntry: {
      findUnique: async () => null,
      upsert: async (payload) => {
        upserts.push(payload);
        return payload.create;
      }
    }
  };

  const result = await syncKovContactsToServiceMap({
    kovRoot,
    prisma,
    dryRun: false
  });

  assert.equal(result.scannedFiles, 1);
  assert.equal(result.scannedContacts, 1);
  assert.equal(result.upserted, 1);
  assert.equal(upserts[0].create.title, "Central Contact");
  assert.equal(upserts[0].create.email, "central@example.test");
  assert.equal(upserts[0].create.phone, "+372 444 8200");
  assert.equal(upserts[0].create.sourceUrl, "https://parnu.ee/sotsiaal");
});

test("central contacts with same title get stable distinct ids from name and email", async () => {
  const kovRoot = await makeTempKovRoot();
  await fs.writeFile(
    path.join(kovRoot, "kov_kontaktid_loplik.json"),
    JSON.stringify([
      {
        slug: "anija-vald",
        municipality: "Anija vald",
        title: "Sotsiaaltööspetsialist",
        name: "Airi Hõrrak",
        email: "airi.horrak@example.test"
      },
      {
        slug: "anija-vald",
        municipality: "Anija vald",
        title: "Sotsiaaltööspetsialist",
        name: "Lydia Kruusmann",
        email: "lydia.kruusmann@example.test"
      }
    ])
  );

  const prisma = {
    municipality: {
      findFirst: async () => ({
        id: "anija-id",
        slug: "anija-vald",
        displayName: "Anija vald",
        county: "Harjumaa"
      })
    },
    serviceMapEntry: {
      findUnique: async () => null,
      upsert: async () => {
        throw new Error("dry run should not upsert");
      }
    }
  };

  const result = await syncKovContactsToServiceMap({
    kovRoot,
    prisma,
    dryRun: true
  });

  assert.equal(result.entries.length, 2);
  assert.notEqual(result.entries[0].id, result.entries[1].id);
  assert.deepEqual(result.entries.map((entry) => entry.title), ["Airi Hõrrak", "Lydia Kruusmann"]);
});
