# Form 5, Chapter 5: Congruency, Enlargement and Combined Transformations

## Overview
Completes the transformations line from Form 2 Ch11: congruency criteria and proofs-lite, similarity as the bridge to enlargement, enlargement (scale factor `k`, centre, area of image = `k² × area of object`), combined transformations, and tessellation. Combined-transformation work includes two successive transformations, describing both, single-transformation equivalents where applicable, invariant points, and investigation of whether pairs of transformations commute.

## Prerequisites
Form 2 Ch11 (isometric transformations); Form 1 Ch4 ratio; area (Form 1 Ch10).

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 5.1 | Congruency | Congruent figures (same shape and size); exploration of triangle data SSS, SAS, ASA, AAS, AAA and SSA; SSS, SAS, ASA and AAS as sufficient congruency criteria; AAA and SSA as insufficient in general; RHS as a derived/special right-triangle criterion rather than a replacement for AAS; identify congruent pairs; prove/deduce unknown sides/angles using congruency; properties of quadrilaterals via congruent triangles recognition. | SSS, SAS, ASA, AAS; RHS for right triangles. | Identify congruent triangles and state a sufficient criterion; construct or compare triangles to test whether given information determines congruence; explain why AAA/SSA is insufficient; find unknown side/angle from congruence; deduce properties (kite diagonals). |
| 5.2 | Similarity and enlargement | Compare congruency and similarity; recognise that corresponding lengths in similar figures have a common ratio; connect that ratio to enlargement scale factor. Enlargement with scale factor `k` (`k > 1` enlargement, `0 < k < 1` reduction, `k < 0` image on the opposite side of the centre) about a centre (origin or other point); find image coordinates; find `k` and centre from object/image; area of image = `k² × area of object`; area problems; combine with ratio. | `image point = centre + k(point − centre)`; `A′ = k²A`; area data alone give only `|k| = √(A′/A)`. | Compare similar and congruent figures; draw/find image under enlargement; state `k` and centre; area computations; find `|k|` from areas and determine the sign only when geometric position/orientation information is also supplied. |
| 5.3 | Combined transformations | Image under two successive transformations (including enlargement); explicit per-item definition of notation and order; describe both transformations given object, intermediate and final images; single equivalent transformation where applicable; invariant points; investigate commutativity by comparing both orders; full-description answers (type + all parameters: vector / line / centre+angle / centre+`k`). | Composition; full parameter description; in general `T₂∘T₁ ≠ T₁∘T₂`, although some specified pairs commute. | Find final coordinates; describe `T₁` then `T₂` fully; compare the images obtained in both orders; determine whether a given pair commutes; determine a single equivalent transformation where one exists; identify invariant points. |
| 5.4 | Tessellation | Meaning of tessellation: repeated shapes cover a plane without gaps or overlaps; identify tessellations; relate a repeating design to translations, rotations and reflections; construct a tessellation and explain the construction steps; create and present an Escher-style tessellation or project design. | Exact edge matching; repeated use of isometric transformations; no gaps or overlaps. | Decide whether a pattern tessellates and justify; name the isometric transformation relating adjacent tiles; complete or construct a tessellation from a fundamental tile; document the steps and transformation rules in a design project. |

## Difficulty strategies

### 5.1 Congruency
- **Easy**: pick congruent pairs from figures; state corresponding parts.
- **Medium**: choose SSS, SAS, ASA or AAS to justify congruence of a drawn pair; find an unknown side via correspondence (order of vertices matters: `ΔABC ≡ ΔPQR ⇒ AB = PQ`); use RHS in a clearly identified right-triangle case.
- **Hard**: prove-lite deductions (show a diagonal splits a parallelogram into congruent triangles using SAS/SSS); find angles requiring congruence and angle chasing; investigate data sets by constructing or comparing triangles, including counterexamples for AAA and ambiguous SSA.
- Distractors: AAA assumed sufficient for congruence (it establishes similarity only); SSA assumed sufficient; RHS used without a right angle or without identifying the hypotenuse; AAS omitted or confused with ASA; correspondence mismatch.

