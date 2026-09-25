# Malay terms – decisions needed

While adding the worked solutions, the agents flagged Malay terms they were unsure of. Most of the text follows the
terms each file already used, but a few terms are **inconsistent between files**, so the same idea is named two ways
depending on which topic a student picks. This file lists them for your decision.

Counts are occurrences in `site/js/data/*.js` as of 2026-09-23. To apply a decision, tell me the term you want and I
will replace it everywhere in one pass (a text replacement, then `npm run check`).

## Decisions applied – 2026-09-25

Your answers to A1–A9 are applied in `site/js/data/*.js` (`npm run check`: 0 problems; browser test passes).

| # | Decision | Applied |
|---|---|---|
| A1 | **Betul / Salah** for true / false | every truth-value use of *benar* / *palsu* (prompts, answers, working) is now *betul* / *salah*. Left alone: *benar-benar* (really), *sebenar*, *nilai kebenaran* (truth value), and *palsu* meaning forged (*akaun / invois / maklumat / laporan palsu*, x5b and f5a tax evasion) |
| A2 | **sudut pedalaman sehala** | all 46 uses (corrected from *pendalaman* on your follow-up). It is now the same word as the polygon *sudut pedalaman* (interior angle), so the two rely on context |
| A3 | no "whisker" term; use *nilai minimum* / *nilai maksimum* | the words *sesungguk* and *misai* are gone from Malay, and "whisker" from English. Where a question compared whisker *lengths* (x4e skew / symmetry questions) it now says "the distance from the minimum to $Q_1$" and "from $Q_3$ to the maximum" (*jarak dari nilai minimum ke $Q_1$*…). Files: f4c, x4e, x5b |
| A4 | **contoh penyangkal** | *kaunter-contoh*, *contoh bertentang* replaced |
| A5 | **isi padu** | *isipadu* replaced |
| A6 | **digit sa** (units digit) | *digit sebut* (x1d, 2 uses) changed to *digit sa*. Your first answer suggested *digit pertama*; you then clarified that *digit sa* is correct, *digit pertama* means the first digit and *digit terakhir* the last, so nothing uses *digit pertama* |
| A7 | contextual – no change | *songsang* / *songsangan* left as they are |
| A8 | no term (withdrawn) | the curriculum has no "oblique projection" (it says *non-orthogonal / slanting projection*). The one x3d sentence now says "bukan unjuran ortogon" and neither *senget* nor *condong* is used |
| A9 | contextual | the tax-payable question now reads "selepas semua **cukai** dan rebat". The other three *jadual kadar* uses (a rebate definition, its example, "jadual kadar cukai yang diberikan") are the rate table itself, so I kept them; *jalur* (band) is unchanged |


**B – *mata peratusan*** (percentage points): kept, per your answer (4 uses, x1g and x5b). Also kept per your answer: *titik pusingan*, *sebutan pemalar*, *gelang*. Also kept per your answer: *titik pusingan*, *sebutan pemalar*, *gelang*.

**Section B decisions (2026-09-25):**

- Kept: *kurang diinsuranskan*, *penerima manfaat*, *pendaraban silang*, *antejadian / akibat*, *Bentuk II / III*, *ketaksamaan segi tiga*
  (you wrote *ketidaksamaan*; the data and the inequality chapter use *ketaksamaan*, so I left it), *kenaikan / jarak mengufuk*.
  Kept although not in the textbook: *salingan negatif*, *paksi terputus / pemutusan paksi*.
- Changed: *pengelakan haram* / *pengelakan cukai secara haram* → **pengelakan cukai** (x5b, f5a); *menyongsangkan tanda* →
  **menyongsangkan arah simbol ketaksamaan** (f1b, x1c; 19 uses); *tepi lurus tanpa tanda* → **alat tepi lurus sahaja** (x1e, 1 use).
- Tax avoidance stays **pengelakan cukai secara sah** (legal) and evasion is plain **pengelakan cukai**. I had renamed avoidance to
  *penghindaran cukai* on my own; that is reverted.
