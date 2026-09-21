# Form 4, Chapter 6: Linear Inequalities in Two Variables

## Overview
Extends Form 1 Ch7 to two variables: linear inequalities in x and y, their graphs (half-planes with inclusive/strict boundary lines), systems of two/three inequalities defining a region, forming and verifying conjectures about points in a region, and forming inequalities from real-life constraints. Objective-function optimisation is enrichment (a precursor to linear programming), not core content. Shading items can be generated in an SPM Paper 2 style when supported by the target assessment specification.

## Prerequisites
Form 3 Ch9 (straight lines: y = mx + c, intercepts); Form 1 Ch7 (one-variable inequalities).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 6.1 | Linear inequalities in two variables | Recognise linear inequalities in two variables (ax + by > c etc.); determine whether a point satisfies an inequality (substitution); form and verify conjectures about which points are solutions and where they lie relative to the boundary; form inequalities from situations (budget constraints, "at least", "not more than", capacity); make a conclusion about solution pairs. | Substitute several points from the proposed region, boundary and opposite region to test a conjecture; distinguish confirming examples from a general conclusion. | Check points; make and verify a conjecture about a solution region; form inequality from words; list lattice-point solutions. |
| 6.2 | Systems of linear inequalities | Graph a single inequality: render inclusive and strict boundaries using the stated, verified convention, shade the correct side (test point), and state boundary inclusion symbolically or textually; region satisfying two or three inequalities; shade the region on a given grid with pre-drawn lines; state the inequalities defining a given shaded region; integer points within a region. Objective-function optimisation over the feasible region is enrichment only. | Boundary + test point; region = intersection of half-planes. | Draw and shade region for 2–3 inequalities; write inequalities for a shaded region; count/list integer points; real-constraint region problems; enrichment: optimise a stated linear objective. |

## Difficulty strategies

### 6.1
- **Easy**: test whether (2, 3) satisfies x + y > 4.
- **Medium**: form inequality from words ("total cost of x tickets at RM20 and y tickets at RM35 is not more than RM400"); find which of four points satisfy; conjecture which side of a boundary is the solution region and verify using substitutions.
- **Hard**: form two/three inequalities from a full constraint paragraph (two products, machine hours, minimum production); include non-negativity (x ≥ 0, y ≥ 0); "at least twice as many" ratio constraints (y ≥ 2x); evaluate a proposed conjecture by testing points in the region, on its boundary and outside it, then state a justified conclusion.

### 6.2
- **Easy**: shade the region for one inequality with its line given; identify whether the boundary is included and render it using the convention stated in the item.
- **Medium**: region defined by two inequalities (draw one/both lines); write the inequalities for a two-line shaded region; determine which given points lie in the region.
- **Hard**: three inequalities (standard SPM format: grid with two lines drawn, draw the third, shade region defined by all three); region with a line through intercepts requiring gradient computation first; count lattice points in the shaded region; form + draw + shade full constraint problem.
- **Enrichment only**: maximise or minimise a stated linear objective such as x + y over the feasible region by comparing its values at vertices (introductory linear programming).
- Distractors: shading the wrong side (test the origin carefully — but origin may lie on the line); confusing the stated styles for strict and inclusive boundaries; strict vs inclusive when counting lattice points on the boundary; inequality direction when writing from a shaded region (flip when testing).

## Visual aids
- **REQUIRED** — Cartesian grid SVGs: boundary lines rendered according to the verified target-assessment convention (commonly solid for inclusive and dashed for strict), shaded region with a key or R-label, axis labels and scales. For "write the inequalities" questions, show the shaded region with line labels.
- Lines must pass through clear lattice points; grid typically 0–10 per axis (first quadrant dominates for constraint problems).
- Never rely on the boundary-line style alone to communicate inclusion. State every defining inequality symbolically in the question or state textually whether points on each boundary are included; the answer data must preserve the same strict/inclusive relation.

## Generator notes
- Choose boundary lines from chosen intercept points so drawing is clean; compute the region polygon and lattice points programmatically for answer data.
- Standard SPM item template: "On the grid provided, shade the region satisfying y ≤ x + 4, y ≥ −x + 2 and x < 5" — mix of inclusive and strict.
- Reverse questions ("state the three inequalities") need the shading convention fixed in the figure and stated in the question; validate each recovered strict/inclusive symbol independently of the renderer.
- Conjecture tasks should first elicit a claim (for example, that all points on one side of the boundary satisfy the inequality), then require symbolic substitution of representative points to verify or refute it. Include a boundary point whenever strictness is relevant, and do not treat a few confirming examples as proof of an unrestricted general statement.
- Constraint word problems: keep coefficients small and the feasible region non-trivial. Keep feasible-region interpretation in core; tag any maximum-items, maximum-profit or other objective-function task as `scope: enrichment`.
- Cross-link: Form 3 Ch9 lines; Form 1 Ch7; Form 4 Ch1 (boundary parabolas NOT included — linear only); Form 5 Ch8 modelling (constraints → optimisation).
