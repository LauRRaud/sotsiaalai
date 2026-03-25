# AI Analytics Admin Guide

This is a short internal guide for reading the current AI Cost Activity section in the admin analytics view.

## 1. What the AI Cost Activity section currently includes

The current view is built from these observability events:

- `openai_usage`
- `rag_cost_usage`
- `tts_cost_usage`
- `stt_cost_usage`

This means the section covers standard text Responses usage, mirrored RAG/embedding usage, OpenAI TTS usage, and OpenAI STT usage as currently logged in the app.

## 2. What `internal_usage_units` mean

- `internal_usage_units` are normalized internal usage units.
- They are used to compare usage across text, RAG, TTS, and STT in one dashboard.
- They are not exact provider billing.
- They are still useful because they show relative load, concentration, and threshold pressure across users, packages, routes, stages, and models.

Use them as an operational comparison metric, not as a finance-grade invoice number.

The current admin view also shows an approximate-EUR view alongside units.

- Use `internal_usage_units` for normalized comparison and thresholding.
- Use approximate EUR for management interpretation of likely provider-cost pressure.
- Do not treat the approximate EUR view as exact billing either.

## 3. How to read thresholds

The current threshold states are:

- `normal`: below `70%`
- `warning`: `70%` to below `85%`
- `high`: `85%` to below `100%`
- `exceeded`: `100%` or above

These thresholds are applied to internal usage utilization, not exact provider spend.

## 4. How to interpret route/stage, role, package, and model breakdowns

- `route` and `stage` show where usage is happening in the product.
- `role` shows whether usage is mainly driven by clients, social workers, or admins.
- `package` shows how usage concentrates by subscription/package grouping.
- `model` shows which model family is driving the usage that is currently logged.

Use route/stage first to locate the feature, then role/package to see who is driving it.

## 5. How to read top users and top features

Top users:
- Look for users approaching or exceeding thresholds.
- Check whether the usage pattern is expected for their role and package.
- Check whether the mix is mostly direct text/RAG usage or mostly estimated audio usage.

Top features:
- Look for routes/stages that dominate total units.
- Repeated heavy usage in one stage can indicate a costly workflow, missing guardrail, or a product flow that needs tuning.
- A sudden spike in one route/stage is usually more actionable than a broad platform-wide increase.

## 6. Coverage and limitations

Direct vs estimated:
- Standard text usage is direct from provider usage fields.
- RAG/embedding usage is direct from embedding usage fields when mirrored events are present.
- TTS is currently estimated from text length.
- STT is direct when usage is returned, otherwise estimated from file size.

Caveats:
- `internal_usage_units` are not exact billing.
- Estimated events should not be read too precisely.
- Thresholds are operational signals, not final pricing policy.
- Do not conclude too quickly that a user or package is "unprofitable" from this view alone.

Attribution completeness:
- The AI Cost Activity section also includes an attribution completeness view for user-facing standard text `openai_usage`.
- It shows whether `userId` and `role` coverage remain complete enough for reliable role/package analysis.
- Internal selftest routes are excluded from that completeness check on purpose.

## 7. Operational guidance

When a user or package approaches thresholds:

- First check which route/stage is driving the increase.
- Check whether the usage is expected for that role and package.
- Check whether the spike is direct usage or mostly estimated audio usage.
- Check whether the pattern is sustained or only temporary.

Before changing pricing, limits, or policy:

- review top routes/stages
- review top users/packages
- review coverage notes
- confirm whether the heaviest usage is product-intended
- separate technical guardrail decisions from business/pricing decisions

Treat this dashboard as an internal decision-support tool, not as a standalone billing source.
