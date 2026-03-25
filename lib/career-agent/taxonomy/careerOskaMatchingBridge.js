// /lib/career-agent/taxonomy/careerOskaMatchingBridge.js

import { computeCareerFit } from "../core/careerMatchingEngine.js";
import { getCareerMatchingText } from "../careerText.js";
import { getSharedCareerTaxonomyService } from "./careerTaxonomyService.js";

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values = []) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function getMatchingText(options = {}) {
  return getCareerMatchingText(
    options.locale ||
      options.language ||
      options.documentLanguage ||
      options.matchingOptions?.locale ||
      options.matchingOptions?.language ||
      "et"
  );
}

function getDirectionTitleValue(direction) {
  if (typeof direction === "string") {
    return direction;
  }

  const title = coerceString(direction?.title?.value || direction?.title);
  if (title) return title;

  const label = coerceString(direction?.label?.value || direction?.label);
  if (label) return label;

  return null;
}

function buildQueryCandidates(opportunity = {}) {
  return uniqueStrings([
    coerceString(opportunity.title),
    ...toSafeArray(opportunity.roleKeywords).map((item) => coerceString(item)),
    coerceString(opportunity.sector),
    coerceString(opportunity.field),
  ]);
}

function pickBestByMatchScore(results = []) {
  const safeResults = toSafeArray(results).filter(Boolean);
  if (!safeResults.length) return null;

  return safeResults.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0];
}

async function findBestOccupationForOpportunity(opportunity, taxonomyService, options = {}) {
  const queries = buildQueryCandidates(opportunity);
  const minScore = Number.isFinite(options.minOccupationScore)
    ? options.minOccupationScore
    : 0.48;

  const candidates = [];

  for (const query of queries) {
    const match = await taxonomyService.findBestOccupation(query, {
      minScore,
    });

    if (match) {
      candidates.push({
        ...match,
        matchedQuery: query,
      });
    }
  }

  return pickBestByMatchScore(candidates);
}

async function findBestFieldForOpportunity(opportunity, taxonomyService, options = {}) {
  const queries = uniqueStrings([
    coerceString(opportunity.sector),
    coerceString(opportunity.field),
  ]);

  const minScore = Number.isFinite(options.minFieldScore)
    ? options.minFieldScore
    : 0.45;

  const candidates = [];

  for (const query of queries) {
    const match = await taxonomyService.findBestField(query, {
      minScore,
    });

    if (match) {
      candidates.push({
        ...match,
        matchedQuery: query,
      });
    }
  }

  return pickBestByMatchScore(candidates);
}

async function resolveSkillMatches(skillNames = [], taxonomyService, options = {}) {
  const minScore = Number.isFinite(options.minSkillScore)
    ? options.minSkillScore
    : 0.52;

  const results = [];

  for (const skillName of uniqueStrings(skillNames)) {
    const match = await taxonomyService.findBestSkill(skillName, {
      minScore,
    });

    if (match) {
      results.push({
        requested: skillName,
        matched: match,
      });
    }
  }

  return results;
}

function buildOskaSuggestedSkills(occupation, skillMatches = []) {
  const matchedSkillLabels = skillMatches
    .map((item) => item?.matched?.label)
    .filter(Boolean);

  const occupationSkillLabels = toSafeArray(occupation?.skillLabels);

  return uniqueStrings([
    ...matchedSkillLabels,
    ...occupationSkillLabels,
  ]);
}

function buildOskaRoleKeywords(opportunity, occupation) {
  return uniqueStrings([
    coerceString(opportunity?.title),
    ...toSafeArray(opportunity?.roleKeywords),
    coerceString(occupation?.label),
    ...toSafeArray(occupation?.aliases),
  ]);
}

function buildPreferredEducationAreas(opportunity, occupation, field) {
  return uniqueStrings([
    ...toSafeArray(opportunity?.preferredEducationAreas),
    ...toSafeArray(occupation?.fieldLabels),
    coerceString(field?.label),
  ]);
}

