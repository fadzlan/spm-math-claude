# Form 4, Chapter 2: Number Bases

## Overview
Number bases less than 10: place values, conversion between bases 2–9 and base 10, conversion between two non-ten bases, and addition/subtraction within a base. Base 10 is used as the familiar reference and as the standard intermediate conversion method. The chapter is self-contained and has a low prerequisite load.

**Scope and calculator policy**

- **Core**: bases 2–9; place value; conversions using expanded notation or repeated division; comparison; valid-digit and unknown-digit/base problems; addition and subtraction only.
- **Enrichment**: hexadecimal (base 16), digits A–F, and direct binary bit-grouping shortcuts such as 2↔8 or 2↔16. Do not use these to assess core learning standards.
- **Calculator**: disallowed for generated assessment items. It may be used only during conceptual exploration or to check an independently obtained result.
- Multiplication and division in a non-ten base are outside the prescribed calculation scope and must not be generated as core items.

## Prerequisites
Powers of integers (Form 1 Ch3, Form 3 Ch1).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 2.1 | Number bases | Represent numbers in bases 2–9; place values (n⁰, n¹, n² …); digits valid in base n (0 to n−1); convert base n → base 10 (expanded notation); convert base 10 → base n (repeated division); convert between two non-ten bases through base 10; compare/order values in different bases; find an unknown digit or base (e.g. 2x5₇ or "if 31ₓ = 25₁₀, find x"); add and subtract in a stated base. | Value = Σ dᵢ × nⁱ; for every numeral, 0 ≤ dᵢ < n. | Convert; state the place value or value of a digit; find an unknown in digit/base puzzles; order numbers across bases; add/subtract in base n with carrying/borrowing. |

## Difficulty strategies

- **Easy**: convert small base-2 or base-8 numerals to base 10; convert base-10 numbers (≤ 50) to bases 2, 5, or 8.
- **Medium**: larger conversions (base-10 numbers up to 500 to bases 2–9); conversions between two non-ten bases through base 10; place-value questions ("value of digit 3 in 3421₅"); addition or subtraction with one carry/borrow.
- **Hard**: addition/subtraction in a non-ten base with multiple carries/borrows (e.g. 546₇ + 356₇); find an unknown digit m in 3m4₆ = a given base-10 value, subject to 0 ≤ m < 6; find an unknown base n from an equation (21ₙ = 13₁₀ ⇒ 2n + 1 = 13); order a list mixing bases 2–9 and base 10; multi-step conversion followed by addition/subtraction and expression in a third base.
- **Enrichment only**: base-8 ↔ base-2 conversion by 3-bit grouping; hexadecimal recognition and base-2 ↔ base-16 grouping. Label these items `scope: enrichment`; direct grouping is an optional shortcut, not the defining conversion method.
- Distractors: an invalid digit for the base (7 in base 7); place value off by one power; carrying/borrowing in 10 instead of n. Incorrect bit grouping may be used only in enrichment items.

## Visual aids
- **NONE** generally — symbolic.
- **OPTIONAL** — place-value table (columns labelled n³, n², n¹, n⁰) for teaching-style items.
- **ENRICHMENT ONLY** — bit-grouping diagram for direct 2↔8 or 2↔16 conversion.

## Generator notes
- Validate `0 ≤ digit < base` for every digit of every generated numeral. Leading digits must be nonzero.
- Restrict every core non-ten base to an integer from 2 through 9. Base 10 may appear as the reference representation, but do not generate a core base n with n ≥ 10.
- For in-base addition or subtraction, compute in base 10 internally, perform the inverse conversion, and verify the displayed result in the original base. Generate carries/borrows deliberately at Hard. Do not generate multiplication or division in a non-ten base.
- Unknown-digit puzzles: after solving, verify that the digit is an integer satisfying `0 ≤ digit < base` and that the answer is unique.
- Unknown-base puzzles: choose the base first from 2–9, build the equation so its unique solution is an integer, and enforce both `base > every digit appearing in the numeral` and `base < 10`. Reject candidates that violate either condition.
- Do not require or permit calculator-dependent solution methods in assessment items; calculators are limited to conceptual exploration or independent checking.
- Cross-link: powers/indices (Form 3 Ch1); linear equation solving (Form 1 Ch6) inside digit puzzles; otherwise standalone — ideal for variety in generated sets.
