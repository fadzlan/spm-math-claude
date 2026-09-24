# Malay terms – decisions needed

While adding the worked solutions, the agents flagged Malay terms they were unsure of. Most of the text follows the
terms each file already used, but a few terms are **inconsistent between files**, so the same idea is named two ways
depending on which topic a student picks. This file lists them for your decision.

Counts are occurrences in `site/js/data/*.js` as of 2026-09-23. To apply a decision, tell me the term you want and I
will replace it everywhere in one pass (a text replacement, then `npm run check`).

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
- **"Cargo mengubah digit…"** in f3a – a mistranslation of "A carry changes the digit…".
