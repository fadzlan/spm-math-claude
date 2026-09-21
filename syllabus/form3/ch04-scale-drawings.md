# Form 3, Chapter 4: Scale Drawings

## Overview
Scale drawings: interpreting, determining, and producing drawings to a stated scale, including enlargement and reduction on grids; converting between drawing and actual measurements; and solving related problems. Applications include maps, plans, and models. Links ratio skills to geometry. Area scaling is an extension/cross-topic application rather than a named core requirement of this chapter.

## Prerequisites
Form 1 Ch4 (ratios); Form 1 Ch10 (perimeter/area); unit conversions (cm↔m↔km).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 4.1 | Scale drawings (core) | Interpret a scale drawing and its scale; determine the scale from corresponding drawing and actual lengths; draw objects, plans, and simple shapes to a stated scale; enlarge or reduce drawings on square grids; convert drawing length ↔ actual length; use ratio and statement forms of scale; solve map, plan, and model problems. | For scale `1:n`, `actual length = drawing length × n` and `drawing length = actual length ÷ n`, after converting both lengths to the same unit. Corresponding lengths must preserve one common scale factor. | Read information from a scale drawing; find actual or drawing lengths; determine and state a scale as `1:n`; complete or construct a scale drawing on a labelled grid; check whether a proposed drawing is to scale; solve contextual problems. |
| 4.2 | Area scale (extension/cross-topic) | Relate the areas of similar figures to the square of the linear scale factor. Do not present this as guaranteed core Form 3 Chapter 4 content. | If the linear scale is `1:n`, the corresponding area scale is `1:n²`. | Find an actual area from a plan area; compare areas after enlargement or reduction. |

## Difficulty strategies

- **Easy**: direct conversion with scale 1:n, units aligned (drawing 3 cm, scale 1:100 ⇒ 300 cm).
- **Medium**: unit conversion required (map 4.5 cm, 1 cm : 2 km ⇒ 9 km); find the scale from a drawing/actual pair with unit juggling; express scale as 1:n.
- **Hard**: multi-step core problems (drawing → actual → cost/time, e.g. actual distance → travel time at a supplied speed); redraw a shape to a stated scale on a grid and use the result; reverse problems (determine a suitable scale to fit a specified drawing region); map problems with two or more legs and bearings-free distances. Area scaling may be used only when tagged **extension/cross-topic**.
- Distractors: unit inconsistency (cm on drawing vs m or km actual); inverting the ratio (`1:n` vs `n:1`); using different scale factors for different dimensions; rounding mid-computation. For extension area items, applying the linear rather than squared scale factor is a useful distractor.

## Visual aids
- **REQUIRED** for drawing-to-scale and grid tasks — use an SVG square grid with explicit grid-unit dimensions or numeric coordinates, and enough labelled corresponding lengths to make the intended scale unambiguous.
- For plan/map interpretation, use a constraint-consistent SVG and state the scale. If learners must measure the rendered drawing with a ruler, the generation and delivery pipeline must fix the SVG's physical dimensions, preserve 100% print scaling, and include a calibration segment (for example, a bar explicitly labelled `5 cm`). Otherwise, do **not** make the answer depend on screen or printed measurement: provide numeric lengths, coordinates, a scale bar with numeric subdivisions, or grid-unit dimensions.
- A label such as "1 cm squares" is valid only when the physical output size is controlled. In resizable digital output, call them "1-unit squares" and give the mathematical value represented by each square.
- Pure conversion questions: **OPTIONAL**.

## Generator notes
- Generate one internal geometric model first. Fix actual dimensions, select a scale that gives clean corresponding drawing lengths (integer grid units or simple halves), render the drawing from that model, and independently verify every labelled and derived length.
- Include all three core actions across the item bank: **interpret** a supplied scale drawing, **determine** an unknown scale, and **draw** to a given scale. Drawing tasks should specify a grid or exact construction dimensions and define the expected tolerance or accepted coordinates/vertices.
- For a determine-the-scale item, convert the drawing and actual lengths to the same unit before simplifying the ratio to `1:n`; reject instances that do not determine a unique scale.
- Common scales: 1:20, 1:50, 1:100, 1:200 (models/plans); 1:25 000, 1:50 000 (maps — keep arithmetic manageable, e.g. 1 cm : 0.5 km).
- Area-scaling items must carry `scope: extension` or `scope: cross-topic` and must not be described as guaranteed or required SPM content for this chapter.
- Measurement-based questions are permitted only with controlled physical print scaling and a calibration check. In all other delivery modes, assessment must use supplied numeric or grid dimensions rather than measurements taken from the rendered image.
- Cross-link: Form 1 Ch4 ratios; Form 1 Ch10 area; Form 2 Ch11/Form 5 Ch5 enlargement is the same scale-factor idea geometrically.
