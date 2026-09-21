# Form 2, Chapter 3: Algebraic Formulae

## Overview
This chapter develops four connected core skills: forming a formula from a situation, changing the subject of a formula, determining the value of one variable from another, and solving contextual problems involving formulae. Algebraic fractions and their operations are taught in Form 2 Chapter 2, not as a subtopic of this chapter.

## Prerequisites
- Form 1 Chapter 5: variables, algebraic expressions, and substitution.
- Form 1 Chapter 6: solving linear equations.
- Form 2 Chapter 2: expansion, factorisation, and algebraic fractions when these are needed as supporting manipulations.

## Scope labels
- **Core**: directly assesses the Form 2 Algebraic Formulae learning standards.
- **Supporting prerequisite**: uses previously learned algebra but does not turn it into the main assessment target.
- **Extension**: goes beyond routine Form 2 rearrangement and must be explicitly tagged; it must never appear merely because an item is labelled Hard.

## Topic & subtopic breakdown

| # | Subtopic | Scope | Content coverage | Key skills | Typical question types |
|---|---|---|---|---|---|
| 3.1 | Forming formulae | Core | Represent a stated relationship or situation using variables. Define every symbol and preserve units and conditions from the context. | Translate phrases such as “total”, “difference”, “per”, “twice”, and “shared equally” into operations; distinguish a variable from a constant in context. | Write the total cost of `n` items with a fixed delivery charge; form a perimeter, area, speed, or fare formula. |
| 3.2 | Changing the subject | Core | Rearrange formulae using inverse operations while maintaining equality. Core items keep the new subject in a linear, one-occurrence form and may require expansion or collecting like terms already mastered. | Apply the same valid operation to both sides; clear numeric denominators; factor out the required subject; state any restrictions created by division. | Make `x` the subject of `y = 3x - 5`; make `h` the subject of `A = (a+b)h/2`; make `p` the subject of `q = p(r+s)`. |
| 3.3 | Relating variables and determining values | Core | Use a formula to determine one variable when the relevant other variables are known; describe how one variable changes when another changes in a stated formula or table. | Substitute accurately, respect order of operations, retain exact values until the final step, and attach units. | Find `d` from `d = vt`; compare the resulting value when `v` is doubled; complete a value table from a given formula. |
| 3.4 | Problems involving formulae | Core | Form, select, rearrange, and use a formula in meaningful mathematical and real-life contexts. | Identify known and unknown quantities; choose or form the relation; rearrange if necessary; substitute; interpret and check the result against the context. | Total cost, perimeter/area/volume, temperature conversion, speed, or other self-contained contexts in which every convention is supplied. |
| 3.E | Rational and root inversions | Extension | Rearrangements in which the subject is in a denominator, occurs on both sides of a rational relation, or must be recovered from a square/root. | Track excluded denominator values, real-root conditions, and contextual sign restrictions; verify the equivalent formula by back-substitution. | Make `x` the subject of `y = (2x+3)/(x-1)`; make `r` the subject of `V = πr²h` for a geometric radius. |

## Difficulty strategies

Difficulty must come from reasoning demand, representation, and scaffolding while remaining within the declared scope. A Hard label does not by itself permit extension content.

### Core items
- **Easy**: form a one- or two-operation formula from a direct statement; substitute positive integers into a supplied formula; perform a one-step subject change.
- **Medium**: translate a less direct context; substitute negative numbers, decimals, or fractions; perform a two- or three-step rearrangement; determine a value after changing the subject.
- **Hard**: combine forming, rearranging, and evaluating a formula in a multi-step context; include irrelevant-but-plausible data only when the wording remains unambiguous; ask the student to compare or justify values produced by a formula. Keep the algebra within core scope.
- **Common distractors**: applying an operation to only one term or one side; losing a negative sign; distributing incorrectly; substituting into the wrong variable; rounding too early; omitting or using inconsistent units.

### Extension items
- Tag every item `scope: extension` and state the assumed algebraic domain.
- Subject-on-both-sides rational formulae and root/square inversions may be used only when all required manipulation has been mastered or supplied with suitable scaffolding.
- Do not use a famous scientific formula merely for appearance. Provide all definitions, units, constants, and conventions needed to solve the item.
- Useful extension distractors include inverting only part of a fraction, forgetting to factor the subject before division, discarding a required sign, or accepting a value excluded by the original formula.

## Domain and validity rules

Every generated instance must carry an internal domain record and must be rejected if its prompt or answer violates that record.

- **Denominators**: record every excluded value from the original formula and from the rearranged formula. For `y = (2x+3)/(x-1)`, require `x ≠ 1`; the rearrangement `x = (y+3)/(y-2)` also requires `y ≠ 2`.
- **Even roots and squares**: over the real numbers, require a non-negative radicand. If rearranging `x² = k`, retain both `x = ±√k` unless the context restricts the sign. A length, radius, time interval, or other non-negative measurement uses the contextually valid root only, and that restriction must be stated.
- **Division while rearranging**: if the result divides by a variable expression, state that the divisor is non-zero and generate values that satisfy this condition. For `A = (a+b)h/2`, solving for `h` requires `a+b ≠ 0` unless the context already guarantees positive lengths.
- **Context**: enforce plausible sign, unit, and range constraints. BMI, financial, temperature, or scientific contexts may be used only when the formula and conventions are supplied; knowledge of the context must not be an unstated prerequisite.
- **Rounding**: calculate with exact values where possible and round only at the stated final stage. Use an approximation sign after rounding.

## Mandatory verification

Back-substitution is required for every generated change-of-subject item, not only Hard items.

1. Generate values satisfying the original domain and all contextual restrictions.
2. Evaluate the original formula independently.
3. Evaluate the rearranged formula using the same values.
4. Reject the item unless the exact results agree, or numerical results agree within a declared tolerance caused only by final rounding.
5. Substitute the proposed answer into the original formula and reject extraneous, excluded, non-real, or contextually impossible values.

For symbolic generation, also simplify the difference between the original and reconstructed expressions when the algebra system supports it. Numeric tests supplement this identity check; they do not replace it.

## Visual aids
- **None** for most symbolic, substitution, and relationship questions.
- **Optional** for a context in which a simple labelled diagram clarifies how quantities are related, such as a rectangle or cylinder.
- A diagram must be generated from the same internal values as the formula, label every required quantity, include units where appropriate, and avoid suggesting that an unlabelled length can be measured.

## Generator notes
- Generate the underlying relationship and valid solution first; then render the wording, formula, diagram, distractors, and mark scheme from that shared model.
- Vary which quantity is unknown so that “determine a variable from another variable” is not reduced to repeated direct substitution.
- When forming a formula, accept algebraically equivalent expressions unless the question explicitly requests a particular form.
- Keep algebraic-fraction simplification and operations in Form 2 Chapter 2. In this chapter they may appear only as a tagged supporting prerequisite needed to manipulate a formula, never as the assessed subtopic.
- Prefer self-contained, age-appropriate contexts. Geometry, total cost, conversion, and motion are suitable when all required information is given.
- Cross-links: Form 1 Chapters 5 and 6 supply algebraic mechanics; Form 2 Chapter 2 supplies factorisation and algebraic-fraction manipulation; Form 5 Chapter 1 develops variation from these formula-construction skills.
