# Gauntlet 3: twins and head-to-heads

The owner's direction (2026-10-22, after reviewing round 4 of gauntlet 2): no scores; blind head-to-heads; an exploratory phase for the pieces that keep losing; Linear's references aren't directly comparable with our screens.

## The plan (agreed 2026-10-22)

1. **References and twins.** Fetch better-matched Linear references (`.review/linear-bar/more/`, `refs.md`). Build twins: Linear's reference screens drawn with the kit, the same content at the same size and crop (`web/src/features/sheet/twins/`, route `/twins/<name>`, development only).
2. **Calibration.** Run a match of our current best against itself, to measure how often noise alone produces a win.
3. **Craft rounds (kit-wide).** A kit challenger plays the incumbent kit on the twins, with Linear's crop shown as the standard. A screen regression check runs too.
4. **Layout rounds.** Per screen, a challenger plays the incumbent with the same content. Linear's closest screen is shown as a style anchor, not as a contestant.
5. **Exploration for stuck pieces.** Four directions start from the baseline, each gets 2 polish rounds of grace, then a bracket decides the winner. The owner picks between the final two.

**The judging rule.** Each match gets 4 fresh blind judges; 2 see each order. A judge picks A, B or "same". The challenger needs at least 3 of the 4 votes. A piece is settled when its incumbent wins 3 matches in a row.

## Tools (session scratchpad `g3\`)

- `tshots.mjs`: the twins' camera. It writes `linear.png` (the crop) and `twin.png` (ours) at the same pixel size.
- `h2h-prep.mjs`: copies the image sets under neutral names, one folder per judge.
- `h2h.js`: the judging workflow, with args `{root, matches: [{id, n, r}]}`.

The twin-building workflow is `gauntlet3-twins` (run `wf_530ba889-2fa`, base `3b23394`).

## Log

- References: 23 more are in `.review/linear-bar/more/`, indexed by piece in `refs.md`.
  - Missing: a current peek, a real toast, and a plain filter dropdown.
  - Peek stand-ins: `overlays-03` and `intake-01`.
- `3b23394`: the twins page scaffold (route, `Twins.tsx`).
- Calibration `h2h/s1`: m01 = lists, m02 = intake, m03 = ticket. Each is the r4 best against itself, with identical images (run `wf_5b431a3e-d1a`).
  - The result was "same" from all 12 judges. The judges hashed the files and found them byte-identical, so this shows they don't invent differences, but it doesn't measure noise.
