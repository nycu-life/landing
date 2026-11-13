# Design review results

Hill climb of the Ghost native theme and the Wish Pool (Theo's "Agents Sucked At UI"
loop, run with the Harmonica Observatory review process). Every round: a fresh
claude-proxy **Claude Opus 5.5 (effort high)** reviewer, no other context, the fixed
[`brief.md`](../brief.md) (SHA-256 `38706a33…16fd4`, unchanged since round 1), and three
screenshot sets in random A/B/C order — baseline (`main` at `d189336`), the round's new
build, and 5 reference pages (Linear, Linear changelog, Raycast, Raycast blog, Canny).
The mapping is stored outside the review folder and revealed after the review. Each
round only changed what that round's reviewer flagged for the new set.

Scores are the mean of the 12 category scores in each raw review.

| Round | Baseline |      New | Reference | New − baseline | File                    |
| ----- | -------: | -------: | --------: | -------------: | ----------------------- |
| r1    |     5.46 |     6.75 |      8.33 |          +1.29 | [r1](r1-opus-5-5.md)    |
| r2    |     5.33 |     7.42 |      7.92 |          +2.08 | [r2](r2-opus-5-5.md)    |
| r3    |     5.58 |     7.54 |      7.92 |          +1.96 | [r3](r3-opus-5-5.md)    |
| r4    |     5.46 |     7.67 |      8.25 |          +2.21 | [r4](r4-opus-5-5.md)    |
| r5    |    5.96¹ |     7.71 |      7.96 |          +1.75 | [r5](r5-opus-5-5.md)    |
| r6    |     5.83 |     7.63 |      7.50 |          +1.80 | [r6](r6-opus-5-5.md)    |
| r7    |     5.79 | **8.00** |      7.92 |          +2.21 | [r7](r7-opus-5-5.md)    |
| r8    |     5.75 |     7.42 |      7.71 |          +1.67 | [r8](r8-opus-5-5.md)    |
| r9    |     5.79 |     7.96 |      8.50 |          +2.17 | [r9](r9-opus-5-5.md)    |
| r10   |     5.33 |     7.63 |      7.75 |          +2.29 | [r10](r10-opus-5-5.md)² |

¹ Baseline re-shot from round 5 on with the pointer-parking, load-gated capture tool
(per-image sizes within ±15 % of the earlier shots). ² Third reviewer run; the first two
were killed by the host's out-of-memory killer.

**Stopping.** Stage 1 ran its 10-round cap. The new set never scored ≥ 9, so the council
stage (two consecutive rounds ≥ 9) never started.

**Drift and inflation.** The baseline never changed, yet its mean moved between 5.33 and
5.96 (range 0.63); the reference moved between 7.50 and 8.33 (range 0.83). That is the
size of judge noise for one reviewer and one round. After round 2 the new set stayed in
7.42–8.00, inside that band, so rounds 3–10 are not a measurable climb on their own —
they fixed specific defects (listed in each file) rather than moving the mean. There is
no upward trend in the baseline or the reference, so no sign of score inflation; the
opposite risk shows instead: some reviewers re-raise issues for the new set that earlier
rounds asked for in the other direction (equal-height vs. natural-height wish cards;
where Hide sits on phones), so later rounds left those as they were.

The capture tool, state list and reproduction steps are in [`../states.md`](../states.md)
and [`../tools/`](../tools/). Screenshot sets live in `/tmp/nycu-hc/` on the review host
and are not committed; the before/after images below are.
