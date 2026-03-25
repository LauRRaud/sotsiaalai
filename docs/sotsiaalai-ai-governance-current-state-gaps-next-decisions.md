# SotsiaalAI AI Governance: Current State, Gaps, Next Decisions

This is a short internal management document. It summarizes the current AI governance state in SotsiaalAI, the main gaps, and the next decisions that matter most.

It is based on the current codebase and on the repository documents about AI cost, guardrails, analytics, and model policy.

For a more explicit three-layer control classification, see [AI Governance Controls Policy Map](./ai-governance-controls-policy-map.md).

## 1. Executive summary

SotsiaalAI is no longer an experimental AI feature set. It already has a strong operational base:

- one standard text model path
- explicit low-cost default model behavior
- implemented technical guardrails
- route/stage/user/package observability
- admin analytics for AI cost activity

The next maturity step is not primarily "more logging" or "a new model."

The next maturity step is to turn the current operational controls and prompt-level trust rules into a more complete AI governance layer that is:

- symmetric across flows
- clearly separated by policy type
- platform-wide instead of mainly chat-local
- easier to audit and explain

## 2. What is already strong

### A. Operational AI control is already solid

The platform already has implemented controls for:

- rate limits
- quotas
- output/token caps
- file and storage caps
- monthly internal budget checks
- route/stage-level observability

This means SotsiaalAI already has a real AI operations layer, not just model calls.

### B. Model policy is intentionally simple

The current standard text policy is deliberately centralized:

- shared `OPENAI_MODEL` path with fallback `gpt-5.4-mini`
- `reasoning.effort: "low"`
- `text.verbosity: "low"`

This is a good launch-stage policy because it improves:

- predictability
- cost control
- comparability across flows
- analytics clarity

### C. Social-domain safety exists, but mainly at chat prompt level

The platform already contains meaningful trust and safety behavior, especially in chat:

- grounding to RAG-backed factual context
- explicit non-guessing rules
- privacy minimization instructions
- role-sensitive response behavior
- crisis-direction behavior

This matters because the right conclusion is not "social safety is missing."

The more accurate conclusion is:

social-domain safety exists, but it is still more prompt-centered than platform-governed.

## 3. Main gaps

### A. Policy layers are not yet clearly separated

Today the repository contains a mix of:

- internal technical controls
- customer-visible usage rules
- social-domain trust/safety behavior

These do not yet form one clearly separated governance map.

That creates future risk when SotsiaalAI needs to explain:

- what is an internal safety control
- what is a customer-facing package entitlement
- what is a domain-level AI safety rule

### B. Social safety is not yet platform-wide and auditable

The current safety logic is strongest in chat behavior and prompts.

The next gap is not inventing new principles from zero. The gap is that the existing principles are not yet fully expressed as:

- cross-flow rules
- implementation standards
- admin/audit expectations
- QA or compliance checks

### C. Approximate EUR now exists, but management usage still needs a rule

`internal_usage_units` are useful and should remain, and the admin view now also shows approximate EUR.

The remaining question is not whether to show approximate EUR anymore. The remaining question is how to use the two views together in management and pricing decisions:

- normalized operational units
- approximate provider-cost pressure
- package sustainability interpretation

The right model is still “alongside”, not “instead of”.

## 4. Governance framing SotsiaalAI should adopt

The cleanest way to structure AI governance in SotsiaalAI is to separate three layers.

### A. Internal technical controls

Examples:

- rate limits
- storage caps
- one active research job
- refinement limits
- monthly internal budget enforcement

Purpose:

- protect system stability
- control abuse and runaway cost
- protect operations

### B. Customer-facing product and package policy

Examples:

- what the package includes
- what limits are visible to the customer
- when usage is blocked
- when the product recommends upgrade or support contact

Purpose:

- fairness
- pricing clarity
- understandable customer expectations

### C. Social-domain safety standard

Examples:

- when uncertainty must be stated explicitly
- when the system must not present weakly grounded claims as facts
- when a response should stay at "human review draft" level
- when the user should be routed toward a human or institution
- how sensitive personal data should be minimized

Purpose:

- trustworthiness
- domain safety
- responsible AI use in social-sector contexts

## 5. How the social-domain safety standard should be structured

Not all safety rules are the same. For SotsiaalAI, the standard should be split into three groups.

### A. Response-content rules

Examples:

- do not claim certainty without source support
- distinguish fact, guidance, and inference
- mark uncertainty clearly
- do not guess legal outcomes, eligibility, deadlines, or official requirements

### B. Workflow rules

Examples:

- when output must remain a draft for human review
- when a generated document should not be treated as final
- when more user clarification is required
- when wording must stay neutral because source support is incomplete

### C. Escalation rules

Examples:

- crisis or immediate danger
- high-risk ambiguity
- high-sensitivity personal data situations
- situations where human assessment or institutional contact is the safer next step

## 6. Priority decisions

### 1. Publish a three-layer governance map

Decision:

For every limit, quota, or guardrail, classify it explicitly as:

- internal technical control
- customer-facing policy
- social-domain safety rule

Why first:

This removes ambiguity before scaling packages, governance, and external communication.

### 2. Show units and approximate EUR together in admin analytics

Decision:

Keep `internal_usage_units` as the operational comparison metric, and keep approximate EUR beside it.

Why:

- units help operational control
- EUR helps pricing, margin, and business decisions

### 3. Lift chat safety into a platform-wide standard

Decision:

Turn the already existing chat safety principles into a cross-flow standard covering:

- chat
- document generation/refinement
- research synthesis
- audit/admin interpretation
- QA scenarios

Why:

Good prompts are not yet the same thing as platform governance.

### 4. Consider targeted escalation for heavy specialist workflows

Decision:

Keep the current low/low default, but leave room for selective escalation in high-value specialist tasks.

Examples:

- deep research synthesis
- conflicting-source synthesis
- heavier professional document refinement

Why:

This preserves simplicity while allowing better quality where it produces real product value.

## 7. Recommended immediate sequence

1. Write the three-layer governance classification.
2. Define the platform-wide social-domain safety standard.
3. Decide how approximate EUR and units should be used together in management reviews.
4. Evaluate targeted escalation only for high-value specialist workflows.

## 8. Bottom line

SotsiaalAI already has a strong AI operations and cost-governance base, and it already has an early social-domain safety layer.

The main next step is to make that base:

- more symmetric
- more explicit
- more auditable
- more platform-wide

The right governance conclusion is:

SotsiaalAI does not need a reset. It needs formalization, consistency, and platform-level standardization.
