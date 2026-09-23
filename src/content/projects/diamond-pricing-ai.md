---
title: Diamond Pricing AI
tagline: Defensible Prices and Real Comparables
description: >-
  A pricing and recommendation engine that reads grading-lab certificates, joins
  them to live inventory and historical sales, and returns a defensible price
  range plus the alternatives a customer is likely to accept.
featured: false
order: 3
year: 2026
status: shipped
theme: slate
technologies:
  - Python
  - SQL
  - scikit-learn
  - NLP
  - FastAPI
  - Quantile Regression
problem: >-
  Diamond pricing was done by hand — read the certificate, check a price list,
  compare a few stones from memory, quote a number. Every salesperson quoted
  differently, so margin leaked on some stones and deals were lost on others;
  certificates arrived as PDFs and free text, costing hours of data entry; and
  "show me something similar" was a manual search slow enough that customers left.
approach: >-
  Parse the certificate with rule-based NLP, build one clean record per stone in
  SQL by joining certificate data to inventory and sold prices, then predict price
  per carat with gradient boosting and a quantile model that returns a low/high
  band rather than a single number. A similarity recommender surfaces the closest
  available alternatives, and both are exposed over a FastAPI service the CRM
  calls directly.
architecture:
  - A lightweight NLP parser for carat, colour, clarity, cut, fluorescence, measurements and report number.
  - A versioned SQL feature view joining certificates, inventory and historical sales.
  - Gradient boosting for price per carat, with a quantile model producing the 10th and 90th percentile.
  - A similarity recommender across the 4Cs, weighted by what actually drives price.
  - FastAPI endpoints for /price and /recommend, consumed by the CRM and the internal sales tool.
  - A low-confidence flag that routes rare fancy shapes to a human instead of guessing.
decisions:
  - title: A range, not a point estimate
    detail: >-
      Quantile regression gives a band. Sales teams negotiate with a band; they do
      not trust a single decimal number they cannot interrogate.
  - title: Gradient boosting over deep learning
    detail: >-
      The data is tabular and tens of thousands of rows. Boosted trees win on this
      shape of data, train in seconds, and give feature importances a sales
      director can read.
  - title: Rule-based NLP before an LLM
    detail: >-
      Certificates are semi-structured, so regex plus a vocabulary of grading terms
      is faster, free and auditable. An LLM fallback only runs on the certificates
      the parser cannot handle.
  - title: SQL as the single source of truth
    detail: >-
      Feature logic lives in a versioned SQL view, so training and serving use
      exactly the same definitions. No training/serving skew.
outcomes:
  - value: ~8%
    label: Mean absolute percentage error (R² 0.93)
  - value: 94%
    label: Certificate fields captured automatically
  - value: < 1s
    label: Time to quote a stone, down from minutes
  - value: Full
    label: Inventory coverage, not just popular shapes
links:
  github: https://github.com/khushi235/diamond-pricing-ai
---

The model is strong on round and princess cuts where there is volume, and weaker on rare
fancy shapes. Rather than hide that, the API returns a low-confidence flag and the stone
is routed to a human. A pricing system that is confidently wrong on the expensive tail is
worse than no pricing system at all.

The part I would defend hardest is the price *range*. A point estimate looks more
impressive in a demo and is almost useless in a negotiation — the band is what made the
sales team adopt it.
