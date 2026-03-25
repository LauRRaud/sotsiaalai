# AI Governance: Final Decisions Needed

This is a short decision memo for leadership. It does not restate the full implemented state. It focuses only on the decisions that now matter most.

Related documents:

- [AI Cost And Guardrails Status](./ai-cost-and-guardrails-status.md)
- [SotsiaalAI AI Governance: Current State, Gaps, Next Decisions](./sotsiaalai-ai-governance-current-state-gaps-next-decisions.md)
- [AI Governance Controls Policy Map](./ai-governance-controls-policy-map.md)
- [AI Social-Domain Safety Standard](./ai-social-domain-safety-standard.md)

## 1. What is already decided in practice

These points are already true in the current product and codebase:

- standard text flows use one shared model path
- standard text flows default to `low` reasoning and `low` verbosity
- AI cost/activity observability exists across text, RAG, TTS, and STT
- standard text attribution is now much more symmetric across chat, documents, and research
- admin analytics now shows both normalized usage units and an approximate-EUR view

The next step is not infrastructure discovery. The next step is policy clarity.

## 2. Decisions leadership should make next

### Decision 1. Which enforced limits are customer-facing package rules?

This is the highest-priority product-policy decision.

Examples needing explicit classification:

- daily research quota
- storage quota
- daily upload quota
- artifact refinement cap

Decision needed:

- customer-visible package entitlement
- or internal protection only

Why it matters:

- pricing clarity
- support consistency
- user trust
- fair package communication

### Decision 2. Which enforced limits remain internal operational controls?

Some controls should stay internal even if users indirectly feel them.

Examples:

- monthly AI budget checks
- some rate limits
- some runtime caps
- some abuse-prevention controls

Decision needed:

- keep internal and do not market as package promises
- or convert into explicit product rules

Why it matters:

Mixing internal controls and customer promises creates policy confusion later.

### Decision 3. What is the first formal social-domain safety standard?

The product already contains early safety behavior, especially in chat.

Now leadership should decide what becomes the first explicit platform-wide standard.

Minimum standard should cover:

- uncertainty language
- non-guessing for rights/benefits/deadlines/official requirements
- privacy minimization
- human-review positioning for generated content
- crisis and escalation boundaries

Why it matters:

This is where SotsiaalAI becomes more than an AI tool with guardrails. It becomes a governed domain product.

### Decision 4. How should `internal_usage_units` and approximate EUR be used together?

The admin view now shows both.

Decision needed:

- what metric is primary for operational monitoring
- what metric is primary for pricing review
- what metric is primary for package-margin review

Recommended direction:

- use `internal_usage_units` for normalized operational control
- use approximate EUR for management interpretation and pricing review

Why it matters:

Without this rule, teams may use the two views inconsistently.

### Decision 5. Where is targeted quality escalation worth extra cost?

The current default policy is still the right default:

- one standard text model path
- `low` reasoning
- `low` verbosity

The remaining decision is whether to selectively spend more only in high-value specialist workflows.

Candidate areas:

- deep research synthesis
- conflicting-source synthesis
- heavier professional document refinement

Why it matters:

This is a quality-vs-cost decision, not a platform-wide model-policy rewrite.

## 3. Recommended decision order

1. Confirm which limits are customer-facing package rules.
2. Confirm which limits remain internal controls.
3. Approve the first platform-wide social-domain safety standard.
4. Approve how units and approximate EUR should be used in management reviews.
5. Decide whether targeted escalation is justified for specialist-heavy workflows.

## 4. Bottom line

SotsiaalAI already has the technical base.

The decisions now required are governance and product decisions:

- what to promise
- what to keep internal
- what safety standard to formalize
- how to interpret AI cost properly

That is the current bottleneck, not missing instrumentation.