- *ketaksamaan segi tiga* is now **ketidaksamaan segi tiga**, as you wrote it (5 uses; f1d, x1e). The inequality chapter still says *ketaksamaan*.
- Section B/C, second round: kept *Kembang dan permudahkan*, *Pindahkan semua sebutan ke satu sisi*, *Baca baki dari bawah ke atas*,
  *Kuasa dua menghapuskan tanda*, *munasabah*, *baki*, *bucu*. Insurance excess *deduktibel* → **lebihan** (38 uses, f5a, x5b). Note
  *lebihan* also means "surplus" in the budgeting questions (f4c, x4d); the topic makes the meaning clear.
- Number-base column arithmetic (x4a, 19 uses): *lajur* → **tempat** (*tempat seterusnya* = next column, *tempat sebelum* = previous). The
  borrowing sentence is now *pinjam $1$, bernilai $b$, daripada tempat seterusnya*, and the working labels read *Tempat ke-1 (sa)*, *Tempat ke-2*…
  *Lajur* stays where it means a table column, matrix column (confirmed correct by the user) or column vector (x5a, x2f, x3d, etc.).

## A. Inconsistent – the same thing has two names

| # | Meaning | Option 1 | Option 2 | My suggestion |
|---|---|---|---|---|
| A1 | True / False (the word printed as the **answer**) | **Benar / Palsu** — 168 uses, 19 files | **Betul / Salah** — 29 uses, 7 files (x2a, x3a, x4e, x5a, x5b, x1c, x4c) | Benar / Palsu (already dominant; *betul* reads as "correct", which is what a marker says, not a truth value) |
| A2 | Co-interior (allied) angles | **sudut dalam sebelah** — 34 uses (f1b, x1e, x1f, f3b) | **sudut dalam sehala** — 1 use (x3c) | Whichever your textbook uses. Note KSSM books often write **sudut pedalaman sehala**; that exact phrase appears 0 times here, while "sudut pedalaman" (interior angle of a polygon) appears 271 times in another sense |
| A3 | Box-plot whisker | **sesungguk** — 17 uses (x4e) | **misai** — 4 uses (f4c, x5b) | *misai* (moustache) is the literal translation but reads oddly in an exam; needs your call |
| A4 | Counterexample | **contoh penyangkal** — 21 uses, 10 files | **kaunter-contoh** — 2 (x4f); **contoh bertentang** — 3 (f4a, x4b) | contoh penyangkal (dominant, and the usual KSSM term) |
| A5 | Volume | **isi padu** — 159 uses, 14 files | **isipadu** — 21 uses (x3a, x5d) | isi padu (two words, dominant; DBP spelling) |
| A6 | Units digit | **digit sa** — 8 uses (x2a, f1d, x1g, x4a) | **digit sebut** — 4 uses (x1d) | digit sa ("digit sebut" looks like a typo for "digit sa") |
| A7 | Inverse | **songsang** — 63 uses | **songsangan** — 37 uses | Both are correct Malay, but they are used for the same idea in different files. *songsang* as the adjective ("matriks songsang"), *songsangan* as the noun ("songsangan bagi …") would be consistent — confirm |
| A8 | Oblique projection | **unjuran senget** — 1 use (x3d) | **unjuran condong** — 0 uses | Only one instance; say which you prefer |
| A9 | Tax band | **jalur** — used in x5b working | **jadual kadar** (rate schedule) — 4 uses (x5b) | These are different things (a band vs the whole table), so both may be right; worth a glance |

## B. New terms the agents introduced (no conflict – do they read naturally?)

These were written for the worked solutions where the repo had no existing term. They are used consistently; the
question is only whether the wording is right for a Malaysian classroom.

