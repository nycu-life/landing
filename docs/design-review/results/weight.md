# Page weight: main vs this branch

Measured on the local review stack with `tools/weight.mjs` (reduced motion, page scrolled to the end so lazy images count; transfer sizes as Chromium reports them). Same Ghost content and theme assets for both.

## main (d189336)

| page       | size | theme | fonts KB (n) | images KB (n) | largest image               | css KB | js KB | total KB |
| ---------- | ---- | ----- | -----------: | ------------: | --------------------------- | -----: | ----: | -------: |
| /          | 1440 | light |    1254 (26) |     6334 (60) | bus-phone-1-dark.png 1006   |    179 |  1503 |     9388 |
| /          | 1440 | dark  |    1254 (26) |     6334 (60) | bus-phone-1-dark.png 1006   |    179 |  1503 |     9388 |
| /          | 390  | light |    1208 (24) |     6376 (60) | bus-phone-1-dark.png 1006   |    178 |  1503 |     9383 |
| /          | 390  | dark  |    1208 (24) |     6376 (60) | bus-phone-1-dark.png 1006   |    178 |  1503 |     9383 |
| /products/ | 1440 | light |    1155 (22) |      1954 (8) | bus-phone-1.png 998         |     87 |   572 |     3789 |
| /products/ | 1440 | dark  |    1155 (22) |     3864 (12) | bus-phone-1-dark.png 1006   |     87 |   572 |     5699 |
| /products/ | 390  | light |    1133 (21) |      1954 (8) | bus-phone-1.png 998         |     87 |   572 |     3768 |
| /products/ | 390  | dark  |    1133 (21) |     3864 (12) | bus-phone-1-dark.png 1006   |     87 |   572 |     5677 |
| /news/     | 1440 | light |     926 (18) |      144 (10) | feature-image.jpg 63        |     87 |   572 |     1749 |
| /news/     | 1440 | dark  |     926 (18) |      144 (10) | feature-image.jpg 63        |     87 |   572 |     1749 |
| /news/     | 390  | light |     904 (17) |      144 (10) | feature-image.jpg 63        |     87 |   572 |     1727 |
| /news/     | 390  | dark  |     904 (17) |      144 (10) | feature-image.jpg 63        |     87 |   572 |     1727 |
| /devlog/   | 1440 | light |    1087 (21) |       75 (11) | semester-retro-114-2.jpg 18 |     87 |   572 |     1839 |
| /devlog/   | 1440 | dark  |    1087 (21) |       75 (11) | semester-retro-114-2.jpg 18 |     87 |   572 |     1839 |
| /devlog/   | 390  | light |    1066 (20) |       75 (11) | semester-retro-114-2.jpg 18 |     87 |   572 |     1817 |
| /devlog/   | 390  | dark  |    1066 (20) |       75 (11) | semester-retro-114-2.jpg 18 |     87 |   572 |     1817 |
| /wishpool/ | 1440 | light |    1187 (23) |       22 (10) | submit-default.svg 6        |     54 |    74 |     1382 |
| /wishpool/ | 1440 | dark  |    1187 (23) |       22 (10) | submit-default.svg 6        |     54 |    74 |     1382 |
| /wishpool/ | 390  | light |    1082 (21) |       22 (10) | submit-default.svg 6        |     54 |    74 |     1277 |
| /wishpool/ | 390  | dark  |    1082 (21) |       22 (10) | submit-default.svg 6        |     54 |    74 |     1277 |

## this branch (round 10)

| page       | size | theme | fonts KB (n) | images KB (n) | largest image                       | css KB | js KB | total KB |
| ---------- | ---- | ----- | -----------: | ------------: | ----------------------------------- | -----: | ----: | -------: |
| /          | 1440 | light |    1194 (22) |      311 (49) | gacha-desktop.svg?v=3zEszOYiWHjY 52 |    164 |  1504 |     3293 |
| /          | 1440 | dark  |    1194 (22) |      308 (49) | gacha-desktop.svg?v=3zEszOYiWHjY 53 |    164 |  1504 |     3290 |
| /          | 390  | light |    1172 (21) |      451 (49) | bus-phone-1.png 84                  |    164 |  1504 |     3411 |
| /          | 390  | dark  |    1172 (21) |      441 (49) | bus-phone-1.png 84                  |    164 |  1504 |     3402 |
| /products/ | 1440 | light |    1124 (20) |      213 (12) | bus-phone-1.png 35                  |     72 |   573 |     2007 |
| /products/ | 1440 | dark  |    1124 (20) |       103 (8) | bus-phone-1-dark.png 33             |     72 |   573 |     1896 |
| /products/ | 390  | light |    1102 (19) |      505 (12) | bus-phone-1.png 84                  |     72 |   573 |     2277 |
| /products/ | 390  | dark  |    1102 (19) |       232 (8) | bus-phone-1-dark.png 75             |     72 |   573 |     2004 |
| /news/     | 1440 | light |     915 (17) |       82 (10) | feature-image.jpg 63                |     72 |   573 |     1667 |
| /news/     | 1440 | dark  |     915 (17) |       82 (10) | feature-image.jpg 63                |     72 |   573 |     1667 |
| /news/     | 390  | light |     894 (16) |       90 (10) | feature-image.jpg 63                |     72 |   573 |     1652 |
| /news/     | 390  | dark  |     894 (16) |       90 (10) | feature-image.jpg 63                |     72 |   573 |     1652 |
| /devlog/   | 1440 | light |    1077 (20) |       20 (11) | wishpool-mobile-hover.svg?v=q-Xb 3  |     72 |   573 |     1763 |
| /devlog/   | 1440 | dark  |    1077 (20) |       20 (11) | wishpool-mobile-hover.svg?v=q-Xb 3  |     72 |   573 |     1763 |
| /devlog/   | 390  | light |    1055 (19) |       26 (11) | design-system-glass.jpg 4           |     72 |   573 |     1748 |
| /devlog/   | 390  | dark  |    1055 (19) |       26 (11) | design-system-glass.jpg 4           |     72 |   573 |     1748 |
| /wishpool/ | 1440 | light |    1083 (20) |       22 (10) | submit-default.svg 6                |     40 |    75 |     1267 |
| /wishpool/ | 1440 | dark  |    1083 (20) |       22 (10) | submit-default.svg 6                |     40 |    75 |     1267 |
| /wishpool/ | 390  | light |    1061 (19) |       22 (10) | submit-default.svg 6                |     40 |    75 |     1246 |
| /wishpool/ | 390  | dark  |    1061 (19) |       22 (10) | submit-default.svg 6                |     40 |    75 |     1246 |

Fonts fall only ~5 % (Space Grotesk removed, Roboto/Ubuntu Latin-only): almost all font bytes are Noto Sans TC's unicode-range slices for the Chinese text on each page. Serving the platform CJK font first would cut ~1 MB but changes how Chinese renders, so it is left as a follow-up decision.
