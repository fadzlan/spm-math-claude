# Form 3, Chapter 2: Standard Form

## Overview
Standard form (scientific notation) A × 10ⁿ, 1 ≤ A < 10, for very large and very small numbers; conversions, four operations, and applications in science/daily contexts (astronomy, biology, computing). Also covers significant figures as supporting skill. Uses index laws from Ch1.

## Prerequisites
Ch1 indices (powers of 10, negative indices); decimal place value.

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 2.1 | Significant figures | Round to n significant figures (integers, decimals, values with zeros); identify number of significant figures; use in measurement contexts. | s.f. rules; leading zeros not significant. | Round to 2/3 s.f.; count s.f. in 0.00470; choose correct rounding. |
| 2.2 | Standard form | Convert ordinary numbers ↔ standard form (large and small); relate standard form to common metric prefixes, including nano (10⁻⁹) and tera (10¹²); compare and order numbers in standard form; add/subtract/multiply/divide numbers in standard form (single operation and combined), including solutions that use factorisation; applications (distance sun–earth, mass of atoms, data storage, population); compute with standard form and express answer in standard form, sometimes to n s.f. | A × 10ⁿ, 1 ≤ A < 10; nano (n) = 10⁻⁹; tera (T) = 10¹²; index laws on powers of 10; factor out a common power of 10 or common standard-form factor where useful. | Convert; express 6.2 nm in metres or 4.5 × 10¹² bytes in terabytes; compute (3.2 × 10⁵) × (4 × 10³); simplify by factorisation; find value of expression in standard form; word problems (how many times heavier…). |

## Difficulty strategies

### 2.1 Significant figures
- **Easy**: round integers/decimals to stated s.f. (4763 → 2 s.f. = 4800).
- **Medium**: small decimals (0.030457 → 3 s.f.); counting s.f. with internal/trailing zeros.
- **Hard**: rounding where a carry propagates (0.09996 → 3 s.f. = 0.100); multi-step computation then round to s.f.; distinguish s.f. vs d.p. explicitly.

### 2.2 Standard form
- **Easy**: convert large numbers both directions (45 000 000 ↔ 4.5 × 10⁷).
- **Medium**: small numbers (0.00032 = 3.2 × 10⁻⁴); single multiplication/division of two standard-form numbers; ordering a mixed list.
- **Hard**: addition/subtraction requiring exponent alignment (4 × 10⁵ + 3 × 10⁴); combined operations then normalise (answer must satisfy 1 ≤ A < 10 — renormalising is the trap); operations made efficient by factorisation, such as extracting a common power of 10 before simplifying; "how many times" ratio problems (mass of sun ÷ mass of planet); unit-context computations using nano (10⁻⁹) and tera (10¹²); answers to a specified number of s.f.
- **Rounding convention**: unless a question explicitly asks for an intermediate approximation, retain exact values throughout the working, normalise the result, and round only the final answer to the stated number of significant figures. Use `≈`, not `=`, for a rounded value.
- Distractors: sign errors on exponents of small numbers; adding exponents for addition (10⁵ + 10⁴ ≠ 10⁹); dividing 10⁻⁶ ÷ 10⁻² as 10³ instead of 10⁻⁴. Use an unnormalised coefficient such as 32 × 10⁵ only when normalization itself is being assessed. When comparison or magnitude is the target skill, write every option in normalized standard form so formatting does not reveal the answer.

## Visual aids
- **NONE** — numeric chapter. Context photos/scales are **OPTIONAL** flavour only (not needed for generation).

## Generator notes
- Enforce the 1 ≤ A < 10 normalisation check programmatically on every generated answer.
- For add/subtract questions choose exponents differing by 1–3 so alignment arithmetic is meaningful.
- Include operation items in which a common power of 10 or common standard-form factor can be extracted; verify the expanded and factorised forms give the same value.
- If significant-figure rounding is requested, carry exact values (or sufficient guard digits for measured input) through intermediate steps and apply the stated rounding once, after final normalization.
- For multiple-choice comparison/magnitude items, normalize every numerical option; reserve unnormalised options for questions that explicitly test recognition or correction of standard form.
- Realistic constants help: speed of light 3 × 10⁸ m/s, earth–sun 1.5 × 10⁸ km, cell size ~10⁻⁵ m — keep context numbers plausible.
- Cross-link: Ch1 index laws (division of powers of 10); Form 1 Ch1 decimal skills; used across science subjects.