- **"mata peratusan"** – percentage points (4 uses, x1g, x5b)
- **"titik pusingan"** – turning point of a graph (18 uses, x4a, x5d)
- **"sebutan pemalar"** – constant term (17 uses)
- **"paksi terputus" / "pemutusan paksi"** – truncated (broken) axis on a chart
- **"gelang antara dua bulatan"** – the ring/annulus between two circles (27 uses of "gelang")
- **"pengelakan haram"** – illegal tax evasion (3 uses, x5b); **"kurang diinsuranskan"** – underinsured (2)
- **"penerima manfaat"** – beneficiary (1 use, f5a)
- **"hasil darab silang" / "pendaraban silang"** – cross-multiplying (F1-4.3)
- **"Kembang dan permudahkan"** – "expand and simplify"
- **"Pindahkan semua sebutan ke satu sisi"** – "bring all terms to one side"
- **"Baca baki dari bawah ke atas"** – reading remainders bottom-up (number bases)
- **"pinjam $1$, bernilai $b$, daripada lajur seterusnya"** – borrowing in base-$b$ subtraction
- **"Kuasa dua menghapuskan tanda"** – "squaring removes the sign"
- **"antejadian" / "akibat"** – antecedent / consequent (logic, F4-3)
- **"Bentuk II" / "Bentuk III"** – the argument forms in F4-3 deductive reasoning
- **"ketaksamaan segi tiga"** – triangle inequality; **"tepi lurus tanpa tanda"** – unmarked straightedge
- **"salingan negatif"** – negative reciprocal; **"kenaikan" / "jarak mengufuk"** – rise / run
- **"menyongsangkan tanda"** – reversing the inequality sign when dividing by a negative

## C. Existing wording the agents questioned but did not change

- **"munasabah (sound/cogent)"** (59 uses) – the file translates *both* "sound" and "cogent" as *munasabah*.
  KSSM may use **meyakinkan** for cogent (0 uses here). They are different ideas in the logic chapter.
- **"baki"** (168 uses) – used both for a remainder (division) and for a residual (F5-8.6 modelling). Correct in
  both, but a student may read the modelling one as "remainder".
- **"bucu"** (836 uses) – vertex, used for polygons, solids, graphs and the vertex of a feasible region. Consistent.
- **"deduktibel"** (34 uses, insurance excess) – an English loan; **"lebihan"** is the DBP term.

## Already fixed (no decision needed)

- **"cenuk" → "cenuram"** (cliff) – "cenuk" is not a Malay word; 7 occurrences in f3a, f1b, x1e.
- **"wakaf" → "lelayang"** (kite, the shape) – a *wakaf* is a roadside hut; was in an x1e shape table.
- **"at most half"** was translated as *sekurang-kurangnya separuh* ("at least half") in x5d – reversed the meaning.
- **"Cargo mengubah digit…"** in f3a – a mistranslation of "A carry changes the digit…". *Cargo* is the English word for freight; it is now
  *Pembundaran ke atas membawa nilai kepada digit di hadapan* (EN: "Rounding up carries into the digits in front"), and
  *membawa nilai* is also used for the same idea in x3a (5 uses). For a column-addition carry (number bases, x4a) the word is *bawa* / *bawaan*.

## Form / Chapter / Topic locations


For each complaint, the locations below identify the source files cited in the entry and the topics those files extend. Topic numbers use the project syllabus.


