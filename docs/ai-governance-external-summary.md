# SotsiaalAI AI Governance: External Summary

This is a short external-facing summary of how SotsiaalAI approaches AI governance today.

It is intended for partners, stakeholders, and other external readers who need a concise view of platform maturity, control principles, and current direction without internal operational detail.

## 1. Current position

SotsiaalAI is not positioned as an unbounded general AI assistant.

It is being built as a governed domain product for social-sector use, with emphasis on:

- predictable model behavior
- operational controls
- usage observability
- role-sensitive interaction
- safer handling of uncertainty and high-risk situations

## 2. What is already in place

### A. Controlled model usage

SotsiaalAI uses a centralized standard text model path for its main text workflows. This supports consistency, comparability, and more reliable governance.

The platform currently favors a conservative default operating mode designed for:

- clarity
- cost control
- stable product behavior

### B. Technical guardrails

The platform already includes implemented technical controls such as:

- rate limiting
- workload and output caps
- upload and storage limits
- internal budget protections
- attribution and observability for AI activity

These controls help reduce operational risk and make the system easier to manage responsibly.

### C. Observability and accountability

SotsiaalAI records AI usage activity across its main text, retrieval, and audio-related flows.

This supports:

- monitoring
- operational review
- cost interpretation
- investigation of feature-level usage patterns

The platform also maintains attribution quality controls so that user-facing AI activity can be understood more consistently across flows.

### D. Domain-sensitive safety behavior

SotsiaalAI already contains domain-sensitive AI behavior, especially in its main conversational workflows.

This includes principles such as:

- grounding factual claims in available verified context
- avoiding unsupported certainty
- minimizing unnecessary repetition of sensitive personal data
- adapting communication to client and specialist roles
- moving toward escalation in crisis-like situations

## 3. Governance direction

The current direction is to formalize AI governance across three layers:

1. internal technical controls
2. customer-facing product and package policy
3. social-domain safety standards

This matters because technical controls alone are not enough in a social-sector setting. Governance also needs clear rules for trust, safety, role boundaries, and responsible use.

## 4. Current maturity view

The strongest current capabilities are:

- operational control
- cost and usage visibility
- consistency of core model behavior
- early domain-specific safety behavior

The main next maturity step is:

to turn these existing controls and behaviors into a more explicit, platform-wide governance standard.

## 5. What comes next

The most important next steps are now:

- confirming which enforced limits are internal controls and which are customer-facing policy
- operationalizing the platform-wide social-domain safety standard that has now been documented
- maintaining attribution quality across user-facing AI flows as the product evolves
- using both normalized usage metrics and approximate cost views under a clearer management rule

## 6. Bottom line

SotsiaalAI is being developed as a controlled and governable AI platform rather than as a loosely managed AI feature layer.

Its next phase is not about removing controls. It is about making those controls, safety rules, and policy boundaries more explicit, consistent, and auditable.
