# Form 4, Chapter 8: Measures of Dispersion of Ungrouped Data

## Overview
Statistical inquiry and dispersion for ungrouped data: comparing dot plots and stem-and-leaf plots; range, interquartile range, variance and standard deviation; advantages and disadvantages of each measure; box-and-whisker plots (boxplots); effects of uniform transformations, outliers and adding/removing values; and comparison of distributions using suitable measures of central tendency and dispersion. Form 5 Chapter 7 extends these ideas to grouped data.

## Prerequisites
Form 2 Chapter 12 (mean, median, mode and range); Form 1 Chapter 12 (statistical questions, data collection and representations).

## Topic & subtopic breakdown

| # | Learning standard | Content coverage | Key skills / formulae | Typical question types |
|---|---|---|---|---|
| 8.1 | 8.1.1 Meaning of dispersion | Explain variability or spread in context. Pose a statistical question whose answers are expected to vary; collect real-life data by interview, survey, experiment or observation; use digital tools where appropriate; interpret a representation and draw a conclusion. | A statistical question anticipates variability in the collected data. Greater dispersion means observations are less tightly clustered. | Distinguish statistical from non-statistical questions; plan a small inquiry; explain what a tightly or widely clustered plot means in context. |
| 8.1 | 8.1.2 Compare representations | Compare and interpret two or more data sets with the same attribute using dot plots and stem-and-leaf plots, then make a supported conclusion. Include centre, overall spread, clusters, gaps, unusual values and overlap where visible. | Derive every plot from the underlying data; use the same scale/key for a fair comparison. | Match plots to data; compare consistency or typical performance; identify a misleading comparison and correct it. |
| 8.2 | 8.2.1 Measures of dispersion | Determine range, interquartile range (IQR), population variance and population standard deviation for raw lists and ungrouped frequency tables. Interpret each value in context. | `range = max - min`; `IQR = Q_3 - Q_1`; `\bar{x} = \Sigma x/N`; `\sigma^2 = \Sigma(x-\bar{x})^2/N = \Sigma x^2/N-\bar{x}^2`; `\sigma=\sqrt{\sigma^2}`. For frequencies, `N=\Sigma f`, `\bar{x}=\Sigma fx/\Sigma f`, `\sigma^2=\Sigma f(x-\bar{x})^2/\Sigma f=\Sigma fx^2/\Sigma f-\bar{x}^2`. | Calculate and interpret all four measures; complete an `x, f, fx, fx^2` table; recover a missing value or frequency from a stated mean/variance; choose the more consistent data set. |
| 8.2 | 8.2.2 Advantages and disadvantages | Select and justify a suitable measure. Range is quick and shows the full span but uses only two values and is highly sensitive to extremes. IQR describes the middle 50% and resists extremes but ignores half of the ordered data. Variance uses every observation and is algebraically useful but has squared units and is sensitive to extremes. Standard deviation uses every observation and has the data's original unit, but is sensitive to extremes and requires more calculation. | Link the choice to distribution shape, outliers, purpose and units; do not claim one measure is universally best. | Choose IQR rather than range/standard deviation when robust comparison is needed; explain why standard deviation is more interpretable than variance in context; critique an unsuitable choice. |
| 8.2 | 8.2.3 Boxplots | Use the five-number summary (minimum, `Q_1`, median, `Q_3`, maximum) to construct and interpret a boxplot. Compare two or more boxplots on a common scale. Describe relative centre and spread; make only distribution claims supported by the plot. | Read `range` from whisker endpoints and `IQR` from box edges. A box contains the middle 50%; each interval between adjacent five-number-summary markers represents about one quarter of the ordered observations, not necessarily equal density. | Draw/read a boxplot; compare median and IQR/range; match a boxplot to a list; determine a possible/impossible data value. |
| 8.2 | 8.2.4 Effects of changes to data | Determine effects numerically and graphically when every observation is transformed uniformly, an outlier/extreme exists, or a value is added/removed. For `y=ax+b`, centre changes to `a` times the old centre plus `b` (with order reversed if `a<0`), while `range_y=|a|range_x`, `IQR_y=|a|IQR_x`, `\sigma_y^2=a^2\sigma_x^2`, and `\sigma_y=|a|\sigma_x`. Thus adding/subtracting the same constant leaves all four dispersion measures unchanged. Outliers usually affect range, variance and standard deviation strongly and IQR less, but adding/removing a value has no universal direction of change: recompute because its value and rank can change quartiles, mean and all measures. | Update the numerical measures and redraw/reinterpret dot plots, stem-and-leaf plots or boxplots before and after the change. Treat `a<0` correctly. Never delete an outlier silently: investigate, justify, disclose and, where useful, compare conclusions with and without it. | Find new measures without rebuilding a transformed list; compare before/after plots; add/remove a stated value and calculate the exact effect; explain why an extreme stretches a plot; test a claimed invariant. |
| 8.2 | 8.2.5 Compare distributions | Compare and interpret two or more ungrouped data sets using a suitable measure of central tendency together with a suitable measure of dispersion, then make a contextual conclusion. | Compare like with like on common units/scales. A larger mean/median concerns level; a smaller IQR/standard deviation concerns consistency. Address trade-offs rather than reducing a conclusion to one statistic. | Decide between players, machines or groups using centre and spread; justify the selected statistics; state when the evidence is insufficient. |