- **A1:**
  - Form 1
    - Chapter 5
      - Topic 5.1: 5.1 Forming expressions
      - Topic 5.2: 5.2 Simplifying and evaluating
    - Chapter 7
      - Topic 7.1: 7.1
      - Topic 7.2: 7.2
    - Chapter 11
      - Topic 11.1: 11.1 Sets
      - Topic 11.2: 11.2 Universal set and complement
      - Topic 11.3: 11.3 Subsets
      - Topic 11.4: 11.4 Venn representations
  - Form 2
    - Chapter 1
      - Topic 1.1: 1.1 Patterns
      - Topic 1.2: 1.2 Sequences
      - Topic 1.3: 1.3 nth term & applications
      - Topic 1.E: Topic 1.E
    - Chapter 2
      - Topic 2.1: 2.1 Expansion
      - Topic 2.2: 2.2 Factorisation
      - Topic 2.3: 2.3 Algebraic expressions and algebraic fractions
  - Form 3
    - Chapter 1
      - Topic 1.1: 1.1
      - Topic 1.2: 1.2 Laws
      - Topic 1.3: 1.3 Index equations
    - Chapter 2
      - Topic 2.1: 2.1 Significant figures
      - Topic 2.2: 2.2 Standard form
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
  - Form 4
    - Chapter 5
      - Topic 5.1: Topic 5.1
      - Topic 5.2: Topic 5.2
      - Topic 5.3: Topic 5.3
      - Topic 5.4: Topic 5.4
      - Topic 5.5: Topic 5.5
      - Topic 5.6: Topic 5.6
      - Topic 5.E: Topic 5.E
    - Chapter 8
      - Topic 8.1.1: Topic 8.1.1
      - Topic 8.1.2: Topic 8.1.2
      - Topic 8.2.1: Topic 8.2.1
      - Topic 8.2.2: Topic 8.2.2
      - Topic 8.2.3: Topic 8.2.3
      - Topic 8.2.4: Topic 8.2.4
      - Topic 8.2.5: Topic 8.2.5
  - Form 5
    - Chapter 1
      - Topic 1.1: 1.1 Direct
      - Topic 1.2: 1.2 Inverse
      - Topic 1.3: 1.3 Joint/combined
    - Chapter 2
      - Topic 2.1: 2.1
      - Topic 2.2: 2.2
      - Topic 2.3: 2.3
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
    - Chapter 4
      - Topic 4.1: Topic 4.1
      - Topic 4.1E: Topic 4.1E
    - Chapter 7
      - Topic 7.1: 7.1
      - Topic 7.2: 7.2 Ogives and box plots
      - Topic 7.3: 7.3 Histograms & polygons
      - Topic 7.4: 7.4 Statistical mini-project

- **A2:**
  - Form 1
    - Chapter 8
      - Topic 8.1: 8.1 Lines, segments and angles
      - Topic 8.2: 8.2 Intersecting lines
      - Topic 8.3: 8.3 Parallel lines
      - Topic 8.4: 8.4 Elevation and depression
      - Topic 8.5: 8.5 Constructions
    - Chapter 9
      - Topic 9.1: 9.1
      - Topic 9.1S: Topic 9.1S
      - Topic 9.2: 9.2 Triangles
      - Topic 9.3: 9.3 Quadrilaterals
    - Chapter 10
      - Topic 10.1: 10.1 Perimeter
      - Topic 10.2: 10.2 Areas
      - Topic 10.3: 10.3 P vs A relationship
      - Topic 10.4: 10.4 Composite figures
    - Chapter 13
      - Topic 13.1: 13.1
      - Topic 13.2: 13.2 Converse
  - Form 3
    - Chapter 6
      - Topic 6.1: 6.1
      - Topic 6.2: 6.2
      - Topic 6.3: 6.3
      - Topic 6.4: 6.4
    - Chapter 8
      - Topic 8.1: 8.1
      - Topic 8.2: 8.2

- **A3:**
  - Form 4
    - Chapter 8
      - Topic 8.1.1: Topic 8.1.1
      - Topic 8.1.2: Topic 8.1.2
      - Topic 8.2.1: Topic 8.2.1
      - Topic 8.2.2: Topic 8.2.2
      - Topic 8.2.3: Topic 8.2.3
      - Topic 8.2.4: Topic 8.2.4
      - Topic 8.2.5: Topic 8.2.5
  - Form 5
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
    - Chapter 4
      - Topic 4.1: Topic 4.1
      - Topic 4.1E: Topic 4.1E
    - Chapter 7
      - Topic 7.1: 7.1
      - Topic 7.2: 7.2 Ogives and box plots
      - Topic 7.3: 7.3 Histograms & polygons
      - Topic 7.4: 7.4 Statistical mini-project

