# AI Governance Controls Policy Map

This document classifies the current implemented AI controls in SotsiaalAI into three governance layers:

- internal technical controls
- customer-facing product and package policy
- social-domain safety standard

The point of this document is not to restate every implementation detail. The point is to show which controls belong to which policy layer, where the current repo is already clear, and where a product decision is still needed.

## 1. How to read this map

Use these meanings consistently:

- `internal technical control`: protects system stability, abuse resistance, or operational cost; not automatically a customer promise
- `customer-facing policy`: something the product may present or enforce as part of a package or entitlement
- `social-domain safety standard`: a trust, risk, or responsibility rule for how AI behaves in a social-sector context

Status meanings:

- `implemented`: already present in the current codebase
- `implemented, policy not finalized`: technically present, but should not yet be treated as final product policy
- `partially implemented`: some parts exist, but not yet as a platform-wide standard

## 2. Internal technical controls

These are primarily there to protect operations, stability, and cost.

| Control | Current status | Notes |
|---|---|---|
| Chat API POST rate limit | implemented | Internal system protection first |
| Chat API GET rate limit | implemented | Internal system protection first |
| Room message POST rate limit | implemented | Internal anti-spam / throughput protection |
| Conversation ID validation | implemented | Integrity and persistence protection |
| Research POST rate limit | implemented | Internal throughput and cost protection |
| One active research job per user | implemented | Operational concurrency guard |
| Research query length cap | implemented | Prompt/control-surface guard |
| Research profile caps: time budget, snippets, concurrency, output tokens | implemented | Internal runtime budget control |
| Document route rate limits | implemented | Throughput protection |
| Artifact refinement cap | implemented, policy not finalized | Internal protection now; may later become package policy |
| Max source documents per artifact | implemented | Internal quality and runtime bound |
| Max artifact content length | implemented | Internal runtime and storage bound |
| Upload file size caps | implemented | Internal safety and resource control |
| RAG ingest/upload max bytes | implemented | Internal runtime and cost control |
| Materials upload request file-count cap | implemented | Internal abuse and resource control |
| Monthly budget checks for chat/STT/TTS | implemented | Operational budget guard, not final pricing policy |
| AI analytics thresholds | implemented | Monitoring control, not final business policy |
| Attribution completeness monitoring | implemented | Internal observability quality control |
| Internal selftest excluded from user-facing completeness | implemented | Keeps operational diagnostics from polluting product metrics |

## 3. Customer-facing product and package policy

These are the controls that may affect what users can do, what packages include, or how usage should be communicated externally.

| Control | Current status | Notes |
|---|---|---|
| Subscription gating for user-facing chat and research | implemented | Already behaves like customer entitlement logic |
| Daily research quota by role | implemented, policy not finalized | Technically enforced, but still also a product decision |
| Storage quota by role | implemented, policy not finalized | Strong candidate for package definition |
| Daily upload quota | implemented, policy not finalized | Could be customer-visible or purely operational |
| Artifact refinement cap | implemented, policy not finalized | Could remain internal or become visible package behavior |
| Package-based usage interpretation in admin analytics | implemented | Current package view is analytics-side, not yet a full public policy model |
| Approximate-EUR admin view | implemented | Internal management aid, not customer billing |
| `internal_usage_units` | implemented | Internal management metric only, not customer billing |

### Product-policy decisions still needed

These are the biggest unresolved customer-policy questions:

- which limits should be explicitly visible in package pages
- which limits should remain quiet internal protections
- which temporary launch limits should be revised before scale
- how approximate EUR should influence pricing and packaging decisions

## 4. Social-domain safety standard

These controls define how SotsiaalAI should behave responsibly in a social-sector context.

| Rule area | Current status | Notes |
|---|---|---|
| Ground factual claims in RAG-backed context | partially implemented | Strongest in chat prompt behavior |
| Do not guess eligibility, legal outcomes, deadlines, or official requirements | partially implemented | Present in chat prompt rules |
| Mark uncertainty when source support is missing | partially implemented | Present in chat prompt rules |
| Minimize repeated sensitive personal data | partially implemented | Present in chat prompt rules |
| Role-sensitive response style for client vs social worker | partially implemented | Present in chat prompt and some orchestration |
| Crisis-direction behavior | partially implemented | Present in chat safety behavior |
| Clear distinction between AI help and human decision responsibility | partially implemented | Present in some domain/system prompts, not yet platform-wide |
| Human-review positioning for generated outputs | partially implemented | Present in document-generation behavior, not yet a unified standard |

### What is missing here

The main gap is not principle discovery. The main gap is platform-level formalization.

What still needs to happen:

- define the rules once as a standard, not only as prompt text
- apply them consistently across chat, documents, and research
- make them auditable in admin/review language
- add QA or compliance checks where reasonable

## 5. Classification guidance for ambiguous controls

Some controls naturally sit across more than one layer. When that happens, use this rule:

- classify by primary purpose first
- then note the secondary policy effect

Examples:

- daily research quota  
  Primary: customer-facing package policy  
  Secondary: internal cost control

- storage quota  
  Primary: customer-facing package policy  
  Secondary: internal storage protection

- monthly budget checks  
  Primary: internal technical control  
  Secondary: input to pricing and product decisions

- crisis escalation behavior  
  Primary: social-domain safety standard  
  Secondary: operational risk reduction

## 6. Recommended immediate governance decisions

1. Confirm which current enforced limits are officially customer-facing package rules.
2. Confirm which limits remain internal controls only.
3. Define the first platform-wide social-domain safety standard from the chat prompt rules already in production.
4. Decide how approximate EUR and `internal_usage_units` should be used together in management reviews.

## 7. Bottom line

SotsiaalAI already has most of the machinery it needs.

The missing step is governance clarity:

- what is internal protection
- what is product entitlement
- what is domain safety

Once those categories are made explicit, the platform becomes easier to operate, explain, price, and audit.