## Formula and calculation requirements

- Treat the displayed variance as **population variance**, with denominator `N` (or `\Sigma f`), as prescribed for this chapter; do not import the sample formula with denominator `N-1`.
- Accept either variance identity above, but calculate from exact stored values and round only the final answer as instructed. Because subtraction in `\Sigma x^2/N-\bar{x}^2` can amplify premature rounding, retain guard digits internally.
- Require units: range, IQR and standard deviation use the same unit as the observations; variance uses the square of that unit.
- A worked validation set is `2, 4, 4, 5, 7, 8`: `\bar{x}=5`, range `=6`, `Q_1=4`, `Q_3=7`, IQR `=3`, `\sigma^2=(9+1+1+0+4+9)/6=4`, and `\sigma=2`.
- Under `y=3x-2`, the validation set has range `18`, IQR `9`, variance `36` and standard deviation `6`. If the outlier `30` is instead added to the original set, verify all affected statistics directly; do not apply a uniform-transformation rule to this non-uniform change.

## Quartile convention

- Default to the KSSM Form 4 textbook method for an ordered raw list: find the median, exclude the overall median when `N` is odd, then take the medians of the lower and upper halves as `Q_1` and `Q_3`. When a half contains an even number of observations, average its two middle values.
- For an ungrouped frequency table, expand positions conceptually through cumulative frequency and locate the same ordered observations; do not round `N/4` and `3N/4` independently in a way that conflicts with the raw-list method.
- Record `quartile_method: kssm_textbook_median_of_halves` in generator metadata and verify it against the target textbook/paper and marking scheme before deployment. If a target explicitly prescribes another convention, state that convention in the item and answer key or generate data for which the accepted conventions agree. Never mix conventions within an item.

## Difficulty strategies

### 8.1 Statistical inquiry and visual comparison

- **Easy**: describe which of two dot plots is more dispersed; identify a statistical question; read a stem-and-leaf key.
- **Medium**: construct two plots from small same-attribute data sets and compare centre, spread and unusual values; identify an unfair scale or omitted label.
- **Hard**: design a small real-life inquiry, choose a collection method and representation, use technology to analyse the results, and defend a conclusion while identifying sampling or representation limitations.
- Distractors: equating high values with high dispersion; comparing only maxima; using different axes without noticing; treating a single observation as evidence about variability.

### 8.2.1-8.2.2 Measures and selection

- **Easy**: range/IQR of a short ordered list; variance or standard deviation when `\bar{x}`, `\Sigma x^2` or the variance is supplied; identify units.
- **Medium**: compute all measures from a raw list or ungrouped frequency table; compare range versus IQR or variance versus standard deviation; justify the most suitable measure in the presence of an extreme.
- **Hard**: complete a partially given `fx/fx^2` table; find a missing value/frequency from `N`, `\Sigma x`, `\Sigma x^2`, mean or variance; compare conclusions produced by sensitive and resistant measures.
- Distractors: failing to order data for quartiles; using `N-1`; omitting frequencies; reversing the shortcut variance formula; reporting variance as standard deviation; attaching unsquared units to variance.

