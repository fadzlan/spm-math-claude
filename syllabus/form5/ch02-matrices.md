# Form 5, Chapter 2: Matrices

## Overview
Matrix fundamentals: representing real-life information using matrices; order, elements, types (row, column, square, zero, identity); equality; addition, subtraction, scalar multiplication; matrix multiplication; identity matrix I; inverse of a 2×2 matrix; solving 2×2 matrix equations; solving simultaneous linear equations via matrix inverse method. Transpose, arbitrary matrix powers, equations of the form `AB = BA`, and named "singular matrix" tasks are enrichment rather than core learning standards.

## Prerequisites
Form 1 Ch1 (integer arithmetic); Form 3 Ch9 (simultaneous equations).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 2.1 | Matrices | Represent real-life information as matrices; matrix notation; order m × n; element aᵢⱼ; row/column/square/zero/identity matrices; equal matrices (find unknowns). Transpose recognition is enrichment. | Order = rows × columns; preserve the meaning and units attached to each row and column. | Convert a labelled table or situation into a matrix; state order/element; find x, y from matrix equality; identify types. |
| 2.2 | Basic operations on matrices | Addition/subtraction (same order); scalar multiplication; combined (2A − 3B); find unknowns in operation equations; matrix multiplication (order compatibility; (AB)ᵢⱼ = row·column); non-commutativity illustrated by comparing AB and BA. Arbitrary powers and solving `AB = BA` are enrichment. | Compatibility: (m×n)(n×p) = m×p. | Compute A + B, kA, AB, BA; find unknown element from a product; compare AB and BA; real-context products (price × quantity tables). |
| 2.3 | Inverse matrix and solving matrix equations | Determinant ad − bc; for `ad − bc ≠ 0`, inverse M⁻¹ = (1/(ad − bc)) × (d, −b; −c, a); identity property MM⁻¹ = I; find inverse; solve AX = B via X = A⁻¹B with compatible dimensions stated; solve simultaneous linear equations by matrix method (write as matrix equation, find inverse, multiply). Recognising that determinant zero means no inverse is core; named "singular matrix" tasks are enrichment. | det = ad − bc; `M⁻¹` exists only when `det(M) ≠ 0`; X = A⁻¹B, with multiplication order preserved. | Find determinant/inverse; decide whether an inverse exists; solve 2×2 systems via matrices; find matrix X in AX = B. |

## Difficulty strategies

### 2.1
- **Easy**: state order and specific element; identify identity matrix.
- **Medium**: equality → solve simple equations for two unknowns.
- **Hard**: equality with expressions (2x + y entries) needing simultaneous solving (links 2.3).

### 2.2
- **Easy**: A + B, A − B, 3A with small integers.
- **Medium**: 2A − 3B combined; multiplication (2×2)(2×2) with small values; (2×3)(3×2) → 2×2 and (3×2)(2×3) → 3×3 to expose order effect.
- **Hard**: find unknown elements in products (one entry of A unknown, product given); context products (3 items × 2 branches sales table × price vector → revenue); compare AB and BA with computation. Powers such as A² and A³ and finding k so that `AB = BA` are enrichment only.
- Distractors: multiplying corresponding elements (element-wise) instead of row×column; assuming commutativity; order incompatibility not checked.

### 2.3
- **Easy**: determinant; inverse with det = 1 or small; verify MM⁻¹ = I.
- **Medium**: inverse with det ≠ ±1 (fractions); solve X in AX = B with integer inverse, stating dimensions such as `A` 2×2 and `B`, `X` 2×1.
- **Hard**: convert simultaneous equations to matrix form, find inverse, solve (2p + 3q = 12; p − q = 1 style); determine a parameter for which the inverse does not exist; fractional entries in inverse requiring careful multiplication; word problem → simultaneous equations → matrix method (two-item pricing). Use the term "singular matrix" only in an enrichment-tagged item.
- Distractors: inverse adjugate arranged wrongly (swap a,d and negate b,c — not swap b,c); forgetting 1/det factor; X = BA⁻¹ order error (must be A⁻¹B); sign errors in det.

## Visual aids
- **NONE** — matrix questions are symbolic/tabular.
- **OPTIONAL** — data tables feeding matrix contexts (price/quantity tables).

## Generator notes
- Keep entries ∈ −9…9; for inverse-heavy items choose det ∈ {±1, ±2, ±3, ±5} at Medium to limit fraction mess; allow any nonzero det at Hard.
- Simultaneous-equation items: choose the solution first (small integers, possibly one negative), build equations, then require the matrix method — answers stay clean.
- Never request or use `M⁻¹` unless `det(M) ≠ 0`. Parameter tasks that make the determinant zero may ask when the inverse does not exist; reserve named "singular matrix" terminology for enrichment.
- For every equation `AX = B`, state the order of `A`, `X`, and `B`, check compatibility, and retain the order `X = A⁻¹B`; matrix multiplication cannot be reordered.
- In every real-life context, display row and column labels (and units where relevant) outside the matrix so each entry has an unambiguous interpretation. Use the same label order when combining matrices.
- Cross-link: Form 3 Ch9 simultaneous equations (same systems solved differently — great "two methods" questions); Form 1 Ch6.
