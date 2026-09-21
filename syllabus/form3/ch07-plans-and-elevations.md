# Form 3, Chapter 7: Plans and Elevations

## Overview
Orthogonal projection of three-dimensional objects onto horizontal and vertical planes: interpreting projection direction, identifying and comparing a plan and elevations, and drawing plans and elevations accurately to a stated scale using construction lines. Objects may be represented by standard solids, composite solids, or arrangements of unit cubes, but cube-count reconstruction is not the organising focus of the chapter.

## Scope
- **Core**: meaning of an orthogonal projection; projection direction; horizontal and vertical projection planes; plan, front elevation, and side elevation; comparison of the views; drawing and interpreting views to scale; construction lines; dimensions obtained from views; problem solving involving plans and elevations.
- **Supporting representation**: unit-cube arrangements and an internal height map may be used to generate mutually consistent solids and views.
- **Enrichment only**: numbered height-map puzzles, reconstruction when several solids have the same views, and minimum/maximum cube-count problems. Do not use arbitrary oblique viewing directions as orthogonal elevations.

## Prerequisites
Form 2 Ch6 (properties and representations of three-dimensional shapes); Form 3 Ch4 (scale drawings); spatial visualisation; measuring and drawing straight lines.

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / conventions | Typical question types |
|---|---|---|---|---|
| 7.1 | Orthogonal projections | Explore and explain a projection as an image of an object on a plane; distinguish orthogonal projection from a non-orthogonal projection; identify the object, projection plane, and direction of projection. The projection rays are parallel and perpendicular to the projection plane. Compare the shape and dimensions visible in different projections. | Recognise horizontal and vertical planes; trace corresponding points and edges along the stated projection direction; understand that depth along the viewing direction is collapsed in the image. | Identify whether a diagram represents an orthogonal projection; select the projection produced on a labelled plane; explain why two views differ; match a view to a viewing-direction arrow. |
| 7.2 | Plans and elevations | A plan is the orthogonal projection on a horizontal plane viewed from above. A front or side elevation is an orthogonal projection on a vertical plane viewed from the stated direction. Interpret and draw plans, front elevations, and side elevations of solids or composite objects. | Use the labelled arrow or named face to establish the front/side direction; transfer widths, depths, and heights between views; retain alignment between corresponding features. | Name a given view; match an object to its views; draw one or more views on a grid; determine an omitted length or dimension from corresponding views. |
| 7.3 | Drawings to scale | Draw plans and elevations to a stated scale, with suitable instruments and light construction lines. Interpret actual dimensions from scaled views and check that corresponding dimensions agree across views. | Convert actual length to drawing length before drawing; state units; preserve alignment and proportion; use construction/projector lines to transfer dimensions, then emphasise required outlines according to the target convention. | Complete a plan or elevation from another view and dimensions; draw views at a stated scale; calculate an actual length from a scaled view; detect an inconsistent view. |
| 7.4 | Problem solving | Solve contextual and spatial problems using information from plans and elevations. A task must provide enough views, dimensions, scale information, and viewing directions for the requested answer to be unique. | Coordinate evidence from two or more views; verify overall width, depth, and height; distinguish what a projection determines from what remains hidden or ambiguous. | Choose the only consistent solid/view; find a missing dimension; complete a partially drawn view; explain why the supplied views are or are not sufficient. |

## Difficulty strategies

Difficulty should come from the number of features, representation changes, and reasoning needed, not from content outside the chapter.

### 7.1 Orthogonal projections
- **Easy**: identify the projection plane and direction in a simple diagram; distinguish a perpendicular projection from a slanting projection.
- **Medium**: match several axis-aligned projections to labelled horizontal or vertical planes and explain which dimensions are retained.
- **Hard**: reason about corresponding edges or vertices in a composite solid across two axis-aligned projections, with limited scaffolding.

### 7.2–7.3 Plans, elevations, and scale
- **Easy**: draw or identify one view of a cuboid, prism, or simple 2–4-cube arrangement on a square grid; use scale 1:1.
- **Medium**: draw a plan and two elevations of a stepped/composite object; transfer aligned dimensions with construction lines; use a simple stated scale such as 1:2 or 1:5.
- **Hard**: complete multiple aligned views of a composite object with several changes of level, calculate drawing lengths from a scale, and infer one missing actual dimension. Keep every viewing direction perpendicular to its projection plane.
- Plausible distractors may swap front and side directions, use depth as height, omit a visible change in level, fail to apply the scale, or misalign corresponding features.

### 7.4 Applications
- **Easy**: match a clearly distinct solid to a plan and one elevation.
- **Medium**: use two or three views to choose the consistent solid or determine a missing dimension.
- **Hard**: decide whether given views determine a requested feature uniquely and justify the conclusion, or complete a view after combining dimensions from the other views.
- If a numbered height map, ambiguous reconstruction, or minimum/maximum cube count is used, tag the item `scope: enrichment`; do not let it replace core drawing-to-scale practice.

## Visual aids
- **REQUIRED for drawing and spatial-interpretation items**: show the object or supplied views, labelled viewing-direction arrows, the relevant horizontal/vertical projection plane where needed, and a square grid or ruled drawing area of controlled physical size.
- For scale-drawing items, specify the scale and enough actual dimensions to construct the answer. The renderer must preserve the intended print dimensions; otherwise use grid units rather than asking the learner to measure the displayed image.
- Construction lines should be thin and distinguishable from final outlines. Views that are intended to align must share a consistent grid spacing and origin.
- Hidden edges are not governed by one universal rule in this chapter. Show or omit hidden lines exactly as required by the target textbook, assessment specification, or explicit question instruction. If dashed hidden lines are required, define that convention in the item and include only edges that the selected projection actually hides; do not treat every internal height change as a hidden edge.
- A text-equivalent model must record the solid, projection plane, projection direction, scale, dimensions, and expected line segments.

## Generator notes
- Represent geometry independently of its rendered perspective image. Store vertices, edges/faces, dimensions, projection planes, projection directions, and scale; derive every orthogonal view from that shared model.
- A height map remains a useful optional internal model for contiguous vertical stacks of unit cubes. It is insufficient for overhangs, cavities, non-cubical components, or arbitrary hidden geometry; use an explicit 3D occupancy/solid model for those cases.
- For an axis-aligned cube-stack model, derive the plan from occupied footprint cells and each elevation from the maximum visible height along the relevant projection direction. Validate the result against the explicit edge model when hidden-line information is assessed.
- Label every viewing arrow unambiguously. Front and side are relative to the specified direction, not intrinsic properties of the object.
- For a scale `1:n`, drawing length is `actual length / n` after units are made consistent. Generate the mathematical dimensions first, then the scaled coordinates; reject instances that do not fit the drawing area or lead to impractically small features.
- Validate that corresponding widths, depths, heights, and feature positions agree across all supplied views. Also check line types, label collisions, grid alignment, unit conversions, and uniqueness of any requested numerical or matching answer.
- Do not describe an item type as guaranteed or assign it to an SPM paper section without a dated assessment specification or paper-corpus analysis.
- Cross-links: Form 2 Ch6 for three-dimensional solids and Form 3 Ch4 for scale drawing. Tag reconstruction combinatorics as enrichment rather than core chapter coverage.
