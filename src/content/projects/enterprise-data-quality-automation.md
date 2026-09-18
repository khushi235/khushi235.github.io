---
title: Enterprise Data Quality Automation
tagline: Config-Driven Data Quality Framework
description: >-
  A reusable framework that profiles a dataset, applies business rules, flags
  anomalies, deduplicates and standardises records, publishes a quality
  scorecard — and blocks the pipeline when something is badly wrong.
featured: true
order: 2
year: 2026
status: active
theme: golden
technologies:
  - Python
  - SQL
  - YAML
  - REST APIs
  - Generative AI
  - GitHub Actions
  - Fuzzy Matching
problem: >-
  Every client environment told the same story: millions of records, dozens of
  sources, and nobody able to say whether the data was fit to use. The same
  customer existed four times with different spellings, one country column held
  four spellings of "United States", and every new engagement began by writing the
  same cleaning script from scratch.
approach: >-
  Move the rules out of the code and into YAML, so onboarding a client means
  writing a config file rather than a codebase. Seven stages run in order —
  profile, validate, standardise, deduplicate, detect anomalies, score, act — and
  the run is gated: clean data is published, rejects are quarantined with the rule
  that rejected them, and a critical failure stops the pipeline instead of
  poisoning the warehouse.
architecture:
  - Connectors for SQL sources, REST APIs and file exports behind one interface.
  - Automated profiling — row counts, null rates, cardinality, type inference, pattern detection and outliers.
  - A YAML rules engine covering required, unique, regex, range, allowed-value and cross-field checks.
  - Standardisation of names, addresses, phones, emails, countries and dates into one canonical form.
  - Blocking plus fuzzy matching to resolve the same entity written five different ways.
  - Anomaly detection on statistical outliers and distribution drift against the previous load.
  - A 0–100 score per quality dimension, persisted to SQL so the trend is visible over time.
decisions:
  - title: Configuration over code
    detail: >-
      The rules engine reads YAML. A new client is a config file, not a new
      codebase — that is the single thing that made this reusable instead of
      another one-off script.
  - title: Quarantine, never delete
    detail: >-
      Failed rows go to a quarantine table alongside the rule that rejected them.
      Silently dropping records is how you lose a client's revenue data.
  - title: AI only where rules genuinely fall short
    detail: >-
      An LLM proposes column mappings for new client files and extracts from free
      text that regex cannot handle reliably, with a strict JSON schema and a human
      approval on the mapping. Everything else stays deterministic, because rules
      are faster, cheaper, testable and auditable.
  - title: The quality gate is a gate
    detail: >-
      Below the configured threshold the run fails and alerts rather than
      publishing. A scorecard nobody acts on is just a nicer-looking problem.
outcomes:
  - value: 40%
    label: Reduction in analytical errors
  - value: 3×
    label: Faster decision-making
  - value: 99%
    label: Email deliverability after validation
  - value: Days → YAML
    label: New client onboarding
links:
  github: https://github.com/khushi235/enterprise-data-quality-automation
---

This is the project I would point at first, because it is the one that changed how the
work is done rather than answering a single question. Before it, data quality was an
opinion held separately by every analyst on every engagement. After it, it is a number
with a history, and a run either passes or it does not.

The part that took longest was not the matching or the anomaly detection — it was
deciding what the framework should *refuse* to do. Auto-correcting a value is tempting
and almost always wrong; a quarantine table with a reason attached is slower to read and
far easier to defend.
