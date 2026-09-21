# Form 4, Chapter 9: Probability of Combined Events

## Overview
Probability of combined events: combined experiments, dependent and independent events, mutually exclusive and non-mutually exclusive events, and combinations of two or more events. Students make conjectures about probability rules, verify them by enumerating sample spaces or using representations, and then apply the verified rules. Tables and tree diagrams support exact calculation, including “at least one” by complement.

Do not describe a question type as guaranteed or assign it to an SPM paper section unless this is supported by a dated assessment specification or paper corpus.

## Prerequisites
Form 2 Ch13 (single-event probability and complement); Form 1 Ch11 (sets); fraction arithmetic.

## Scope metadata

- `scope: core` — all content below unless explicitly labelled otherwise.
- `scope: enrichment` — expected-frequency questions and nonlinear reverse-count problems. These must not be used as prerequisites for, or harder variants of, core questions.

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 9.1 | Combined events and event relationships | Combined events involving two or more experiments/selections; dependent vs independent events; mutually exclusive vs non-mutually exclusive events; distinguish the two classifications; represent outcomes with ordered lists, tables and tree diagrams. | Independent means the occurrence of one event does not change the probability of the other; mutually exclusive means `A∩B=∅`. Neither property implies the other. | Classify event pairs and justify the classification; list a sample space; complete a two-stage or multi-stage tree/table; give or analyse counterexamples. |
| 9.2 | Conjecturing and verifying probability rules | Use complete sample spaces, frequencies, tables, tree diagrams or set regions to make conjectures about “and” and “or” rules, then verify the conjectures for the stated events. Include independent, dependent, mutually exclusive, overlapping and containment cases. | General addition rule: `P(A∪B)=P(A)+P(B)−P(A∩B)`; if mutually exclusive, `P(A∩B)=0`, so `P(A∪B)=P(A)+P(B)`; if `B⊆A`, then `A∩B=B` and `A∪B=A`; for independent events, `P(A∩B)=P(A)P(B)`. | Tabulate outcomes and compare counts with a proposed formula; verify a rule numerically; identify the condition under which a simplified rule is valid; use a Venn diagram to explain the subtraction of the overlap. |
| 9.3 | Probability of combined events | Calculate probabilities by enumeration and by verified addition/product rules; adjust successive branch probabilities in dependent experiments such as sampling without replacement; use complements for “at least one”; calculate combinations of more than two events, not merely recognise their trees. | Along a tree path, multiply successive branch probabilities; for disjoint paths describing the required event, add their products; `P(A')=1−P(A)`; `P(at least one)=1−P(none)`. For more than two events, enumerate all relevant disjoint paths and retain the dependence/independence assumptions at every stage. | With/without-replacement selections; dice, coins and spinner experiments; exactly/at least/at most questions; three-or-more-event trees and path calculations; non-exclusive “or” questions; containment questions. |
| 9.4 | Extension applications | Expected occurrences over repeated trials; infer an unknown item count from a given multi-draw probability when solving produces a nonlinear equation or requires systematic trial. | Expected frequency `=N×p` only for a clearly defined, stable repeated-trial model; validate reverse problems by substituting the candidate count into the original probability. | `scope: enrichment` expected-frequency tasks; `scope: enrichment` nonlinear reverse-count tasks. |

## Conjecture and verification sequence

Core items should sometimes assess the investigation, not only ask students to quote a finished formula.

1. Define the experiment, sample space and events precisely.
2. Enumerate or represent every equally likely outcome, or give valid branch probabilities.
3. Calculate `P(A)`, `P(B)`, `P(A∩B)` and/or `P(A∪B)` directly from the representation.
4. Form a conjecture relating those values.
5. Verify the conjecture with the representation and state the condition under which it holds.

Suitable investigations include:

- Use an overlapping pair to discover why `P(A∩B)` must be subtracted in the general addition rule.
- Use a mutually exclusive pair to verify the special case `P(A∪B)=P(A)+P(B)`.
- Use events from two independent trials to verify `P(A∩B)=P(A)P(B)`.
- Use draws without replacement to show that unchanged multiplication of the initial probabilities does not apply; branch probabilities must be updated.
- Use `B⊆A` to verify `A∩B=B` and `A∪B=A`, both from a set representation and from probability values.

Checking one numerical example verifies the stated instance and provides evidence for the conjecture; do not present it as a general proof unless a general argument is also supplied.

## Distinguishing mutually exclusive and independent events

The generator must never use the terms interchangeably. Include deliberate counterexamples such as:

- **Mutually exclusive but not independent:** on one fair die roll, `A={1}` and `B={2}`. Then `P(A∩B)=0`, while `P(A)P(B)=1/36`, so the events are not independent.
- **Independent but not mutually exclusive:** on two fair coin tosses, `A` is “the first toss is H” and `B` is “the second toss is H”. Then `P(A∩B)=1/4=P(A)P(B)`, but `A∩B={HH}` is not empty.
- **Neither:** on one fair die roll, `A={1,2,3}` and `B={3,4}`. They overlap, and `P(A∩B)=1/6≠P(A)P(B)`.

