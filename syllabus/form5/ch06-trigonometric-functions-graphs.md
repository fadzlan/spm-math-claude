# Form 5, Chapter 6: Ratios and Graphs of Trigonometric Functions

## Overview
Extends Form 3 Ch5: trigonometric ratios of angles 0°–360° using the unit circle/quadrant approach (ASTC — all four quadrants, signs per quadrant, reference angles), special-angle exact values, and graphs of `y = sin x`, `y = cos x`, and `y = tan x`. Includes amplitude for sine and cosine, period and simple transformations of `y = a sin(bx) + c`, `y = a cos(bx) + c`, and `y = a tan(bx) + c`, with `a > 0` and `b > 0` in core items, plus solving simple trigonometric equations in a stated range and applications.

## Prerequisites
Form 3 Ch5 (SOH CAH TOA); Form 2 Ch8 (graphs); Form 1 Ch3 (surds/roots for exact values).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 6.1 | Trigonometric ratios of any angle | Angles in four quadrants on Cartesian plane; reference/associated acute angle for non-quadrantal angles; signs by quadrant (ASTC: All-Sin-Tan-Cos); ratios of 0°, 90°, 180°, 270°, 360°; exact values for 30°/45°/60° and their quadrant relatives (150°, 210°, 330°…); given `sin θ = value` and a quadrant, find `cos θ` or `tan θ` using sign reasoning and a Pythagorean triple; evaluate expressions with quadrant angles. | Use the acute reference angle with the x-axis for non-quadrantal angles, then apply the quadrant sign; ASTC. At a quadrantal angle, the usual acute reference angle degenerates, so evaluate directly from the axes rather than pretending it is acute. | Evaluate `sin 210°`, `cos 300°`, `tan 135°`; find all ratios given one ratio and quadrant information; find `θ` given a ratio and quadrant information. |
| 6.2 | Graphs of trigonometric functions | Graphs of `y = sin x`, `y = cos x`, and `y = tan x` for 0°–360°; amplitude and maximum/minimum for sine and cosine; periods and tangent asymptotes; transformations `y = a sin(bx) + c`, `y = a cos(bx) + c`, and `y = a tan(bx) + c`, where core generation uses `a > 0`, `b > 0`; sketch and read graphs; count solutions from intersections; solve simple trigonometric equations in stated ranges; applications such as recognising periodic tides or temperature cycles. | Sine/cosine: amplitude `a`, period `360°/b`, midline `y = c`, range `[c-a, c+a]`. Tangent: period `180°/b`, midline `y = c`, range all real values, and no amplitude or maximum/minimum; undefined where `x = (90° + 180°n)/b`, `n` an integer. | Sketch/identify graphs; state amplitude, period, midline, or range where defined; solve `sin x = 0.5` in a stated range; count intersections with a horizontal line; find `a`, `b`, `c` from a graph. |

## Difficulty strategies

### 6.1 Ratios of any angle
- **Easy**: quadrant identification; sine/cosine/tangent of 0°, 90°, 180°, 270° (including undefined values); reference angle of a non-quadrantal angle, or direct evaluation at a quadrantal angle.
- **Medium**: exact values via reference angle + sign (sin 150° = ½, cos 225° = −√2/2, tan 300° = −√3); evaluate combined expressions (2 sin 150° + cos 180°).
- **Hard**: given sin θ = 5/13 with θ obtuse, find cos θ + tan θ (triple + sign work); find both angles in 0°–360° with tan θ = −1 (135°, 315°); compare values across quadrants without calculator; proofs-lite (sin(180° − θ) = sin θ used to simplify).
- Distractors: wrong sign per quadrant; `tan 90° = 0` error (it is undefined); reference angle computed from the wrong axis. If a convention assigns reference angle `0°` at a quadrantal angle, define that extended convention explicitly rather than calling `0°` an acute angle.

### 6.2 Graphs
- **Easy**: identify which graph is sin/cos/tan; state max/min of sin.
- **Medium**: amplitude and period from an equation (`y = 3 cos 2x` has amplitude 3 and period 180°); sketch `y = 2 sin x` for 0°–360° using key points; solve `sin x = k` with two solutions in the range.
- **Hard**: determine positive `a`, positive `b`, and `c` from a drawn transformed graph (for sine/cosine, read maximum/minimum to obtain `a` and `c`; count cycles to obtain `b`); count solutions of `f(x) = k` over 0°–720°; solve equations such as `cos x = -0.5` using quadrant reasoning; read a tangent graph with asymptotes; match equations to sketches.
- Distractors: using `360°b` instead of `360°/b` for sine/cosine; incorrectly assigning an amplitude to tangent; using `360°/b` instead of `180°/b` for tangent; misplacing tangent asymptotes; forgetting a valid quadrant solution or duplicating a range endpoint.

## Visual aids
- **REQUIRED** for graph questions — SVG sinusoidal/tangent graphs on degree axes (0°–360°, optionally 720°), gridlines at suitable angle and y-value intervals, dashed asymptotes for tangent, and key points marked. Break tangent paths at every asymptote; never connect across an undefined value. For find-`a,b,c` questions, the graph must exactly match the generated equation.
- 6.1: **RECOMMENDED** — unit-circle/quadrant diagram with the angle drawn and reference angle marked.

## Generator notes
- Restrict to degrees (KSSM uses degrees).
- Exact-value set: 30/45/60 family only, values ∈ {0, ±½, ±√2/2, ±√3/2, ±1, ±√3, ±1/√3, undefined}.
- Equation solving: choose `k` from the exact-value set or calculator-friendly decimals (state any instruction to round `θ` to 1 d.p.); always require all solutions in the stated range. Generate candidates over the closed/open endpoints actually stated, deduplicate coincident endpoint or branch results, sort them, and reject any angle at which the original expression is undefined. Check the final list by substitution into the original equation.
- Graph-reading: for core items, generate the SVG from `y = a sin(bx) + c`, `y = a cos(bx) + c`, or `y = a tan(bx) + c` with small integers and `a > 0`, `b > 0`, so periods and cycle counts are exact. Negative `a` or `b` must be tagged enrichment rather than silently entering core generation.
- Never request the amplitude, maximum, or minimum of a tangent function. Validate each tangent graph/equation against all asymptotes in the displayed or solution range, including range endpoints.
- Cross-link: Form 3 Ch5 (right-triangle ratios); Form 2 Ch8 (graph reading); Form 4 Ch1 (graph transformations parallel quadratic vertex ideas); Form 5 Ch8 (modelling periodic phenomena).
