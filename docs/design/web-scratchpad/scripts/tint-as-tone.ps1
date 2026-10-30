# Fold Chip's tint into its tone (the prop budget), and move the mixes into tokens.css.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
$edits = [ordered]@{
  "kit\Chip.tsx" = @(
    @("/** A hue washed into a tag, how strong set by the theme (--chip-tint). */", "/** A hue washed into a tag (a tone of its own), how strong set by the theme (--chip-tint). */"),
    @("  /** line: a faint fill, no outline (the default; in a list's row, the same fill as a pill); fill: a firmer fill (a stage's phase); edge: a round pill of the same fill (a board card's state, Linear's`n   *  card pill); blocked: the words in the blocked ink (a conflict). */`n  tone?: `"line`" | `"fill`" | `"edge`" | `"blocked`";", "  /** line: a faint fill, no outline (the default; in a list's row, the same fill as a pill); fill: a firmer fill (a stage's phase); edge: a round pill of the same fill (a board card's state, Linear's`n   *  card pill); blocked: the words in the blocked ink (a conflict); a ChipTint: a hue washed into it,`n   *  no edge, its glyph in the hue (Linear's resources). */`n  tone?: `"line`" | `"fill`" | `"edge`" | `"blocked`" | ChipTint;"),
    @("  /** Just added: scroll it into view and flash it once, when it mounts. */`n  flash?: boolean;`n  /** A hue washed into it, no edge, its glyph in the hue (Linear's resources). */`n  tint?: ChipTint;`n}", "  /** Just added: scroll it into view and flash it once, when it mounts. */`n  flash?: boolean;`n}"),
    @("function flags({ lead, onRemove, flash, tint, tone = `"line`" }: ChipProps) {", "function flags({ lead, onRemove, flash, tone = `"line`" }: ChipProps) {"),
    @("    `"data-tone`": tone,`n    `"data-tint`": tint,", "    `"data-tone`": tone,")
  )
  "kit\Chip.module.css" = @(
    ,@("/* tint: a hue washed into the tag, no edge, the glyph in the hue and the words in full ink (Linear's`n   resources); neutral is the same wash of the theme's grey */`n.chip[data-tint] {`n  background: color-mix(in srgb, var(--tint) var(--tint-mix, var(--chip-tint)), transparent);`n  box-shadow: none;`n  color: var(--ink-1);`n}`n.chip[data-tint] .lead {`n  color: var(--tint);`n}`n.chip[data-tint=`"neutral`"] {`n  --tint: var(--wash, var(--ink-1));`n  --tint-mix: calc(var(--chip-tint) / 2);`n}`n.chip[data-tint=`"neutral`"] .lead {`n  color: var(--prop-mark);`n}`n.chip[data-tint=`"indigo`"] {`n  --tint: var(--kind-workflow);`n}`n.chip[data-tint=`"teal`"] {`n  --tint: var(--kind-agent);`n}`n.chip[data-tint=`"amber`"] {`n  --tint: var(--kind-skill);`n}", "/* a tint: a hue washed into the tag, no edge, the glyph in the hue and the words in full ink (Linear's`n   resources); neutral is the same wash of the theme's grey, its glyph muted */`n.chip:is([data-tone=`"neutral`"], [data-tone=`"indigo`"], [data-tone=`"teal`"], [data-tone=`"amber`"]) {`n  background: var(--tint);`n  box-shadow: none;`n  color: var(--ink-1);`n}`n.chip[data-tone=`"neutral`"] {`n  --tint: var(--chip-tint-neutral);`n}`n.chip[data-tone=`"indigo`"] {`n  --tint: var(--chip-tint-indigo);`n}`n.chip[data-tone=`"teal`"] {`n  --tint: var(--chip-tint-teal);`n}`n.chip[data-tone=`"amber`"] {`n  --tint: var(--chip-tint-amber);`n}`n.chip[data-tone=`"neutral`"] .lead {`n  color: var(--prop-mark);`n}`n.chip[data-tone=`"indigo`"] .lead {`n  color: var(--kind-workflow);`n}`n.chip[data-tone=`"teal`"] .lead {`n  color: var(--kind-agent);`n}`n.chip[data-tone=`"amber`"] .lead {`n  color: var(--kind-skill);`n}")
  )
  "kit\tokens.css" = @(
    ,@("  --chip-firm-edge: transparent;`n", "  --chip-firm-edge: transparent;`n  /* a tinted tag (Linear's resources): a kind's hue at the theme's strength over what it sits on;`n     neutral the theme's grey at half */`n  --chip-tint-indigo: color-mix(in srgb, var(--kind-workflow) var(--chip-tint), transparent);`n  --chip-tint-teal: color-mix(in srgb, var(--kind-agent) var(--chip-tint), transparent);`n  --chip-tint-amber: color-mix(in srgb, var(--kind-skill) var(--chip-tint), transparent);`n  --chip-tint-neutral: color-mix(in srgb, var(--wash) calc(var(--chip-tint) / 2), transparent);`n")
  )
  "kit\ledger.json" = @(
    @("            `"blocked`": `"The words in the blocked ink: a conflict.`"`n          }", "            `"blocked`": `"The words in the blocked ink: a conflict.`",`n            `"neutral`": `"A tint, the theme's grey at half the strength: a resource of no kind of its own (a doc, a link).`",`n            `"indigo`": `"A tint, the workflow kind's hue washed into it with no edge, its glyph in the hue, as Linear marks a project's resources by kind: the project twin's launch plans.`",`n            `"teal`": `"A tint, the agent kind's hue: the project twin's spec.`",`n            `"amber`": `"A tint, the skill kind's hue: the project twin's approvals and sign-up lists.`"`n          }"),
    @(",`n        `"tint`": {`n          `"why`": `"A hue washed into the tag, no edge, its glyph in the hue and its words in full ink, as Linear marks a project's resources by kind; how strong is the theme's (--chip-tint).`",`n          `"values`": {`n            `"neutral`": `"The theme's grey at half the strength: a resource of no kind of its own (a doc, a link).`",`n            `"indigo`": `"The workflow kind's hue: the project twin's launch plans.`",`n            `"teal`": `"The agent kind's hue: the project twin's spec.`",`n            `"amber`": `"The skill kind's hue: the project twin's approvals and sign-up lists.`"`n          }`n        }", "")
  )
  "features\sheet\twins\project.tsx" = @(
    @("<Chip key={i} tint={r.tint} lead={r.lead} label={r.label} after={{ text: `"↗`" }} />", "<Chip key={i} tone={r.tint} lead={r.lead} label={r.label} after={{ text: `"↗`" }} />"),
    @("<Chip key={i} tint={r.tint} lead={r.lead} label={r.label} />", "<Chip key={i} tone={r.tint} lead={r.lead} label={r.label} />")
  )
}
foreach ($f in $edits.Keys) {
  $path = Join-Path $web $f
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $edits[$f]) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$f matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  }
  foreach ($p in $edits[$f]) { $t = $t.Replace($p[0], $p[1]) }
  [IO.File]::WriteAllText($path, $t)
  "ok $f"
}
