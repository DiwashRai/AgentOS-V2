# Round 5: a medium title sets regular on Carbon; a row's trailing words a size down; no list glyph
# on a repo band; Carbon's popover a clearer step up; normal priority draws nothing; a key's digits
# proportional; a run stage's state beside its name. Exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
function Apply($rel, $pairs) {
  $path = Join-Path $web $rel
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $pairs) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$rel matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  }
  foreach ($p in $pairs) { $t = $t.Replace($p[0], $p[1]) }
  [IO.File]::WriteAllText($path, $t)
  "ok $rel"
}
Apply "kit\Text.module.css" @(
  ,@(".text[data-weight=`"600`"] {", "/* light on dark reads a weight heavier: on Carbon a medium title and a label set regular, so a row's`n   title leads by its ink, not by reading bold (a group's name keeps its medium, and its rank) */`n:global([data-theme=`"dark`"]) :is(.text[data-weight=`"500`"], .label) {`n  font-weight: 400;`n}`n.text[data-weight=`"600`"] {")
)
Apply "kit\Badge.module.css" @(
  ,@("  font-weight: 400;`n  font-variant-numeric: tabular-nums;`n  letter-spacing: var(--track-snug);`n  line-height: 1;", "  font-weight: 400;`n  letter-spacing: var(--track-snug);`n  line-height: 1;")
)
Apply "kit\tokens.css" @(
  @("  --pop: color-mix(in srgb, var(--wash) 6%, var(--page));", "  --pop: color-mix(in srgb, var(--wash) 9%, var(--page));"),
  @("  --priority-none: color-mix(in srgb, var(--ink-1) 34%, transparent);", "  --priority-none: transparent; /* normal priority: nothing drawn, its room kept so keys line up */")
)
Apply "features\compact\TicketLine.tsx" @(
  ,@("        {after ? ``\u2002`${after}`` : null}", "        {after ? (`n          <Text variant=`"meta`" tone=`"3`">`n            {``\u2002`${after}``}`n          </Text>`n        ) : null}")
)
Apply "features\teams\TeamsView.tsx" @(
  @("        summary={<OpenList repo={g.repo} />}`n", ""),
  @("/** A repo's group: its head (the repo, how many in flight, its path and people, its list), then a`n *  line per ticket. */", "/** A repo's group: its head (the repo, how many in flight, its path and people), then a line per`n *  ticket. */")
)
Apply "features\ticket\RunsTab.tsx" @(
  @("  { label: `"Stage`", width: `"lg`" },`n  { label: `"Round`", width: `"fill`" },`n  { label: `"Verdict`", width: `"md`", end: true },", "  { label: `"Stage`", width: `"lg`" },`n  { label: `"Verdict`", width: `"md`" },`n  { label: `"Round`", width: `"fill`" },"),
  @("      </Stack>`n      {of === null ? (`n        <Text variant=`"meta`">{`"`"}</Text>`n      ) : (", "      </Stack>`n      <Verdict s={s} />`n      {of === null ? (`n        <Text variant=`"meta`">{`"`"}</Text>`n      ) : ("),
  @("          </Text>`n        </Stack>`n      )}`n      <Verdict s={s} />`n    </Row>", "          </Text>`n        </Stack>`n      )}`n    </Row>")
)
