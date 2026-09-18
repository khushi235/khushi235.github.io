---
title: Forecasting & Experimentation
tagline: Demand Forecasts and Honest A/B Readouts
description: >-
  Two systems answering the two questions planning teams ask constantly — what
  will next week look like, and did the change we shipped actually work?
featured: false
order: 3
year: 2026
status: shipped
theme: sand
technologies:
  - Python
  - SQL
  - Gradient Boosting
  - Statistics
  - Power BI
  - Excel
problem: >-
  Inventory planning ran on a spreadsheet that took last week's sales and added a
  percentage, so the business swung between stockouts and dead stock. Meanwhile
  product and marketing were declaring changes successful on the first few days of
  data — exactly when a test looks best and means least.
approach: >-
  For forecasting, a feature-based gradient boosting model over calendar effects,
  lagged demand, rolling averages and promotion flags, validated with
  rolling-origin backtesting against a seasonal naive baseline that is always run
  alongside it. For experimentation, one reusable readout: sample size agreed
  before launch, exposure defined once in SQL, significance with confidence
  intervals, and guardrail metrics checked every time.
architecture:
  - SQL weekly aggregates at the modelling grain of product family × week.
  - Feature engineering for lags, rolling statistics, calendar effects and promotions.
  - A seasonal naive baseline run on every fold, so "is the model good?" has an honest answer.
  - Rolling-origin backtesting — train on the past, predict eight weeks, roll forward, repeat.
  - Power analysis that fixes sample size and minimum detectable effect before an experiment launches.
  - Two-proportion z-test for conversion and Welch's t-test for revenue per user, both with intervals.
  - Sample ratio mismatch and guardrail checks that catch broken randomisation before anyone reads the result.
decisions:
  - title: Gradient boosting, not ARIMA or Prophet
    detail: >-
      Demand here is driven by promotions and calendar effects more than by pure
      autocorrelation, and a feature-based model lets those go in directly. It also
      makes it possible to explain *why* a forecast moved.
  - title: Rolling-origin backtesting
    detail: >-
      Time series must be evaluated in time order. A shuffled split lets the model
      see future weeks, which produces a great score and a useless forecast.
  - title: Intervals, not point forecasts
    detail: >-
      Planners get a range so they can choose a service level, rather than trusting
      a single number they had no part in producing.
  - title: Fixed horizon, no peeking
    detail: >-
      Stopping a test the moment it looks significant inflates false positives
      badly. The sample size is agreed up front and the readout runs at the end.
outcomes:
  - value: 20%
    label: Relative improvement in forecast error
  - value: Every
    label: Product family beat the naive baseline
  - value: Same day
    label: Experiment readouts, down from 2–3 days
  - value: 40%
    label: Fewer reporting inconsistencies
links:
  github: https://github.com/khushi235/forecasting-experimentation-analytics
---

The accuracy number mattered because it fed straight into safety stock: a tighter
forecast means less capital tied up in inventory without increasing stockouts. A model
that is 20% better and never reaches a planning decision is worth nothing.

One honest caveat, which is also in the repository: on the committed sample dataset the
backtest prints a much flatter 11.9% MAPE against 19.9% for seasonal naive. Sample data
is cleaner than production data. The production figures are the ones to judge it on.
