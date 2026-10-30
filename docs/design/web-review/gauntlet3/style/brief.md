# Brief: Linear's design language, and how our kit gets closer to it

You are a design reviewer for AgentOS's web UI, on the branch `web-restyle` in `C:\code\AgentOS-V2-web`. Read files only. Write one file, your report (named at the end). Do not edit anything else, do not run a dev server, do not commit.

## The goal

The owner wants our UI to move a bit closer to Linear's design language. Not in every way, and never by copying Linear's layouts, screens or widgets: ours stay ours. The aim is specific:

- **No greys.** Surfaces, cards, controls and tags should not read as grey slabs.
- **Clearly separate elements without greys or shadows.** Things must still read as distinct parts (a card, a field, a button, a group, a panel), but by the means Linear uses instead: hairlines, very small tonal steps, white on off-white, spacing, type weight and ink, colour in glyphs.

Find the stylistic techniques that get us there. You may also say which looks better, ours or Linear's, per mode, but that is secondary.

## What we have now

Two themes only: **Paper** (light) and **Carbon** (dark).

- Paper: the sheet `#fcfcfd`, the sidebar `#eceef5` (a touch cooler than Linear's Ash `#edeef3`). Cards, popovers, buttons, fields, chips and tags are white on a hairline. Grey is left to a group's band, hover and pressed states, and a few fills.
- Carbon: the sheet `#0f1012` (Linear's dashboard measures `#0f1011`), cards about 3 levels over it on a hairline, no drop shadow except on what floats.

All colours are in `web/src/kit/tokens.css`. Each component's look is in `web/src/kit/<Name>.module.css`. Only the kit renders elements.

## The images

- **Our real screens:** `.review/gauntlet3/q7/screens/<group>/<n>-<name>-<light|dark>.png`. These are 24 shots across My queue, Compact, Intake, All teams, the ticket page, the libraries, the editors and the overlays, in both modes. This is what matters most.
- **Twins:** `.review/gauntlet3/q7/twins/<name>/twin.png` is Linear's own screen redrawn with our kit; `linear.png` is Linear's real one at the same size and crop. The pair isolates the visual language, because the layout and content are the same. Most twins are dark.
- **Linear references:**
  - `.review/linear-bar/*.png` and `.review/linear-bar/more/*.png` are mostly dark. `more/refs.md` describes each one.
  - The light ones: `more/ticket-02-issue-page-light.png`, `more/overlays-02-large-modal-over-app.png` and `01-theme-ash.png`.
  - `.review/linear-bar/light/dash-*.png` show dark UI on a light backdrop.

You can measure pixels:

```
uv run --no-project --with pillow python -I <your script>
```

Hex values beat adjectives.

## Your report

Write it to `.review/gauntlet3/style/<your name>.md`:

1. **Techniques**, most effective first, 6 to 12 of them. For each:
   - what Linear does, with the image and where in it, and measured values where you can;
   - what we do instead;
   - the change in our terms: which token or kit CSS file, and the rough value;
   - which mode it applies to.

   Keep each change small, and about style only, not layout or widgets.
2. **Greys and shadows we still have**: every place in our screens that still reads as a grey slab or relies on a shadow, and how Linear separates the same kind of element.
3. **What not to take from Linear**, if anything: where its way would hurt our screens.
4. **Secondary:** per mode, which reads better now, ours or Linear's, in two or three sentences.

Be concrete and harsh; praise is not useful. When the report is written, end your turn with the single word DONE.