### 8.2.3 Boxplots

- **Easy**: read the five-number summary from a boxplot.
- **Medium**: construct a boxplot from a data list; determine range and IQR; compare two aligned boxplots.
- **Hard**: match boxplots to data sets; reason about possible values/counts without inventing unavailable detail; compare centre and spread where the preferred group depends on the stated purpose.
- Distractors: reading box edges as minimum/maximum; assuming equal-width intervals contain equal numbers; inferring the mean or exact sample size from an ordinary boxplot; claiming symmetry/skewness more strongly than the displayed five-number summary supports.

### 8.2.4-8.2.5 Change and comparison

- **Easy**: add the same constant to every value and identify unchanged dispersion measures; multiply every value by a positive constant.
- **Medium**: apply `y=ax+b`, including fractional or negative `a`, and transform both statistics and a plot; add/remove a value and recompute.
- **Hard**: compare numerical and graphical effects of an outlier; determine an inserted value from a new mean/variance; evaluate a contextual choice using a central measure and a dispersion measure before and after a justified data correction.
- Distractors: multiplying variance by `|a|` rather than `a^2`; changing dispersion after translation; forgetting order reversal for `a<0`; assuming every added value increases spread or every removed value decreases it; deleting an inconvenient outlier without disclosure.

## Statistical inquiry and ethical representation

- Inquiry items should include an answerable statistical question, anticipated variability, a population/sample and collection method, an appropriate representation, calculation/interpretation, and a conclusion tied to the question.
- Use interviews, surveys, experiments or observations in plausible real-life settings. If simulated data are supplied, label them as simulated; do not imply that generated values were actually collected.
- Compare sets measuring the same attribute with compatible units and common graphical scales. Show axes, keys, units, sample sizes and any relevant rounding.
- Do not manipulate axis limits, scale choices, aspect ratio, omitted values or selective summaries to exaggerate a preferred conclusion. It is valid to ask learners to diagnose and repair such a misleading display.
- Flag possible data-entry errors separately from genuine extreme observations. Any correction or exclusion must have a stated reason, and its effect on the conclusion should be assessed.

## Visual aids

- **REQUIRED** for construction/reading/comparison of boxplots: render horizontal boxplots on labelled number-line scales; use a common scale for comparisons; preserve exact five-number-summary coordinates.
- **REQUIRED** when a prompt supplies dot plots or stem-and-leaf plots. Generate each representation from the same internal data model as the calculations and answer key; include a stem-and-leaf key and aligned dot-plot ticks.
- For change-effect items, show or require before/after representations on comparable scales. A translation moves the shape without changing spread; multiplication by `|a|` scales horizontal distances, and a negative multiplier also reverses order.
- Attach underlying ordered values/frequencies and accessible text equivalents to every generated graphic. Validate tick labels, units, collisions, print legibility and consistency between the visual, prompt and solution.

## Generator notes

- Generate the complete data set first; independently recompute `N`, order statistics, `\Sigma x`, `\Sigma x^2`, mean, quartiles, range, IQR, variance and standard deviation before rendering any table or graphic.
- Use integer or simple-decimal data at Easy/Medium and choose values that give clean final answers. Hard difficulty should come from reasoning, representation shifts or missing information—not merely burdensome arithmetic.
- For unknown-value/frequency tasks, choose the hidden quantity first, calculate the displayed constraints, and solve the released item independently. Reject instances with multiple valid answers, order changes not addressed by the solution, negative/non-integer frequencies or violated context bounds.
- For add/remove/outlier tasks, compute the exact before/after measures and plots; never encode a blanket increase/decrease rule. Use both cases where spread grows and cases where it falls or a rank-based measure is unchanged.
- Interpret “more consistent” only in relation to a smaller appropriate spread measure and the context. When centres differ materially, require the response to discuss both level and consistency.
- Contexts may include test marks, repeated measurements, delivery times, manufacturing output or sports performance. Keep units, attainable ranges and sample descriptions realistic within the question.
- Cross-link to Form 2 Chapter 12 for central tendency and Form 5 Chapter 7 for grouped-data dispersion; variance and standard deviation for **ungrouped** data are core here, not deferred to Form 5.
