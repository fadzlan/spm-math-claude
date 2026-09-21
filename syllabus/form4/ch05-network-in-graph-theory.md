# Form 4, Chapter 5: Network in Graph Theory

## Overview
Introduction to graphs and networks as representations of real information. Core work includes vertices, edges and degree; simple graphs, loops and multiple edges; directed/undirected and weighted/unweighted graphs; subgraphs and trees; translating between a situation and a network; comparing transport networks with one another and with conventional maps; and solving small optimal-cost problems. Here, **cost** is determined by the context and may mean time, distance or monetary expense. Formal graph-theory theorems and named optimisation algorithms are enrichment, not default Form 4 assessment content.

## Prerequisites
Basic diagram and table literacy; counting; addition and comparison of non-negative quantities; interpreting units such as km, minutes and RM.

## Scope labels

- **Core**: directly targeted in this chapter and suitable for ordinary Form 4 items.
- **Supporting prerequisite**: knowledge used to access the task but not the chapter's main target.
- **Enrichment**: mathematically valid extension that must be explicitly tagged and must not drive core question generation.

## Topic & subtopic breakdown

| # | Scope | Subtopic | Content coverage | Key skills | Typical question types |
|---|---|---|---|---|---|
| 5.1 | Core | Graphs and networks | Graph/network, vertex and edge; a network as a simplified representation of relationships or connections in real information. | Identify what vertices and edges represent; count vertices and edges; choose meaningful labels. | State what a vertex/edge represents; construct a network for roads, rail links, pipes, communication links or relationships; interpret a supplied network. |
| 5.2 | Core | Types and features of graphs | Degree of a vertex; simple graph; loops and multiple/parallel edges; directed and undirected graphs; weighted and unweighted graphs. | Read incidence correctly; distinguish graph types; interpret arrow direction and weight units. | Find a vertex degree from a diagram; identify a loop or multiple edge; decide whether direction or weights are needed for a stated situation. |
| 5.3 | Core | Subgraphs and trees | A subgraph uses selected vertices and/or edges of a graph; a tree is connected and has no cycles. | Recognise or form a subgraph; trace connections; recognise a tree from its defining features. | Select a subnetwork subject to a condition; identify whether a diagram is a tree and justify using connectivity and absence of cycles. |
| 5.4 | Core | Representing real information | Translate among descriptions, tables and graph diagrams; preserve direction, repeated connections, loops and weights where the context requires them. | Model a situation; recover information from a model; explain what detail is retained or omitted. | Draw a graph from route or connection data; complete a table from a graph; detect a graph that misrepresents the stated information. |
| 5.5 | Core | Transport networks and maps | Compare transport networks with one another and compare a network diagram with a conventional/geographical map. A network emphasises connectivity and route structure; a map emphasises physical position, shape, direction and scale. | Compare representations; select a representation for a purpose; state advantages, disadvantages and limitations. | Choose the clearer rail network; explain why a schematic network helps route planning but cannot reliably show actual distance unless weighted; explain why a map is better for geographical location or scale. |
| 5.6 | Core | Optimal cost | Compare feasible routes or small connection choices by inspection or enumeration. Cost may be travel time, distance or monetary expense, according to the weight label and question. | Add weights with units; compare alternatives; justify the optimum; recognise that the optimum can change when the meaning or weights change. | Find the least-time, shortest-distance or least-expense route; compare two proposed networks; choose links that meet a stated aim and verify all required places remain connected. |
| 5.E | Enrichment | Formal graph results and algorithms | Handshaking lemma; the convention that a loop contributes 2 to degree as a theorem target; connected/complete graph terminology and `K_n`; complete-graph edge formula; tree edge formula; graphical degree-sequence realisability; in-degree/out-degree theory; minimum spanning tree terminology/algorithms; Dijkstra's algorithm or “Dijkstra-lite”. | Explore and justify results beyond the prescribed core; apply a named algorithm only when the item is explicitly marked enrichment. | Enrichment exercise, mathematics-club investigation or later-study preview. Do not use these results as unstated shortcuts required to answer a core item. |

## Transport network versus map

| Representation | Advantages | Disadvantages / cautions | Appropriate uses |
|---|---|---|---|
| Schematic transport network | Makes stops, direct links, transfers and route structure easy to see; can display direction and route cost clearly; removes distracting geographical detail. | Positions and line lengths may be distorted; a short-looking edge is not necessarily a short journey; physical landmarks and true compass direction may be absent. | Identifying reachable stops, transfers, permitted directions, and an optimal route when meaningful weights are supplied. |
| Conventional/geographical map | Shows approximate or scaled physical position, direction, roads, landmarks and surrounding geography; can support spatial orientation. | Dense routes may be visually cluttered; connectivity and transfers may be harder to trace; a route's time or fare cannot be inferred from physical distance alone. | Locating places, estimating physical distance when a scale is supplied, and understanding real-world geography. |

