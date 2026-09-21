# Form 4, Chapter 4: Operations on Sets

## Overview
Formal set operations: intersection, union, complement, combined operations on up to three sets, Venn diagrams, and solving problems (counting elements, survey problems). Direct continuation of Form 1 Ch11 with full notation; feeds probability and logical reasoning.

## Prerequisites
Form 1 Ch11 (sets, Venn diagrams); Form 4 Ch3 (logic: and/or/not map to ∩/∪/′).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 4.1 | Intersection of sets | A ∩ B; elements common to sets; Venn shading; intersection of two/three sets; disjoint sets (A ∩ B = ∅); find n(A ∩ B); convert among verbal descriptions, symbolic notation, lists/rosters, set-builder notation, and Venn diagrams. | ∩ notation; list common elements; express the same intersection in different representations. | List/find n(A ∩ B); translate a description or set-builder rule into a roster and Venn region; shade A ∩ B (′, or (A ∩ B)′); identify or describe a region. |
| 4.2 | Union of sets | A ∪ B; union of two/three sets; n(A ∪ B) = n(A) + n(B) − n(A ∩ B); shade unions; convert among verbal, symbolic, roster/set-builder, and graphical representations. | Inclusion-exclusion for two sets; verify equivalent representations element by element or region by region. | Compute n(A ∪ B) from data; convert a list, rule, or description to union notation and a diagram; shade A ∪ B; find a missing count. |
| 4.3 | Combined operations on sets | Complement A′ (within ξ); combined: (A ∪ B)′, A ∩ B′, (A ∩ B) ∪ C, etc. on up to three sets; shade regions for combined expressions; convert between a shaded region, a verbal description, symbolic notation, and list/set-builder form; solve word problems (surveys with two/three categories: all, only, both, neither counts) including finding unknowns via equations (x in a region). | De Morgan recognition; region algebra; n(ξ) = sum of regions; test representational equivalence against the same atomic regions. | Shade/describe combined region; write an expression for a description or shaded region; list elements represented by a diagram; populate 2- or 3-set Venn from survey text; find x given region totals; compute n of combined region. |

## Difficulty strategies

### 4.1–4.2 Intersection/Union
- **Easy**: list A ∩ B and A ∪ B from rosters (two sets, ≤ 8 elements).
- **Medium**: n(A ∪ B) via inclusion-exclusion with numbers; shade A ∩ B′-style two-region combos; convert rule-defined sets (multiples, factors) between set-builder notation, rosters, and Venn diagrams.
- **Hard**: three sets listed/shaded; translate among a verbal condition, symbolic expression, and graphical region before finding its elements or cardinality; find n(A ∩ B ∩ C); given n(ξ), n(A), n(B), n(A ∩ B) find n((A ∪ B)′) (the "neither" count).

### 4.3 Combined operations & problem solving
- **Easy**: shade (A ∪ B)′ given a two-set diagram.
- **Medium**: identify an expression and matching verbal description for a given shaded region (4-option MCQ); convert a combined expression to a roster or set-builder description over a stated finite universal set; populate two-set diagram from a survey (both count given; find only/neither).
- **Hard**: three-set survey problems with overlapping pairwise/triple counts given — populate all 7 inner regions and answer questions (only one category, exactly two); algebraic region counts (x members in A ∩ B; form and solve equation from totals — links Form 1 Ch6); combined shading like (A ∩ C) ∪ B′ on three sets.
- Distractors: A′ ∩ B′ vs (A ∪ B)′ confusion (De Morgan); subtracting intersection twice; counting "only A" as n(A); forgetting n(ξ) constraint; misreading "exactly two" as "at least two".

## Visual aids
- **REQUIRED** — Venn diagram SVGs: rectangle ξ with 2 or 3 overlapping circles, labelled sets, region counts or element lists, and shading (with a shading key) for shade/identify questions. Three-circle diagrams must have all 8 regions present and labelable.

## Generator notes
- Maintain the region model internally (each region's count) and derive all question data from it — guarantees consistency (n(A) = sum of A's regions etc.).
- Treat the eight atomic regions of a three-set diagram (including the outside region) as the canonical model. Derive every verbal description, symbolic expression, roster/set-builder form, and graphical shading from the same selected elements or atomic-region mask; validate conversions by comparing their resulting element sets or masks.
- Survey word problems: generate region counts first, then expose only a consistent subset as givens. Before accepting a three-set item, form the linear constraint system for the displayed totals and perform a rank/constraint check: the givens together with stated non-negativity/integrality conditions must determine every requested region or quantity uniquely. Reject underdetermined items, inconsistent totals, and cases with multiple feasible integer solutions.
- Algebraic problems: place x in one region, choose totals so x solves to a non-negative integer.
- Use Malaysian school contexts: sports (bola sepak/badminton), food, languages spoken, tuition classes.
- Cross-link: Form 1 Ch11; Ch3 logic (¬, ∧, ∨ ↔ ′, ∩, ∪); Form 4 Ch9 probability (P(A ∪ B) via inclusion-exclusion contexts).