### 5.2 Enlargement
- **Easy**: image of a point under enlargement, centre origin, k = 2 or 3.
- **Medium**: centre not origin (compute centre + k·offset); k = ½ (reduction); find k from a drawn pair.
- **Hard**: find centre from object/image (lines through corresponding vertices meet at centre); area relations (image area 45, object area 5 ⇒ `|k| = 3`); shaded-region area between object and image (`A′ − A = (k² − 1)A`); use a diagram or corresponding-point positions to distinguish `k = 3` from `k = −3`; combine with coordinates (find image vertices then perimeter/area by shoelace-free methods).
- Distractors: `k` computed as `A′/A` instead of finding `|k| = √(A′/A)`; assigning a positive or negative sign from area data alone; centre assumed origin; reduction `k` written as 2 instead of ½; applying `k²` to lengths.

### 5.3 Combined
- **Easy**: two translations / translation + reflection — final coordinates.
- **Medium**: reflection then rotation; enlargement then translation; describe each transformation given three labelled shapes on a grid; apply the same two transformations in both orders and compare results.
- **Hard**: given object and final image only, with the intermediate unknown — propose a valid pair (open-ended, check validity); single-equivalent questions (two reflections in parallel lines ⇒ translation by twice the gap — recognition); invariant point of a combination; determine, with evidence, whether a specified pair commutes. A three-shape item may define `A → B` under transformation `P` and `B → C` under transformation `Q`, then ask for full descriptions and an equivalent transformation where applicable.
- Distractors: composition order reversed; incomplete description (reflection without stating the line; enlargement without centre); claiming a single rotation equals reflection+rotation where it doesn't.

### 5.4 Tessellation
- **Easy**: identify whether a given repeated pattern covers the plane without gaps or overlaps; locate a fundamental tile.
- **Medium**: complete a tessellation on a grid; describe the translation, rotation or reflection mapping one tile to an adjacent tile; order given construction steps.
- **Hard**: construct an Escher-style tile by altering paired edges consistently, tessellate it using stated isometries, and explain why the copies fit; analyse a design that uses more than one isometry.
- Distractors: a visually repeating pattern with small gaps or overlaps; using enlargement, which changes tile size, as the repeating isometry; an edge modification not transferred consistently to its paired edge.

## Visual aids
- **REQUIRED** for spatial items — Cartesian grid SVGs with object and image(s) drawn (solid/dashed + labels `P`, `P′`, `P″`). Enlargement diagrams should optionally show rays from the centre through corresponding vertices. Congruency questions need labelled triangle pairs with accurate tick/angle marks. Tessellation visuals need a clearly identifiable fundamental tile and enough repeated copies to verify edge matching, gaps and overlaps.

## Generator notes
- Keep all coordinates integer and images on-grid; restrict k ∈ {±2, ±3, ±½, ±⅓} for clean arithmetic.
- Generate combined-transformation questions by applying two known transformations, then present object/intermediate/final appropriately; compute the answer by replaying the composition. Define the order in the wording of every item (for example, "apply `P` first, then `Q`"); if symbolic composition notation is used, define it within that item.
- For commutativity investigations, compute both orders independently from the same object. Accept "commute" only when the two final images coincide for the intended transformation maps, not merely for one accidentally invariant test point.
- Area questions: choose object area so `k²A` is clean; shaded-region problems: `(k² − 1) × A`. From areas alone, calculate only `|k|`; require corresponding-point or orientation/position data before asking for the sign of `k`.
- Generate tessellations from a validated fundamental tile and explicit isometries. Reject designs with gaps, overlaps, mismatched shared edges or a finite motif that does not extend periodically as claimed.
- Full-description marking checklist to encode: reflection → mirror line; rotation → centre, angle, direction; translation → vector; enlargement → centre, scale factor.
- Cross-link: Form 2 Ch11 (isometries, congruency and similarity); Form 1 Ch9 (triangle properties for congruence); Form 3 Ch4 (scale drawings — same `k` concept); Form 1 Ch10 area.