function buildRequiredEducationLevels(opportunity, occupation) {
  const explicitLevels = uniqueStrings(
    toSafeArray(opportunity?.requiredEducationLevels)
  );

  if (explicitLevels.length > 0) {
    return explicitLevels;
  }

  return uniqueStrings(toSafeArray(occupation?.educationLevels));
}

function buildEnrichedSector(opportunity, occupation, field) {
  return (
    coerceString(opportunity?.sector) ||
    coerceString(opportunity?.field) ||
    coerceString(field?.label) ||
    toSafeArray(occupation?.fieldLabels)[0] ||
    null
  );
}

function buildOskaMeta(occupation, field, skillMatches = []) {
  return {
    occupation: occupation
      ? {
          id: occupation.id || null,
          code: occupation.code || null,
          label: occupation.label || null,
          aliases: toSafeArray(occupation.aliases),
          matchScore: occupation.matchScore || null,
          matchedQuery: occupation.matchedQuery || null,
          parentLabel: occupation.parentLabel || null,
          fieldCodes: toSafeArray(occupation.fieldCodes),
          fieldLabels: toSafeArray(occupation.fieldLabels),
          skillCodes: toSafeArray(occupation.skillCodes),
          skillLabels: toSafeArray(occupation.skillLabels),
          knowledgeAreas: toSafeArray(occupation.knowledgeAreas),
          workConditions: toSafeArray(occupation.workConditions),
          goodToKnow: toSafeArray(occupation.goodToKnow),
          educationLevels: toSafeArray(occupation.educationLevels),
          toolLabels: toSafeArray(occupation.toolLabels),
          akCodes: toSafeArray(occupation.akCodes),
          iscedfCode: occupation.iscedfCode || null,
          emtakCode: occupation.emtakCode || null,
        }
      : null,

    field: field
      ? {
          id: field.id || null,
          code: field.code || null,
          label: field.label || null,
          matchScore: field.matchScore || null,
          matchedQuery: field.matchedQuery || null,
        }
      : null,

    skillMatches: skillMatches.map((item) => ({
      requested: item.requested,
      code: item.matched?.code || null,
      label: item.matched?.label || null,
      matchScore: item.matched?.matchScore || null,
    })),
  };
}

export async function buildOskaOpportunityEnrichment(
  opportunity,
  taxonomyService,
  options = {}
) {
  const service =
    taxonomyService || getSharedCareerTaxonomyService(options.taxonomyConfig);

  await service.ensureReady({
    forceRefresh: options.forceRefresh === true,
    allowStaleOnError: options.allowStaleOnError !== false,
  });

  const occupation = await findBestOccupationForOpportunity(
    opportunity,
    service,
    options
  );

  const field = await findBestFieldForOpportunity(
    {
      ...opportunity,
      sector:
        coerceString(opportunity?.sector) ||
        coerceString(opportunity?.field) ||
        toSafeArray(occupation?.fieldLabels)[0] ||
        null,
    },
    service,
    options
  );

  const explicitSkills = uniqueStrings([
    ...toSafeArray(opportunity?.requiredSkills),
    ...toSafeArray(opportunity?.preferredSkills),
  ]);

  const skillMatches = await resolveSkillMatches(
    explicitSkills,
    service,
    options
  );

  const oskaSuggestedSkills = buildOskaSuggestedSkills(occupation, skillMatches);
  const roleKeywords = buildOskaRoleKeywords(opportunity, occupation);
  const sector = buildEnrichedSector(opportunity, occupation, field);
  const preferredEducationAreas = buildPreferredEducationAreas(
    opportunity,
    occupation,
    field
  );
  const requiredEducationLevels = buildRequiredEducationLevels(
    opportunity,
    occupation
  );

  return {
    roleKeywords,
    sector,
    preferredSkills: uniqueStrings([
      ...toSafeArray(opportunity?.preferredSkills),
      ...oskaSuggestedSkills,
    ]),
    requiredEducationLevels,
    preferredEducationAreas,
    oska: buildOskaMeta(occupation, field, skillMatches),
  };
}

