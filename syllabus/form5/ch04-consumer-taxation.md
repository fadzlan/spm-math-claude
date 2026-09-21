# Form 5, Chapter 4: Consumer Mathematics: Taxation

## Overview
Taxation: purpose and types (direct/indirect); computations of road tax (engine-capacity schedules), property assessment tax (cukai pintu: annual value × rate), quit rent (cukai tanah: area × rate), sales and service tax (SST), and personal income tax. For income tax, keep the stages distinct: determine chargeable income after permitted exemptions and reliefs, calculate gross tax from progressive bands, subtract applicable rebates, then compare tax payable with PCB/monthly deductions. The chapter also considers tax evasion from legal, financial, moral and ethical perspectives. Every rate, bracket, cap, rebate rule, SST scope and road-tax schedule used in an item must be supplied and dated or explicitly treated as a hypothetical given schedule.

## Prerequisites
Percentages; Form 4 Ch10 financial management; table reading.

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 4.1 | Taxation | Purpose of taxes; direct vs indirect classification; road tax via a supplied engine-capacity schedule; property assessment tax (cukai pintu); quit rent (cukai tanah); sales and service tax using the supplied scope and rates; income tax from gross income through exemptions, reliefs, chargeable income, progressive bands, rebates and PCB settlement; separate and joint assessment recognition; consequences of tax evasion. | Progressive-band computation; assessment tax = annual value × supplied rate; annual value may be estimated monthly rent × 12 when stated; quit rent = land area × supplied rate per unit area; chargeable income = taxable income − permitted exemptions/reliefs; tax payable = gross tax from bands − permitted rebates, subject to the stated rules. | Compute a tax from a supplied schedule; distinguish relief, rebate and PCB; calculate refund/shortfall; compare separate and joint assessment under given rules; explain legal/financial and moral/ethical consequences of evasion; solve multi-tax scenarios. |

### Tax distinctions and scope

- **Relief or exemption** reduces the income used to determine chargeable income, subject to the supplied eligibility rule and cap.
- **Rebate** reduces tax after the progressive-band calculation, subject to the supplied rule; it is not deducted from income.
- **PCB/monthly tax deduction** is an amount already paid or withheld. Compare the total PCB with final tax payable to determine a refund or balance; PCB is neither a relief nor a rebate.
- **Tax avoidance** through lawful arrangements and **tax evasion** through unlawful concealment or false reporting are not interchangeable. Questions about evasion must not imply that illegal conduct is an acceptable financial strategy.

## Difficulty strategies

### Direct/indirect classification & simple taxes
- **Easy**: classify taxes; calculate SST on a bill using the rate and taxable items stated in the question.
- **Medium**: assessment tax from monthly rent and a supplied rate; quit rent from land area and a supplied rate; road tax from a supplied schedule with a base amount and an amount per cc above a threshold.
- **Hard**: multi-tax yearly obligations combined (quit rent + assessment + road tax for a property owner); reverse (given assessment tax, find rent); SST-inclusive price extraction (price includes 6% service ⇒ base = price/1.06 — division trap).

Any numerical rate in an example, including the 6% in the inclusive-price pattern above, is illustrative only. A generated item must restate that rate and label its schedule `as_of: YYYY-MM-DD` (or at least the applicable year) or state **"For this question, use the schedule given"**.

### Income tax (the core skill)
- **Easy**: chargeable income from income − total reliefs.
- **Medium**: progressive band computation with a given band table (first 20 000 @ 0%, next 15 000 @ 3%, … — tax = sum over bands); verify band-by-band arithmetic.
- **Hard**: full pipeline: annual taxable income (for example, stated salary, rental income and bonus) − supplied exemptions and reliefs, with supplied eligibility rules and caps = chargeable income → supplied band table → gross tax − supplied rebates = tax payable; then compare with total PCB deducted (monthly × 12) to find a refund or balance. Other hard items may reverse through one or two supplied bands, or compare separate and joint assessment under the rules given.
- Distractors: applying one rate to all chargeable income instead of progressive bands; exceeding a supplied relief cap; subtracting a rebate before calculating band tax; treating PCB as a relief; comparing PCB with gross tax before rebates; mixing annual and monthly figures.

### Consequences of tax evasion

- **Easy**: identify tax evasion in a short scenario and distinguish it from an honest error or lawful tax planning when the facts are sufficient.
- **Medium**: explain legal and financial consequences under the rules supplied in the item, such as investigation, penalties, repayment of unpaid tax, interest or other sanctions; do not require memorisation of current penalty amounts.
- **Hard**: evaluate both (i) legal/financial consequences for the taxpayer and public revenue and (ii) moral/ethical consequences such as unfair burden shifting, reduced funding for shared services, dishonesty and erosion of public trust. Mark schemes should credit reasoned links to the scenario, not a single prescribed opinion.
- Do not invent or imply current offences, penalty percentages, limitation periods or enforcement procedures. If a question assesses a specific consequence, provide the applicable rule with `as_of` metadata or frame it as a rule given for the question.

## Visual aids
- **REQUIRED (as tables)** — every tax band table, relief/rebate table, road-tax schedule, SST scope/rate table, property or quit-rent rate, and PCB record needed for a computation must accompany the question. Render as clean markdown/HTML/SVG tables and include units, thresholds, inclusivity of band endpoints, caps and any calculation order needed for a unique answer.
- Charts not required.

## Generator notes
- Always embed every needed schedule and rule in the question (for example, a band table with 3–5 bands, relief/rebate list with caps, SST scope and rates, and road-tax schedule). Self-contained data is mandatory, not optional.
- Give each real-world schedule an `as_of` date or applicable assessment year. For invented or simplified educational data, label it **"For this question, use the schedule given"** and do not describe it as current Malaysian law.
- Treat all tax rates, brackets, thresholds, relief caps, eligibility rules, rebates, SST scope, road-tax bands, PCB rules, and separate/joint-assessment rules as time-sensitive. Never retrieve one current figure while leaving the rest implicit.
- Band table format: | Chargeable income (RM) | Computation (RM) | Rate (%) | — the standard Malaysian presentation (base tax + rate on excess over band start). Support BOTH "excess-over-base" and "sum-of-bands" computation styles and make clear which the table uses.
- Choose chargeable income landing mid-band so the excess computation is exercised; keep arithmetic in hundreds.
- Reverse problems: pick income so payable lands cleanly in one band.
- Validate each generated item by independently applying the supplied schedule in its stated order. Check cap enforcement, band boundaries, non-negative tax after rebates where required by the supplied rules, and refund/balance direction.
- Cross-link: Form 4 Ch10 (tax within financial plans); Ch3 insurance (life-insurance relief links the chapters — good combined items).