Two events of positive probability cannot be both mutually exclusive and independent. A pair can have both properties only in a degenerate case where at least one event has probability zero; do not use that edge case unless it is explained.

## Difficulty strategies

### 9.1

- **Easy**: classify clearly described with/without-replacement situations; identify mutually exclusive pairs from a small sample space.
- **Medium**: list the sample space of a two-stage experiment as ordered pairs; classify a pair independently on both axes (exclusive/non-exclusive and independent/dependent) and justify each answer.
- **Hard**: analyse non-obvious dependence; choose or construct a counterexample showing that mutually exclusive does not mean independent; distinguish “neither” from the probability-zero edge case in which both properties can hold.

### 9.2

- **Easy**: use a completed outcome table to calculate `P(A)`, `P(B)` and `P(A∩B)`, then verify a stated rule.
- **Medium**: make and verify the general addition-rule conjecture from overlapping events; investigate a containment case with `B⊆A` and explicitly conclude `A∩B=B` and `A∪B=A`.
- **Hard**: compare two sample spaces to determine which assumptions allow a simplified rule; find and correct an invalid conjecture such as “multiply for every ‘and’ question” or “add for every ‘or’ question.”

### 9.3

- **Easy**: two-coin or two-dice enumeration with a full table; one direct independent or mutually exclusive calculation.
- **Medium**: calculate two draws without replacement; complete and use a tree diagram; calculate an overlapping “or” probability by inclusion-exclusion; use a complement for “at least one.”
- **Hard**: calculate probabilities involving more than two events, including three-stage dependent or independent experiments; identify and sum several disjoint tree paths; combine “at least one” with changing branch probabilities; solve a multi-event context without a pre-drawn representation.
- **Enrichment only**: expected frequency over `N` repetitions; reverse problems such as finding `x` from `x(x−1)/((x+n)(x+n−1))`. Tag each item `scope: enrichment`, choose a small valid integer first, and verify uniqueness in the allowed domain.

Common distractors may reflect multiplying unchanged probabilities without replacement, adding probabilities for “and,” using the mutually exclusive addition rule for overlapping events, forgetting an ordered path such as `(B,R)`, or treating “at least one” as “exactly one.” Do not use a merely unreduced but equivalent fraction as a distractor unless the question explicitly requires simplest form.

## More-than-two-event generation

Combinations of more than two events are core and must include calculation. Suitable generators include three draws from a bag, three tosses, multiple spins, or a mixture of small experiments.

- Keep the complete tree manageable, normally two or three branches per stage and three or four stages.
- State whether replacement occurs after every draw and whether selections are ordered.
- Update both numerators and denominators after each draw without replacement.
- Define the required event before selecting paths, then verify that the selected paths are mutually exclusive and exhaustive for that event.
- For “exactly `r` successes,” include every valid ordering; for “at least one,” compare direct path addition with the complement method where feasible.
- Independently enumerate the finite sample space to validate the tree answer whenever practical.

## Visual aids

- **RECOMMENDED** — tree diagrams and two-way sample-space tables for Medium/Hard items. Three-or-more-stage trees must remain legible at the intended print size.
- **RECOMMENDED** — Venn diagrams for overlapping, mutually exclusive and containment cases; the internal set model must ensure that a displayed `B⊆A` diagram agrees with `A∩B=B`.
- **RECOMMENDED** — spinner diagrams when spinner probabilities depend on sector areas. Generate the sector model and probability values from the same source data.

All visuals need semantic outcome/branch data, readable labels, collision checks, alt text or a text-equivalent model, and validation against the answer key.

## Generator notes

- Keep outcome counts manageable: dice (up to a 36-cell two-dice table), coins, balls in boxes, and spinners with a small number of labelled sectors.
- Generate the mathematical model first, solve it independently, and only then render wording, diagrams and options.
- State all assumptions that affect dependence: replacement, ordering, equal likelihood, spinner geometry, and whether the composition changes between stages.
- Check that probabilities lie in `[0,1]`, branch probabilities from a node sum to `1`, terminal paths are complete, and favourable outcomes are neither omitted nor duplicated.
- Fraction arithmetic must be exact; where simplest form is required, reduce the final answer and validate accepted equivalent forms.
- For core reverse tasks, keep any unknown relationship linear or directly enumerable. Tag nonlinear reverse-count problems `scope: enrichment`; pick the integer solution first, compute the probability, and reject instances with another allowed solution.
- Expected-frequency items are `scope: enrichment`. State the stable repeated-trial model and distinguish an expectation from a guaranteed observed count.
- Cross-link: Form 2 Ch13 (single-event probability); Form 4 Ch4 (sets and inclusion-exclusion).
