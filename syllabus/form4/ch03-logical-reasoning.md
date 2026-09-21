# Form 4, Chapter 3: Logical Reasoning

## Overview
Formal logic: statements (true/false), negation, compound statements with "and"/"or", truth values, implications ("if p then q", "p if and only if q"), converse/inverse/contrapositive, arguments (premises → conclusion), and inductive vs deductive reasoning. It also includes judging whether a valid deductive argument is sound, judging the strength and cogency of an inductive argument, and forming a strong inductive argument. Non-computational; tests precise language, evidence, premise truth, and logical structure.

## Prerequisites
Basic set language (Form 1 Ch11 helpful); general mathematics vocabulary.

## Topic & subtopic breakdown

| # | Subtopic | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 3.1 | Statements | Identify statements vs non-statements (questions, commands, exclamations); determine truth value; negate a statement, including quantified statements over a stated domain; compound statements with "and" (both must be true) and inclusive "or" (at least one); truth value of compounds; construct compound statements; complete truth tables for the core two-statement forms. | ¬p; p ∧ q true iff both; p ∨ q false iff both false; ¬(∀x∈D, P(x)) ≡ ∃x∈D such that ¬P(x); ¬(∃x∈D, P(x)) ≡ ∀x∈D, ¬P(x). | Is this a statement?; negate "all multiples of 4 are even" within a given domain; truth value of p and q given p, q; fill a two-component truth table. |
| 3.2 | Arguments | Implication "if p, then q"; converse (if q then p), inverse (if ¬p then ¬q), contrapositive (if ¬q then ¬p); truth of each; "if and only if" (biconditional); arguments: premises and conclusion; prescribed valid deductive forms; distinguish validity from soundness and check the truth of every premise; identify inductive vs deductive reasoning; determine whether an inductive argument is weak or strong and whether it is cogent; complete a valid conclusion; make and support inductive conjectures; form a strong inductive argument from true, relevant, sufficient, and reasonably representative premises. | Contrapositive equivalent to original; sound deductive argument = valid form + all premises true; cogent inductive argument = strong inference + all premises true. | Write converse/inverse/contrapositive; test premise truth and structure; determine validity/soundness; classify reasoning type; assess strength/cogency; improve or form an inductive argument; make a suitably qualified conjecture from evidence. |

## Difficulty strategies

### 3.1 Statements & compounds
- **Easy**: classify sentences as statements; negate a simple statement (no quantifier).
- **Medium**: quantifier negation over an explicitly stated domain ("All birds in set D can fly" → "At least one bird in D cannot fly" — the trap is "No birds in D can fly"); truth value of "p and q"/"p or q" given p, q; build a compound statement from components.
- **Hard (core)**: determine possible component truth values from a compound's known truth value (reverse); distinguish inclusive uses of "or"; combine quantifier negation with a mathematical domain whose members and predicates are unambiguous.
- **Enrichment**: three-variable or nested truth tables such as `(p or q) and ¬r`. Do not use these as evidence of core mastery unless the target assessment specification explicitly includes them.
- Distractors: wrong quantifier negation; "or" treated as exclusive; negating only part of a compound.

### 3.2 Arguments
- **Easy**: write converse of a given implication.
- **Medium**: write all three derived implications and give truth values (converse/inverse not equivalent — key insight); supply the conclusion for a prescribed valid form ("If it rains, the field is closed. It rains. ⇒ …"); distinguish a valid argument with a false premise from a sound argument.
- **Hard**: determine validity and then independently check every premise to determine soundness; compare inductive arguments for strength; determine cogency by combining strength with premise truth; form or revise an inductive argument so that its evidence is true, relevant, sufficiently numerous, and reasonably representative; split a biconditional into two implications; make a qualified inductive conjecture from a number pattern (e.g. sums of the first `n` odd numbers suggest `n²`) linked to Form 2 Ch1; provide a counterexample to disprove a converse.
- **Enrichment terminology**: Latin names such as *modus ponens* and *modus tollens*. Core questions should present and recognise the prescribed argument forms directly; knowledge of the Latin labels must not be required unless an external assessment specification explicitly requires it.
- Distractors: affirming the consequent treated as valid; inverse assumed equivalent to original; a valid argument automatically called sound; a strong argument with a false premise called cogent; a true conclusion used as proof of validity; inductive conclusion treated as certain.

## Argument-quality checks

Evaluate deductive and inductive arguments with separate checks:

1. **Deductive validity**: Ask whether the conclusion follows necessarily from the premises because the argument has a valid form. Do not decide validity merely from whether the conclusion happens to be true.
2. **Deductive soundness**: Only after confirming validity, verify each premise against the stated facts or mathematical domain. The argument is sound exactly when it is valid and every premise is true.
3. **Inductive strength**: Ask whether the premises make the conclusion probable rather than certain. Judge the relevance, amount, variety, and representativeness of the evidence, and whether counterexamples or biased sampling weaken the inference.
4. **Inductive cogency**: The argument is cogent exactly when it is strong and all its premises are true. A strong inference based on a false statistic is not cogent.
5. **Forming a strong argument**: Supply true premises, enough relevant and representative cases, and a conclusion whose certainty is no stronger than the evidence permits (for example, "probably" or "the pattern suggests"). Do not present finite pattern checking as a deductive proof for all cases.

## Visual aids
- **NONE** mostly — text-based chapter.
- **OPTIONAL** — truth tables (rendered as tables), simple Venn diagram to illustrate "all A are B" (set inclusion helps implication intuition).

## Generator notes
- Use mathematical content for p and q (keeps truth values objective): "x is divisible by 4", "n is prime", "a triangle has 4 sides".
- Every quantified statement must declare or inherit a clear nonempty domain `D` (for example, integers, positive integers, or members of a displayed set). Store the domain in item metadata and use the same domain in the statement, its negation, the answer, and every distractor. Reject items whose truth value changes under plausible alternative domains.
- For quantifier negation items, generate from domain-aware templates: `All x in D satisfy P` ↔ negation `At least one x in D does not satisfy P`; `Some x in D satisfy P` ↔ negation `No x in D satisfies P`; `No x in D satisfies P` ↔ negation `At least one x in D satisfies P`. Here "some" means at least one, not necessarily more than one.
- Validity questions: include exactly one invalid form (affirming consequent or denying antecedent) among options.
- Soundness questions: validate the logical form and the truth value of each premise separately; ensure the intended domain supplies a determinate truth value. Include valid-but-unsound and invalid-with-a-true-conclusion cases so that truth is not confused with validity.
- Inductive-strength/cogency questions: state the evidence source and sample, make premise truth checkable from the supplied information, and control sample size and representativeness. Do not rely on unverifiable claims such as "most students" or changing real-world facts unless a dated data source is supplied.
- Forming-argument tasks: provide enough observations or data to support a genuinely strong inference, accept appropriately qualified equivalent conclusions, and reject universal certainty inferred only from finite cases.
- Induction conjectures: pick patterns with clean closed forms (odd sums `n²`, triangular numbers `n(n+1)/2`) but distinguish evidence for a conjecture from proof.
- Keep two-statement truth tables and prescribed unnamed argument forms in core. Tag three-variable/nested truth tables and required use of Latin form names as `scope: enrichment`.
- Cross-link: Form 1 Ch11 sets; Form 2 Ch1 patterns (inductive reasoning); Form 4 Ch4 sets (Venn-based implication visuals).