When comparing two transport networks, give a purpose first. A network with fewer transfers may be preferable for convenience, while another may have lower fare, shorter distance or less travel time. Do not call a network “better” without a stated criterion.

## Difficulty strategies

- **Easy (core)**: identify vertices and edges and what they represent; count vertices/edges directly; find degree by inspection; identify a simple, directed, weighted or unweighted graph; recognise loops and multiple edges.
- **Medium (core)**: translate a short description or table into a graph; interpret a weighted/directed network; identify a subgraph or tree from definitions; compare a schematic transport network with a map and give one advantage and one disadvantage; total the cost of two or three candidate routes.
- **Hard (core)**: reconcile multiple representations; model a real situation and justify the selected graph type; compare transport networks under stated criteria; find an optimum by systematic enumeration on a small network and explain why alternatives cost more; reason about how the optimum changes when cost means time rather than distance or expense.
- **Enrichment only**: handshaking calculations, `K_n` and `n(n-1)/2`, `|E|=|V|-1`, degree-sequence construction/realisability, in-/out-degree tables, formal minimum spanning trees, or Dijkstra-style shortest-path steps. Difficulty must come from core reasoning, not from importing one of these results.
- Plausible distractors include treating a crossing as a vertex when it is not marked, ignoring arrow direction, reading drawn edge length as its weight, comparing unlike units, or minimising the number of edges rather than the stated total cost.

## Visual aids

- **Usually required** for tasks whose information is encoded in a network. Render labelled vertices and edges, curved edges or separated paths for multiple edges, loops, arrows for directed edges, and weight labels with units for weighted graphs.
- A table or precise verbal edge list can be the source representation when the task asks the student to draw a graph. A text-only comparison is also valid when all connections and costs are unambiguous.
- Mark explicitly whether line crossings are vertices. Avoid accidental overlaps between weights, arrowheads, vertices and edge labels.
- Schematic networks need not be drawn to geographical scale. Never let visual edge length imply distance, time or expense unless the question explicitly defines that encoding.
- Store semantic metadata: vertex labels and meanings, edge endpoints, direction, weight and unit, whether an edge is a loop/multiple edge, and intended alt text.

## Generator notes

- Generate the mathematical model first as a vertex set plus edge records; derive the diagram, table, wording and answer from that same model.
- For each edge record, store `source`, `target`, `directed`, `weight`, `unit` and any route/service label. Validate that the rendered representation preserves each field.
- Degree questions should be answerable by direct incidence counting. A loop may be counted consistently according to the adopted definition, but do not require the handshaking lemma or present its loop convention as a core theorem target.
- Real-information questions must define what each vertex and edge means. Include loops, parallel links, arrows or weights only when they make sense in the situation.
- For transport/map comparisons, state the user's purpose (for example, finding transfers, locating a station, or estimating physical distance). Accept logically equivalent advantages and disadvantages rather than one memorised sentence.
- For every weighted task, print the meaning and unit of the weights. Do not mix minutes, kilometres and RM in one total. If several criteria are present, state exactly which one is to be minimised.
- Core optimal-cost tasks should use small networks that can be solved transparently by listing or comparing feasible alternatives. Do not require students to know the terms “minimum spanning tree” or “Dijkstra's algorithm”.
- Check whether repeated vertices/edges are allowed in a route, enforce arrow direction, and specify the start and destination. Keep weights non-negative and ensure the requested optimum exists; ensure uniqueness when asking for “the route”, or ask for all optimal routes/the minimum value when ties are intended.
- A least-cost connecting-network problem must state which locations must remain connected and what choices are permitted. Validate connectivity and total cost independently; do not assume that the visually shortest set of edges is valid.
- Reject items in which a supposedly irrelevant layout reveals the answer, a crossing is ambiguous, labels collide, units are missing, or the graph and source information disagree.
- Tag all formal results and algorithms listed in 5.E as `scope: enrichment`; they must never appear by default in a core Form 4 item bank.

## Validation checklist

- Every vertex and edge has a defined contextual meaning.
- The diagram, table and prose encode the same vertices, edges, directions and weights.
- Loops, multiple edges, arrowheads and crossings are visually unambiguous.
- Weight meaning and unit are stated, and all totals compare like quantities.
- The claimed optimum has been checked against every permitted candidate (or independently by a solver).
- A transport-network/map comparison names a purpose and includes a genuine advantage or limitation.
- No enrichment theorem, formula, terminology or algorithm is needed to solve an item tagged `core`.

## Cross-links

- Form 4 Chapter 3: use definitions and conditions carefully when classifying a graph.
- Form 5 Chapter 8: a network can serve as a mathematical model, but formal optimisation methods remain enrichment unless separately prescribed.