- Calibration `h2h/s2`: the r3 best (X) against the r4 best (Y) for the pieces r4 kept by score. m04 = lists, m05 = intake, m06 = overlays, m07 = library (run `wf_18d458af-81b`).
  - Results (r3 against r4):
    - lists 0–4 (r4's solid Approve button is a real win);
    - **intake 4–0 (r4's change was a regression: fainter group bands, the status line pinned at the bottom)**;
    - overlays 0–4;
    - library 1–3.
  - The judges agree unanimously, in both orders, and they use pixel diffs and contrast ratios.
  - Done: r4's intake change was undone at `349ec0e`, with the screenshot baselines regenerated.
- `21f0566`: the 8 twins (home, issues, triage, subissues, project, project-teams, display, board).
  - Pairs: `twins/base/<name>/{linear,twin}.png`. Gap notes: `twins/gaps/`.
- Baseline `h2h/s3` (Linear against twin), with the summary in `h2h/s3/summary.md`:
  - home 2–2, issues 2–2;
  - triage, subissues, project and display each 4–0 to Linear;
  - board 3–1 to Linear;
  - project-teams 0–4: we won, but it's a fidelity artefact (Linear's image has two overlapping pickers).
  - The themes: glyphs, popover forms, the type and ink hierarchy, dark surfaces, and property-row density.
- Craft round 1 (`k1`), run `wf_98c1e004-0f9`, base `349ec0e`, script `g3\craft.js`:
  - The incumbent's shots are in `k1/qr`.
  - The levers and their folders: glyphs = `qd`, ink = `qk`, surfaces = `qb`, forms = `qw`.
  - The new incumbent will be shot to `k2/qn`.
  - `g3\changed.mjs` is the tolerant diff: more than 40 pixels changed, each by more than 16 levels.
  - **Stopped before any builder finished.** The owner pointed out that the framing (closeness to Linear) rewarded copying Linear.

## The plan, revised (2026-10-22, by the owner)

- **The main goal: our screens, with our own content, designed better.**
  - A challenger plays our current best head to head on our real screens.
  - There are 4 blind judges, and the challenger needs 3 of 4.
  - This decides what's kept.
- **The secondary goal: the twins against Linear.** The twins keep Linear's layout and take the kit's look automatically, so this is a pure test of our language against Linear's. It's informative feedback on the kit, or a tie-break.
- **Dropped:** our own designs of Linear's content. They would optimise layouts for content we don't have.
- **Effort:** exploration builders xhigh, polish builders high, judges high (verified: high gives the same verdicts as xhigh on the s2 matches, intake 3–1 instead of 4–0), the integrator high, helpers medium.

### Exploration (`x<round>`)

- 4 directions, each restyling the kit and composing our real screens freely, while keeping content, controls and behaviour. Round 1 is at xhigh; then 2 polish rounds at high with the judges' notes; no one is eliminated before the bracket. Then a bracket among the directions; its winner must beat the incumbent, and the owner picks between the final two.
- The script is `g3\explore.js`, with args `{round, base, effort, polish, directions}`. The prep tool is `g3\xprep.mjs`.
- The judged sets are fixed:
  - 10 screens (listed in `xprep.mjs`) against `k1/qr/screens`;
  - 7 twins (all but project-teams) against Linear's crops.
- Output:
  - `x<r>/<dir>/{screens,twins,direction.md}`;
  - `x<r>/patches/<key>.patch` (cumulative against the base);
  - `x<r>/judge/`;
  - `x<r>/feedback/<key>.md` (written between rounds).
- The directions:
  - d1 flat (flat and quiet);
  - d2 precise (a dense, technical instrument);
  - d3 colour (colour as information);
  - d4 warm (warm and spacious).

### After the language exploration: targeted rounds (agreed 2026-10-22)

- **The target.** Each round has one target: a screen, a layout or a component. The owner names it, or it comes from the judges' recurring losing gaps.
- **The runners.** The 4 runners give 4 distinct answers to that one target. They are free in approach, but each gets a different premise so they don't converge.
- **The judging.** Each answer plays the current best head to head, and needs 3 of 4 to win. If several win, they play each other.
- **The language.** The rounds are done in the winning language.
- **The first targets:** My Queue (the in-flight ticket cards) and All teams (how the view is represented). All teams is not in the exploration's 10 judged screens, so add it for those rounds.
- **The sweep.** Once things plateau, run an occasional free-pick sweep round for small fixes.

### Round 1 log

- **Run `wf_5fafe3f4-070`:** the session limit stopped all 4 builders after about 25 minutes, before they produced any output.
  - Their unfinished work was saved to `x1/partial/<key>.patch`.
  - The old workflow worktrees were removed safely (main `node_modules` still has 337 entries).
- **Restarted as run `wf_acc8d1a7-0b0`,** with `resume: x1\partial`: each builder starts from its direction's unfinished patch.

- **Round 1 results.** Our screens against the current ones:

  | Direction | Score |
  |---|---|
  | flat | 4–0 |
  | precise | 4–0 |
  | colour | 4–0 |
  | warm | 3–1 |

  Every direction's twins lost 0–4 to Linear.
  - Feedback is in `x1/feedback/`. The comparison page is `round1.html`.
  - The kit, in components and lines:

    | Direction | Components | Lines |
    |---|---|---|
    | flat | 44 | 8,429 |
    | precise | 44 | 8,596 |
    | colour | 44 | 8,767 |
    | warm | 44 | 8,527 |

- **Polish rounds** now judge each direction against its own previous round, and a polish is kept only with 3 of 4 votes.
  - If a polish loses, copy the earlier patch, screens and `direction.md` over it before the next round, and keep the new feedback.
  - Round 2 is run `wf_5448140a-d49`.

- **Round 2 results.** Each polish beat its round-1 version 4–0: flat, precise, colour and warm. The twins still lose 0–4 to Linear.
  - The judges' twin complaints are mostly about glyph choices made inside the twins, which are fixed, and about bordered select fields.
  - Flat's builder couldn't write outside its worktree, so its patch and `direction.md` were copied from the scratchpad `x2flat`. `explore.js` now tells builders to copy files into place.
  - Round 3 is run `wf_5820425f-b88`.
- **The bracket** is `g3\bracket.js`, with args `{out, dirs:[{key, dir, root}], current}`.
  - Every pair of directions plays on the 10 screens.
  - A split pair (neither side gets 3 votes) is decided on the twins, played direction against direction.
  - The table ranks by wins, then by votes.
  - The top two then play the current screens. The owner picks between them.

- **Round 3 results:** polish against the round-2 versions.

  | Direction | Score | Version kept |
  |---|---|---|
  | flat | 0–4 | x2 |
  | precise | 1–3 | x2 |
  | colour | 2–2 | x2 |
  | warm | 4–0 | x3 |

- **The kept versions:** `x2/patches/{flat,precise,colour}.patch` and `x3/patches/warm.patch`, with the matching `x2/d1..d3` and `x3/d4` folders.
- **The bracket** is run `wf_1b6e95ba-44a`, with output in `xb/judge`. Ids: p = flat, q = precise, r = colour, s = warm.

- **Bracket results** (run `wf_1b6e95ba-44a`):

  | Game | Votes | Winner |
  |---|---|---|
  | warm – flat | 3–1 | warm |
  | warm – colour | 3–1 | warm |
  | warm – precise | 2–2 | warm, on the twins 4–0 |
  | flat – precise | 2–2 | flat, on the twins 4–0 |
  | flat – colour | 2–2 | flat, on the twins 4–0 |
  | precise – colour | 2–2 | draw (the twins also 2–2) |

  - **The table:** warm 3 wins, flat 2, precise 0, colour 0.
  - **The confirmation:** warm 4–0 and flat 4–0 against the current screens.
  - The final-two page is `final-two.html`. **Waiting on the owner's pick.**
  - **The judges on warm against flat:** warm's sections on their own cards make the busy screens easier to scan. Its flaws: Compact loses a row to the cards' extra framing; Save looks disabled; cards nest inside cards on the ticket page.

- **The owner's view (2026-10-23):** "In general I prefer the flat look if executed well," but it has just enough issues that warm is better. So: a fix round for both, then warm against flat again.
  - Round 4 is run `wf_5055a630-9c2`, with flat and warm at xhigh, each against its own kept version.
  - `x3/d1` and `x3/patches/flat.patch` now hold flat's kept round-2 version. Its losing round 3 is in `x3/d1-lost` and `flat-lost.patch`.
  - The feedback is `x3/feedback/{flat,warm}.md`: a fix list followed by every bracket judge's notes (`g3\bfeedback.mjs`). Round 3's own notes are in `*-r3.md`.
  - **Next:** `bracket.js` with the two directions, rooted at x4 for a direction whose fix won, otherwise at x3. That runs warm against flat, then both against the current screens.

- **Round 4 results:** flat 4–0 and warm 4–0, each against its own kept version, so both fixes were kept (`x4/patches`, `x4/d1`, `x4/d4`).
- **Rematch** (run `wf_f96c140e-300`, `xb2/judge`): **flat 3–1 over warm**.
  - Against the current screens: flat 4–0, warm 3–1.
  - The page is `fixed-two.html`.
  - The judges decided mostly on Intake: flat's real table (column headers, one-line rows, a tinted error banner) against warm's two-line list, and on warm's card-per-section clutter.
  - **Flat's remaining flaws:**
    - The Skills footer is pinned far below a short table.
    - The editors float in empty white, and the Builder instructions need a visible editable surface.
    - The ticket page spends too much height above the tabs, so the plan is cut off.
    - Rows sit about 16px inside the header's gutters.
    - Talk is a card nested in the main panel.
  - **Waiting on the owner** to confirm flat (`x4/patches/flat.patch`) for integration.

- **The owner chose flat (2026-10-23).** It is integrated and committed at `fbfae3d` "gauntlet: the flat direction". Checks, tests and gates passed. `just shots` flaked once on compact-expanded (light), then passed 3 times in a row. The kit is 44/45 components and 8,532 lines.
  - The incumbent's shots are in `t0/inc/{screens,twins}`.

### Targeted rounds (`t<n>`)

- **The script:** `g3\target.js`, with args `{round, base, inc, effort, target, brief, shots, guard, answers:[{key,dir,premise}], notes?}`.
- **The judging:**
  - each answer is judged against the incumbent on its target shots (needs 3 of 4) and guarded on the other shots (it loses if the incumbent gets 3 or more);
  - if several answers win, they play each other in finals;
  - the integrator then applies the best answer, runs the checks, updates the baselines, commits "gauntlet: <target>", and shoots `t<n>/next`.
- `xprep.mjs` now also takes `shots <list>` for a chosen set of shots.
- **t1: flat's remaining flaws.** One fixer, at high effort; the notes are in `t1/notes/flat.md`. Run `wf_efb8cb41-967`.
  - **Result:** target 4–0, guard 4–0. Integrated as `83d06d8` "gauntlet: flat's remaining flaws". The kit is 44/45 components and 8,522 lines. The new incumbent's shots are in `t1/next`.
  - `just shots` again flaked once on compact-expanded (light): 182 px of anti-aliasing in the "Queued" heading. It is a recurring flake.
  - 15 finished workflow worktrees were removed; main `node_modules` still has 337 entries.
  - `target.js` now gives the integrator the vote for the commit body.
- **t2: My queue's tickets in flight.** Run `wf_4633147f-a9c`, base `83d06d8`, incumbent `t1/next`, effort xhigh.
  - The answers: rows (b1), pipeline (b2), feed (b3), rich (b4).
  - Target shots: frame 1 and 2, and overlays/1-peek. Guarded on 6 other shots.
  - **Result:** rows won 3–1 on the target (the guard was unchanged); rich 2–2; feed 2–2; pipeline 0–4. Integrated as `804ede0`, with the kit at 8,502 lines. The new incumbent's shots are in `t2/next`.
  - The judges' follow-ups: bring back the run number on each row, make the meter more readable, and use the same running glyph everywhere.
- **t3: the All teams view.** Run `wf_c8a3fdea-fdd`, base `804ede0`, incumbent `t2/next`, effort xhigh.
  - The answers: board (c1), table (c2), overview (c3), flow (c4).
  - **Result:** all four beat the incumbent on the target: flow 4–0, table 4–0, board 4–0, overview 3–1. The guard was unchanged.
  - **The finals:** table won all three of its games (4–0, 4–0, 4–0); board beat overview 4–0 and flow 3–1; overview and flow split 2–2.
  - Integrated as `489f418`, with the kit at 8,460 lines.
  - `just shots` flaked once on compact-expanded (light), the third time in this gauntlet.
  - The new incumbent's shots are in `t3/next`. The before-and-now page is `before-now.html`.
- **Next:**
  - **t3:** the All teams view, with 4 premises.

- **The owner (2026-10-23):** no more ultracode; be more deliberate. Questions raised:
  - **What is the bar?** So far, rounds were decided against our own previous version only. The twins against Linear: always 0–4.
  - **Do judges just favour rows and tables?** Partly. The All teams finals were decided by unequal content (the table added owner and age) and by the empty space in sparse fixtures.
  - Proposed for layout rounds:
    - fix the content per screen;
    - judge against the screen's job;
    - the owner decides the representation (board or table, cards or rows).
- **Aesthetic check `h2h/s4` m08,** done with 4 Agent-tool judges: the twins now (`t3/next`) against the twins before flat (`k1/qr`), **4–0 to now**.
  - Why: tone instead of outlines, layering, and a coherent indigo selection.
  - Shared flaws:
    - dark-mode tonal steps too close (murky);
    - **the inset panel clips the Display popover** (check whether real screens' popovers get clipped);
    - narrow measures that truncate.

- **`h2h/s4` m09: the current twins (`t3/next`) against Linear's crops: 0–4 to Linear.**
  - Linear wins on:
    - glyphs (all 4 judges: our twins reuse one stacked-lines icon; the kit has no funnel, sliders or sort icon);
    - oversized heavy titles (3 judges);
    - grey fills blurring surfaces, against Linear's hairline sections and bordered fields in popovers (3 judges);
    - a muddy warm-charcoal dark mode (2 judges).
  - Linear's own flaws: dim secondary text, a couple of clipped layouts.
  - **Proposed order:** glyph set (kit and twins), type scale, structure inside popovers, dark tones. Re-measure against Linear after each, and each change must also keep beating our current screens.

- **Kit pass for the Linear gaps (uncommitted, by hand):**
  - Icon: filter, display, sort and order, used by the twins.
  - Surface `parts`: hairlines between an options panel's sections.
  - Select trigger: a faint inset hairline.
  - Carbon dark: cool near-black (`#161619`) with firmer tones and fills.
  - Title: 24 → 20px.
  - **Results:**
    - m10, the twins against Linear: **still 0–4**. The judges now name fill-vs-edge (Linear's hairlines against our grey slabs), heavy titles, and weight.
    - m11, our screens new against current: **1–3, so the guard failed**, because of the 20px title (it no longer anchors the list pages). The judges liked the cool dark.
  - Then: title back to 24px, and the Carbon sidebar darker (34% → 44% black). The screens are in `q2`.
  - **Guard m12: 3–1 to the new version** (the cool dark, the bordered selects); 1 judge preferred fill-only selects.
  - **Committed as `572c6e0`.** All checks pass and the shots are 22/22. The kit is 8,485 lines.
  - Not re-measured against Linear at 24px. m10 (at 20px) was 0–4.
  - **The structural finding:** Linear wins on edge, not fill. Its hairlines define cards, chips and fields; flat's tone-first slabs read as "soft, lumpy", yet tone beat our old outlined kit 4–0. The remaining gap is a language choice: selective hairlines on small parts, not outlines everywhere.
- **Note on m09/m10:** each judge gave one verdict over all seven pairs. Per pair, home (pair 1) drew mostly Linear's own flaw (its agent panel clips the activity cards); the losses come from the toolbar and popover screens.
- **The owner's picks (2026-10-23), no judging, by hand: committed as `79b0b91`.** The owner said the rounds were going in circles and asked to restore what was lost:
  - group and query heads are light grey bands again (Compact, Intake, and so My queue and All teams); Intake's section hairline dropped;
  - the editors' text sheets: a hairline round a shade barely off the page (no grey slab);
  - kind colours on the workflow, agent, skill and file glyphs (sidebar, properties, context);
  - titles: views 20px, documents 22px (was 24 and 28).
  - Shots in `q3`; the gallery is `now.html`. Checks pass, shots 22/22.
- **The palette (owner's call, 2026-10-23): `03c07fe` + baselines `9861912`.** Light greys read drab; in both modes the slabs stood too far off the page (measured on home: Linear's card +3 levels over its sheet, ours +6). Paper now mixes a cool slate (`--wash`/`--hair` #2a3b6e) at small steps; Carbon cooler, tones about half, sidebar 30% black; Card, the run card and the Composer take a `--card-edge` hairline; group gap 10px. Shots in `q4`. Not judged.
- **Pitch dark (owner's call): `81b5fc8`.** Linear's dashboard sheet measures #0f1011, its cards 0–3 levels over it on a hairline, no shadow. Carbon's page is now #0f1012; Surface sheet lost its drop shadow (a hairline instead). Shots in `q5`.
- **Linear's light mode, sampled** (`light.html`, refs in `linear-bar/light` and `more/ticket-02`): page #fcfcfc with white cards on hairlines (2025 issue page); Ash: white page, cool sidebar #edeef3, bands #f7f7f7. Its cards are as light as the page or lighter, never darker. Proposed to the owner, not built.

### Pausing

- If the usage window ends mid-run, resume with `Workflow({scriptPath: g3\explore.js, resumeFromRunId})` in the same session.
- Otherwise rebuild from disk: `x1/patches`, the shots and `direction.md`.
- **Two themes, Paper as Linear's light (owner's call): `b9fe0fb`.** Mist, Midnight, Harbour and Plum dropped. Paper's sheet #fcfcfd; cards, popover, buttons, fields, chips and tags white on a hairline (rest-edge tokens, transparent on Carbon). Shots in `q6`; `light.html` compares with Linear.
- **Style reviews (Opus 5.5 + Codex GPT 6.1 Sol in herdr panes; `style/opus.md`, `style/codex.md`) and the pass: `2f02f4b` (Paper sidebar #eceef5), `e7c51c3` (edge not grey).** Agreed and single-reviewer items all built; disagreements per Opus (keep bands lighter, keep popover shadow, keep code fill, keep sidebar). Plus the owner's sheet rim (Linear Ash's #e3e4ec line). Shots in `q8`.
- **Owner's notes on the pass: `b097ac7`.** Bands square to the sheet's edges and at Linear's strength; Paper rim 2px; Carbon card tone about +6 and its own edge (Linear's home card +7, edge +26); hairlines between people's messages in a card; a sheet inside a sheet flat and a step lighter. Shots in `q9`.
- **One list reach, tinted tags: `99a8205`.** Head and Row share `--list-reach` (band, wash, open card, row rule: square, to the sheet's edges). Chip tones neutral/indigo/teal/amber wash a kind's hue into the tag (`--chip-tint` 12% dark, 10% light; folded into `tone` to stay at 8 props). Shots in `q10`.
- **Regressions fixed: `0d49131`.** `--list-radius` (square at the sheet's edges, round in the ticket's body); an off stage takes the opaque page ground and drops the card hairline (lane line can't cross it; dashes in `--tk-skip`); nested sheets and the reply well about +10 over their panel (Linear +8). Shots in `q11`.
- **Browser-agent review, all taken: `5a4c745`.** One filter bar (chips) on My queue (?z=), All teams (?f=), Intake (?q=); Page counters removed; row Approve outlined (Button outline), Request changes on hover (Button aside); Intake status glyphs; queued meter empty track; Carbon ink-3 #aeb2bf; library lists Table narrow (--w-list 1000px). Font trial (Inter, not installed) in `font.html` against `q12`.
- **Scores against Linear on `5a4c745` (2026-10-23).** (1) Blind twins, per pair, 4 judges (`h2h/s5/m13`, j1/j2 see ours as A): Linear 20 picks, ours 8; ours won 2/4 on home, triage, board, 1/4 on issues and project, 0/4 on sub-issues and display; mean scores ours 6.25, Linear 7.2; strong second-position bias (j1/j2 14/14 B, j3/j4 8/14 B). (2) Our 10 real screens against Linear's nearest, scored 1-10 on sep/type/colour/rhythm/polish, 4 judges (`score/`): ours 6.8, 7.0, 6.7, 6.9 (mean 6.85); Linear 8.2, 8.6, 7.8, 8.2 (mean 8.2). Closest: Intake, the workflow editor. Unanimous: row titles read too heavy (they are Geist 500; the Inter trial targets it), the disabled Save and dashed Discard read as broken, too much meta on rows' right and group heads, one button language, empty editor/Intake canvas.
- **Rounds 2 and 3 of the scoring (`ccb3be1` = round 2 build, `38347f6` = round 3 build).** Blind twins (picks for ours of 28 / mean ours vs Linear): r1 8 / 6.25 vs 7.2; r2 6 / 6.4 vs 7.2; r3 12 / 6.6 vs 6.9 (2 of 4 judges preferred ours overall; issues 4/4, home 3/4; sub-issues, project 0/4). Real screens (mean ours vs Linear): r1 6.85 vs 8.2; r2 6.8 vs 8.05; r3 7.0 vs 8.1 (Intake tied 8-8 with one judge). Round 3's consensus: dark row titles still read bold (500 Inter at #e2e4ea; 450 needs the lint's allow-list, the owner's call); the 14% open-row tint reads as a navy slab on an expanded row and the open run; 3 of 4 scorers want the grey group bands gone (the owner asked for them); popover dividers and select widths; the project twin's label gutter.
- **Round 4 (`5725988`; scorers given Linear's band references).** Blind twins 12/28 for ours, mean ours 7.0 vs Linear 7.1 (2 of 4 judges preferred ours overall; 22/28 picks went to the second image). Real screens mean ours 7.1 vs Linear 8.1 (6.8, 6.9, 7.1, 7.5 vs 8.0, 8.0, 8.0, 8.5); bands now praised as well judged. Consensus next: dark row titles to regular (all scorers; 450 needs the lint), inline subtitles smaller/dimmer, drop the list glyph on repo bands, popovers lift more in the dark, column heads over their columns, drop normal priority's dots, run states beside their steps, ID tracking, History/Used-by lines.
- **Rounds 5–7 (owner: "do another 3 iterations… come back after the backend is in better shape").** Builds: r5 `4cad415`, r6 `adaa9c8`, r7 `64c804d`; shots `q19`/`q21`/`q23`, blind `h2h/s5/m17..m19`, scored `score5..7`.
  - Blind twins (picks for ours of 28 / mean ours vs Linear): r5 13 / 6.9 vs 6.8 (first time ahead on mean); r6 7 / 6.6 vs 7.1; r7 9 / 6.4 vs 7.0. j1 (ours as A) is the harshest every round (0/7 in r6 and r7); the second-position bias still dominates, so ±4 picks between rounds is judge noise.
  - Real screens (mean ours vs Linear): r5 7.15 vs 8.1; r6 7.05 vs 8.1; r7 7.1 vs 8.1 (7.1, 7.4, 7.0, 6.9 vs 8.0, 8.1, 8.2, 8.0). A plateau since r3: per-token tweaks no longer move it.
  - What the rounds did: r5 dark medium titles regular, quieter trailing words, normal priority blank; r6 a row's title alone (trailing words in its tooltip), plain pickers among facts, firmer dark popover edge, display twin on form rows; r7 page/document titles medium, normal priority faint again, row faces one slate, row primary as accent words.
  - Judges flip on details: normal priority blank (r6: ragged gutter) vs faint (r7: fade it or drop it); slate faces read as identical grey discs (r7), coloured ones as noise (r6); boxed Approve read loud (r6), plain words lost among grey (r7).
  - The stable gap (every r6/r7 scorer), structural, not tokens: (1) a row's right end: fixed headed columns, one format each, one primary per view; (2) containment: the workflow editor's stage cards, dashed card and loop bracket, the runs card in a card, the ticket's stage-track card; (3) type scale: metadata as bright and near the size of titles, group heads no stronger than rows; (4) sparse canvases (agent editor's narrow column, Intake's empty half); (5) small popovers with little lift, no shortcut hints. Blind twins: the project twin's "10 teams" wrap, the sub-issues diamond off the baseline, display popover values fading into their labels.
  - Paused here, at the owner's word. Weight 450 for dark titles needs the lint's allow-list: the owner's call.
