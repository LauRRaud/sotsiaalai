# Career Agent faililoend

See on failide nimekiri, mida kasutasime uue `career-agent` mooduli ülesehitamiseks kaustas `/lib/career-agent`, koos API route'idega, mis selle mooduli käivitavad.

## Profiil

- `/lib/career-agent/profile/careerProfile.schema.js`
- `/lib/career-agent/profile/careerProfile.helpers.js`

## Adapterid

- `/lib/career-agent/adapters/careerCvParserAdapter.js`
- `/lib/career-agent/adapters/careerTurnInputAdapter.js`

## Core

- `/lib/career-agent/core/careerStateMachine.js`
- `/lib/career-agent/core/careerQuestionBank.js`
- `/lib/career-agent/core/careerMatchingEngine.js`
- `/lib/career-agent/core/careerActionPlan.js`
- `/lib/career-agent/core/careerResponseTemplates.js`
- `/lib/career-agent/core/careerOrchestrator.js`

## Dokumendid

- `/lib/career-agent/documents/careerDocumentFlows.js`
- `/lib/career-agent/documents/careerDocumentTemplates.js`
- `/lib/career-agent/documents/careerDocumentGenerator.js`
- `/lib/career-agent/documents/careerDocumentIntegration.js`

## Taxonomy / OSKA

- `/lib/career-agent/taxonomy/oskaApiClient.js`
- `/lib/career-agent/taxonomy/oskaNormalizer.js`
- `/lib/career-agent/taxonomy/careerTaxonomyService.js`
- `/lib/career-agent/taxonomy/careerOskaMatchingBridge.js`

## Ethics / Privacy / Handoff

- `/lib/career-agent/ethics/careerSystemPromptEthics.js`
- `/lib/career-agent/ethics/careerPrivacyRules.js`
- `/lib/career-agent/ethics/careerHandoffRules.js`
- `/lib/career-agent/ethics/careerHandoffRulesEthical.js`
- `/lib/career-agent/ethics/careerECounsellingMode.js`

## API ja run layer

- `/lib/career-agent/api/runCareerAgent.js`
- `/lib/career-agent/run.js`

## Route'id

- `/app/api/career-agent/run/route.js`
- `/pages/api/career-agent/run.js`

## Märkus eemaldatud failist

Arenduse käigus kasutasime lühidalt ka faili:

- `/lib/career-agent/ethics/careerSystemRules.js`

See fail eemaldati hiljem, sest ta dubleeris `careerSystemPromptEthics.js` ja enforcement-reegleid ning tekitas liigse policy killustumise riski.