- **A4:**
  - Form 4
    - Chapter 3
      - Topic 3.1: 3.1 Statements & compounds
      - Topic 3.2: 3.2 Arguments
    - Chapter 4
      - Topic 4.1: 4.1–4.2 Intersection/Union
      - Topic 4.2: Topic 4.2
      - Topic 4.3: 4.3 Combined operations & problem solving
    - Chapter 9
      - Topic 9.1: 9.1
      - Topic 9.2: 9.2
      - Topic 9.3: 9.3
      - Topic 9.4: Topic 9.4

- **A5:**
  - Form 3
    - Chapter 1
      - Topic 1.1: 1.1
      - Topic 1.2: 1.2 Laws
      - Topic 1.3: 1.3 Index equations
    - Chapter 2
      - Topic 2.1: 2.1 Significant figures
      - Topic 2.2: 2.2 Standard form
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
  - Form 5
    - Chapter 8
      - Topic 8.1: Topic 8.1
      - Topic 8.2: Topic 8.2
      - Topic 8.3: Topic 8.3
      - Topic 8.4: Topic 8.4
      - Topic 8.5: Topic 8.5
      - Topic 8.6: Topic 8.6

- **A6:**
  - Form 1
    - Chapter 6
      - Topic 6.1: 6.1 Equations and equality
      - Topic 6.2: 6.2 Solving equations in one variable
      - Topic 6.3: 6.3 Equations and ordered pairs in two variables
      - Topic 6.4: 6.4 Graphs
      - Topic 6.5: 6.5-6.6 Simultaneous equations and solution methods
      - Topic 6.6: Topic 6.6
      - Topic 6.7: 6.7 Contextual problems
    - Chapter 12
      - Topic 12.1: 12.1 Statistical inquiry
      - Topic 12.2: 12.2–12.3 Representation and conversion
      - Topic 12.3: Topic 12.3
      - Topic 12.4: 12.4 Interpretation, inference and prediction
      - Topic 12.5: 12.5 Ethical representation
  - Form 2
    - Chapter 1
      - Topic 1.1: 1.1 Patterns
      - Topic 1.2: 1.2 Sequences
      - Topic 1.3: 1.3 nth term & applications
      - Topic 1.E: Topic 1.E
    - Chapter 2
      - Topic 2.1: 2.1 Expansion
      - Topic 2.2: 2.2 Factorisation
      - Topic 2.3: 2.3 Algebraic expressions and algebraic fractions
  - Form 4
    - Chapter 1
      - Topic 1.1: Topic 1.1
      - Topic 1.2: Topic 1.2
      - Topic 1.3: Topic 1.3
      - Topic 1.4: Topic 1.4
      - Topic 1.5: Topic 1.5
      - Topic 1.6: Topic 1.6
    - Chapter 2
      - Topic 2.1: Topic 2.1
      - Topic 2.1E: Topic 2.1E

- **A8:**
  - Form 3
    - Chapter 7
      - Topic 7.1: 7.1 Orthogonal projections
      - Topic 7.2: 7.2–7.3 Plans, elevations, and scale
      - Topic 7.3: Topic 7.3
      - Topic 7.4: 7.4 Applications

- **A9:**
  - Form 5
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
    - Chapter 4
      - Topic 4.1: Topic 4.1
      - Topic 4.1E: Topic 4.1E
    - Chapter 7
      - Topic 7.1: 7.1
      - Topic 7.2: 7.2 Ogives and box plots
      - Topic 7.3: 7.3 Histograms & polygons
      - Topic 7.4: 7.4 Statistical mini-project