export async function enrichOpportunityWithOska(
  opportunity,
  taxonomyService,
  options = {}
) {
  const enrichment = await buildOskaOpportunityEnrichment(
    opportunity,
    taxonomyService,
    options
  );

  return {
    ...opportunity,
    roleKeywords: enrichment.roleKeywords,
    sector: enrichment.sector,
    preferredSkills: enrichment.preferredSkills,
    requiredEducationLevels: enrichment.requiredEducationLevels,
    preferredEducationAreas: enrichment.preferredEducationAreas,
    oska: enrichment.oska,
  };
}

function buildOskaSupportBullets(enrichedOpportunity, options = {}) {
  const text = getMatchingText(options);
  const bullets = [];

  const occupation = enrichedOpportunity?.oska?.occupation;
  const field = enrichedOpportunity?.oska?.field;
  const skillMatches = toSafeArray(enrichedOpportunity?.oska?.skillMatches);

  if (occupation?.label) {
    bullets.push(`${text.oska.occupationMatch}${occupation.label}`);
  }

  if (field?.label) {
    bullets.push(`${text.oska.fieldMatch}${field.label}`);
  }

  if (skillMatches.length > 0) {
    bullets.push(
      `${text.oska.skillMatches}${skillMatches
        .map((item) => item.label)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ")}`
    );
  }

  if (toSafeArray(occupation?.educationLevels).length > 0) {
    bullets.push(
      `${text.oska.educationSignal}${toSafeArray(occupation?.educationLevels)
        .slice(0, 2)
        .join(", ")}`
    );
  }

  if (toSafeArray(occupation?.workConditions).length > 0) {
    bullets.push(
      `${text.oska.workCondition}${toSafeArray(occupation?.workConditions)[0]}`
    );
  }

  return bullets;
}

export async function computeCareerFitWithOska(
  profile,
  opportunity,
  taxonomyService,
  options = {}
) {
  const enrichedOpportunity = await enrichOpportunityWithOska(
    opportunity,
    taxonomyService,
    options
  );

  const fit = computeCareerFit(profile, enrichedOpportunity, options.matchingOptions);
  const text = getMatchingText(options.matchingOptions || options);
  const oskaBullets = buildOskaSupportBullets(enrichedOpportunity, options);

  return {
    ...fit,
    opportunity: enrichedOpportunity,
    whyItFits: uniqueStrings([
      ...toSafeArray(fit.whyItFits),
      ...oskaBullets,
    ]),
    confidenceNotes: uniqueStrings([
      ...toSafeArray(fit.confidenceNotes),
      enrichedOpportunity?.oska?.occupation?.matchScore
        ? `${text.oska.confidencePrefix}${enrichedOpportunity.oska.occupation.matchScore}`
        : null,
    ]),
  };
}

export async function rankCareerOpportunitiesWithOska(
  profile,
  opportunities = [],
  taxonomyService,
  options = {}
) {
  const enrichedResults = await Promise.all(
    toSafeArray(opportunities).map((opportunity) =>
      computeCareerFitWithOska(profile, opportunity, taxonomyService, options)
    )
  );

  return enrichedResults.sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function enrichDirectionsWithOska(
  directions = [],
  taxonomyService,
  options = {}
) {
  const safeDirections = toSafeArray(directions);

  return Promise.all(
    safeDirections.map(async (direction) => {
      const title = getDirectionTitleValue(direction);

      if (!title) {
        return {
          direction,
          oska: null,
        };
      }

      const enrichment = await buildOskaOpportunityEnrichment(
        { title, roleKeywords: [title] },
        taxonomyService,
        options
      );

      return {
        direction,
        oska: enrichment.oska,
      };
    })
  );
}
