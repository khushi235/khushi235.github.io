---
title: Marketplace Customer Analytics
tagline: Customer Intelligence on 100K+ Transactions
description: >-
  An end-to-end customer analytics system that answers the three questions a
  marketplace asks every month: where revenue actually comes from, which
  customers are worth keeping, and who is about to leave.
featured: true
order: 1
year: 2026
status: shipped
theme: meadow
technologies:
  - SQL
  - Python
  - Pandas
  - Power BI
  - Excel
  - RFM Segmentation
  - Cohort Analysis
problem: >-
  The business had plenty of data and almost no answers. Revenue reporting was a
  monthly Excel file rebuilt by hand, "top customers" meant whoever spent the most
  last month, and nobody could say whether a customer who bought in January was
  still around in June. Marketing, finance and ops each had their own number for
  the same KPI.
approach: >-
  Clean and deduplicate in SQL where the data lives, then use Python for the logic
  SQL is clumsy at — quantile RFM scoring, cohort pivots and charting. One agreed
  definition per metric lives in a single file that both the SQL model and the
  Python layer read, and the curated tables feed a Power BI report the commercial
  team opens themselves.
architecture:
  - SQL staging models that clean and deduplicate raw orders into one row per customer.
  - RFM scoring on quintiles rather than fixed thresholds, so segments stay stable as the business grows.
  - Monthly signup cohorts tracked for retention and revenue over a twelve-month window.
  - A single KPI layer — revenue, AOV, conversion, repeat rate and margin — shared by SQL and Python.
  - Curated output tables consumed by a four-page Power BI dashboard and an Excel export for finance.
decisions:
  - title: RFM instead of clustering
    detail: >-
      K-means gives segments nobody can name. RFM gives eight segments a marketing
      manager understands on day one, and it reproduces month over month. K-means
      was run as a sanity check and broadly agreed — but RFM is what shipped,
      because it gets used.
  - title: Quintile scoring, not fixed thresholds
    detail: >-
      Hard-coded cut-offs break the moment the business grows. Ranking customers
      into quintiles keeps the segments comparable across time.
  - title: Heavy lifting in SQL, analysis in Python
    detail: >-
      Joins, dedupe and aggregation run where the data lives, which keeps the
      Python step small and fast enough to iterate on.
  - title: One KPI definition, in one file
    detail: >-
      The KPI module and the SQL model share the same logic, which is what ended
      the argument about whose revenue number was right.
outcomes:
  - value: 100K+
    label: Transactions analysed
  - value: 60%
    label: Of revenue traced to 18% of customers
  - value: 3×
    label: Better month-6 retention for fast second orders
  - value: 40%
    label: Less recurring reporting effort
links:
  github: https://github.com/khushi235/marketplace-customer-analytics
---

The interesting finding was not the long tail — every marketplace has one. It was that
the **At Risk** segment held roughly $180K of historical spend and was receiving exactly
the same email as everyone else. Naming that group was worth more than any model in the
repository.

The second finding was about timing. Cohorts that reached a second order inside 45 days
retained about three times better at month six. That turns a vague "improve retention"
goal into a specific, testable one: *get the second order inside six weeks*.

What I would add next is product affinity — the segmentation is behavioural only, and a
product-first cohort view would probably explain more of the variance than another
scoring tweak.