- **B Percentage points:**
  - Form 1
    - Chapter 12
      - Topic 12.1: 12.1 Statistical inquiry
      - Topic 12.2: 12.2–12.3 Representation and conversion
      - Topic 12.3: Topic 12.3
      - Topic 12.4: 12.4 Interpretation, inference and prediction
      - Topic 12.5: 12.5 Ethical representation
  - Form 5
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
    - Chapter 4
      - Topic 4.1: Topic 4.1
      - Topic 4.1E: Topic 4.1E
    - Chapter 7
      - Topic 7.1: 7.1
      - Topic 7.2: 7.2 Ogives and box plots
      - Topic 7.3: 7.3 Histograms & polygons
      - Topic 7.4: 7.4 Statistical mini-project

- **B Turning point:**
  - Form 4
    - Chapter 1
      - Topic 1.1: Topic 1.1
      - Topic 1.2: Topic 1.2
      - Topic 1.3: Topic 1.3
      - Topic 1.4: Topic 1.4
      - Topic 1.5: Topic 1.5
      - Topic 1.6: Topic 1.6
    - Chapter 2
      - Topic 2.1: Topic 2.1
      - Topic 2.1E: Topic 2.1E
  - Form 5
    - Chapter 8
      - Topic 8.1: Topic 8.1
      - Topic 8.2: Topic 8.2
      - Topic 8.3: Topic 8.3
      - Topic 8.4: Topic 8.4
      - Topic 8.5: Topic 8.5
      - Topic 8.6: Topic 8.6

- **B Tax wording:**
  - Form 5
    - Chapter 3
      - Topic 3.1: 3.1
      - Topic 3.2: 3.2
    - Chapter 4
      - Topic 4.1: Topic 4.1
      - Topic 4.1E: Topic 4.1E
    - Chapter 7
      - Topic 7.1: 7.1
      - Topic 7.2: 7.2 Ogives and box plots
      - Topic 7.3: 7.3 Histograms & polygons
      - Topic 7.4: 7.4 Statistical mini-project

- **B Logic terms:**
  - Form 4
    - Chapter 3
      - Topic 3.1: 3.1 Statements & compounds
      - Topic 3.2: 3.2 Arguments
    - Chapter 4
      - Topic 4.1: 4.1–4.2 Intersection/Union
      - Topic 4.2: Topic 4.2
      - Topic 4.3: 4.3 Combined operations & problem solving
    - Chapter 9
      - Topic 9.1: 9.1
      - Topic 9.2: 9.2
      - Topic 9.3: 9.3
      - Topic 9.4: Topic 9.4

- **B slopes:**
  - Form 1
    - Chapter 12
      - Topic 12.1: 12.1 Statistical inquiry
      - Topic 12.2: 12.2–12.3 Representation and conversion
      - Topic 12.3: Topic 12.3
      - Topic 12.4: 12.4 Interpretation, inference and prediction
      - Topic 12.5: 12.5 Ethical representation
  - Form 4
    - Chapter 5
      - Topic 5.1: Topic 5.1
      - Topic 5.2: Topic 5.2
      - Topic 5.3: Topic 5.3
      - Topic 5.4: Topic 5.4
      - Topic 5.5: Topic 5.5
      - Topic 5.6: Topic 5.6
      - Topic 5.E: Topic 5.E

- **C Modelling residual:**
  - Form 5
    - Chapter 8
      - Topic 8.1: Topic 8.1
      - Topic 8.2: Topic 8.2
      - Topic 8.3: Topic 8.3
      - Topic 8.4: Topic 8.4
      - Topic 8.5: Topic 8.5
      - Topic 8.6: Topic 8.6

- **C logic quality:**
  - Form 4
    - Chapter 3
      - Topic 3.1: 3.1 Statements & compounds
      - Topic 3.2: 3.2 Arguments
    - Chapter 4
      - Topic 4.1: 4.1–4.2 Intersection/Union
      - Topic 4.2: Topic 4.2
      - Topic 4.3: 4.3 Combined operations & problem solving
    - Chapter 9
      - Topic 9.1: 9.1
      - Topic 9.2: 9.2
      - Topic 9.3: 9.3
      - Topic 9.4: Topic 9.4
