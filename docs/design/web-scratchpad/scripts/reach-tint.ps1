# One reach for a list's heads and rows, and Chip's tint. Exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
$edits = [ordered]@{
  "kit\Row.module.css" = @(
    @("/* lists: a line, an item and a triage row are flat: the rhythm and the room above each group part`n   the rows. Their words stand on the list's column edge; their wash (hover, open) is a rounded`n   patch reaching --list-in past it. No card, nothing moves */", "/* lists: a line, an item and a triage row are flat: the rhythm and the room above each group part`n   the rows. Their words stand on the list's column edge; what lies under them (a hover's wash, the`n   open card, the hairline between rows) is square and runs --list-reach past them, the same reach`n   as their group's band, so a list's heads and rows always meet the same edges. Nothing moves */"),
    @("  position: absolute;`n  inset: 0 var(--list-pad);`n  border-radius: var(--r-3);`n  transition: background-color var(--dur-fast) ease;`n}", "  position: absolute;`n  inset: 0 var(--list-reach);`n  transition: background-color var(--dur-fast) ease;`n}"),
    @("/* a list out at the sheet's edges (Table edge) rules its rows apart with a faint hairline under`n   their words, so a wide row reads as one line; a lit patch hides the ones at its edges */", "/* a list out at the sheet's edges (Table edge) rules its rows apart with a faint hairline across its`n   reach, so a wide row reads as one line; a lit row hides the ones at its edges */"),
    @("  top: 0;`n  inset-inline: var(--list-inset);`n  height: var(--line-1);`n  background: var(--row-rule, transparent);", "  top: 0;`n  inset-inline: var(--list-reach);`n  height: var(--line-1);`n  background: var(--row-rule, transparent);"),
    @("/* selected rows one after another join into one patch */`n.row.open:has(+ .open)::before {`n  border-bottom-left-radius: 0;`n  border-bottom-right-radius: 0;`n}`n.row.open + .open::before {`n  border-top-left-radius: 0;`n  border-top-right-radius: 0;`n}`n", "")
  )
  "kit\Head.module.css" = @(
    ,@("  inset: 0 var(--band-out);", "  inset: 0 var(--list-reach);")
  )
  "kit\Table.module.css" = @(
    ,@("  --band-out: 0;", "  --list-reach: 0;")
  )
  "kit\Page.module.css" = @(
    ,@("  --band-out: 0;", "  --list-reach: 0;")
  )
  "kit\tokens.css" = @(
    @("  /* how far a group's band runs past its head: to the sheet's edges */`n  --band-out: calc(var(--gutter) * -1);", "  /* how far a list's heads and rows lie past their own box: to the sheet's edges (a Table edge is`n     already there) */`n  --list-reach: calc(var(--gutter) * -1);"),
    @("  --chip-firm: transparent;`n  --chip-firm-edge: var(--rule-strong);`n  /* a card's edge as Linear's", "  --chip-firm: transparent;`n  --chip-firm-edge: var(--rule-strong);`n  --chip-tint: 12%;`n  /* a card's edge as Linear's"),
    @("  --chip-firm: var(--raised);`n  --chip-firm-edge: var(--rule-strong);", "  --chip-firm: var(--raised);`n  --chip-firm-edge: var(--rule-strong);`n  /* a tinted tag's wash: its hue this strong over what it sits on (Linear's resources) */`n  --chip-tint: 10%;")
  )
  "kit\Chip.module.css" = @(
    ,@(".chip[data-tone=`"blocked`"] {", "/* tint: a hue washed into the tag, no edge, the glyph in the hue and the words in full ink (Linear's`n   resources); neutral is the same wash of the theme's grey */`n.chip[data-tint] {`n  background: color-mix(in srgb, var(--tint) var(--tint-mix, var(--chip-tint)), transparent);`n  box-shadow: none;`n  color: var(--ink-1);`n}`n.chip[data-tint] .lead {`n  color: var(--tint);`n}`n.chip[data-tint=`"neutral`"] {`n  --tint: var(--wash, var(--ink-1));`n  --tint-mix: calc(var(--chip-tint) / 2);`n}`n.chip[data-tint=`"neutral`"] .lead {`n  color: var(--prop-mark);`n}`n.chip[data-tint=`"indigo`"] {`n  --tint: var(--kind-workflow);`n}`n.chip[data-tint=`"teal`"] {`n  --tint: var(--kind-agent);`n}`n.chip[data-tint=`"amber`"] {`n  --tint: var(--kind-skill);`n}`n.chip[data-tone=`"blocked`"] {")
  )
  "kit\Chip.tsx" = @(
    @("/** A state's hue for a chip's dot. */`nexport type ChipDot = `"neutral`" | `"live`" | `"you`" | `"blocked`" | `"done`";", "/** A state's hue for a chip's dot. */`nexport type ChipDot = `"neutral`" | `"live`" | `"you`" | `"blocked`" | `"done`";`n`n/** A hue washed into a tag, how strong set by the theme (--chip-tint). */`nexport type ChipTint = `"neutral`" | `"indigo`" | `"teal`" | `"amber`";"),
    @("  /** Just added: scroll it into view and flash it once, when it mounts. */`n  flash?: boolean;`n}", "  /** Just added: scroll it into view and flash it once, when it mounts. */`n  flash?: boolean;`n  /** A hue washed into it, no edge, its glyph in the hue (Linear's resources). */`n  tint?: ChipTint;`n}"),
    @("function flags({ lead, onRemove, flash, tone = `"line`" }: ChipProps) {", "function flags({ lead, onRemove, flash, tint, tone = `"line`" }: ChipProps) {"),
    @("    `"data-tone`": tone,", "    `"data-tone`": tone,`n    `"data-tint`": tint,")
  )
  "kit\index.ts" = @(
    ,@("export { Chip, type ChipDot, type ChipProps } from `"./Chip`";", "export { Chip, type ChipDot, type ChipProps, type ChipTint } from `"./Chip`";")
  )
  "kit\ledger.json" = @(
    ,@("        `"after`": {`n          `"why`": `"Quieter, after the words: a step count (Compact's Now tag), or a caret or an outward arrow (the project twin's labels and links).`"`n        }", "        `"after`": {`n          `"why`": `"Quieter, after the words: a step count (Compact's Now tag), or a caret or an outward arrow (the project twin's labels and links).`"`n        },`n        `"tint`": {`n          `"why`": `"A hue washed into the tag, no edge, its glyph in the hue and its words in full ink, as Linear marks a project's resources by kind; how strong is the theme's (--chip-tint).`",`n          `"values`": {`n            `"neutral`": `"The theme's grey at half the strength: a resource of no kind of its own (a doc, a link).`",`n            `"indigo`": `"The workflow kind's hue: the project twin's launch plans.`",`n            `"teal`": `"The agent kind's hue: the project twin's spec.`",`n            `"amber`": `"The skill kind's hue: the project twin's approvals and sign-up lists.`"`n          }`n        }")
  )
  "features\sheet\twins\project.tsx" = @(
    @("const RESOURCES: readonly { label: string; lead: IconName; out?: boolean }[] = [`n  { label: `"Key Features`", lead: `"feature`" },`n  { label: `"PRD/Spec`", lead: `"files`" },`n  { label: `"Approval Chain`", lead: `"gate`" },`n  { label: `"Private Beta Sign Up List`", lead: `"compact`" },`n  { label: `"figma.com`", lead: `"link`", out: true },`n  { label: `"Launch Run of Show`", lead: `"feature`" },`n  { label: `"Launch Run of Show`", lead: `"feature`" },`n  { label: `"Launch Run of Show`", lead: `"feature`" },`n  { label: `"Jobs to Be Done`", lead: `"files`" },`n  { label: `"Marketing Comms`", lead: `"files`" },`n  { label: `"Project spec`", lead: `"files`" },`n  { label: `"Project spec`", lead: `"files`" },", "// Linear washes each resource in its kind's hue: the launch plans indigo, the spec teal, the approvals`n// and the sign-up list amber, the rest its grey`nconst RESOURCES: readonly { label: string; lead: IconName; tint: ChipTint; out?: boolean }[] = [`n  { label: `"Key Features`", lead: `"feature`", tint: `"indigo`" },`n  { label: `"PRD/Spec`", lead: `"files`", tint: `"teal`" },`n  { label: `"Approval Chain`", lead: `"gate`", tint: `"amber`" },`n  { label: `"Private Beta Sign Up List`", lead: `"compact`", tint: `"amber`" },`n  { label: `"figma.com`", lead: `"link`", tint: `"neutral`", out: true },`n  { label: `"Launch Run of Show`", lead: `"feature`", tint: `"indigo`" },`n  { label: `"Launch Run of Show`", lead: `"feature`", tint: `"indigo`" },`n  { label: `"Launch Run of Show`", lead: `"feature`", tint: `"indigo`" },`n  { label: `"Jobs to Be Done`", lead: `"files`", tint: `"neutral`" },`n  { label: `"Marketing Comms`", lead: `"files`", tint: `"neutral`" },`n  { label: `"Project spec`", lead: `"files`", tint: `"neutral`" },`n  { label: `"Project spec`", lead: `"files`", tint: `"neutral`" },"),
    @("                    <Chip key={i} lead={r.lead} label={r.label} after={{ text: `"↗`" }} />", "                    <Chip key={i} tint={r.tint} lead={r.lead} label={r.label} after={{ text: `"↗`" }} />"),
    @("                    <Chip key={i} lead={r.lead} label={r.label} />", "                    <Chip key={i} tint={r.tint} lead={r.lead} label={r.label} />")
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
