# Round 7: titles at medium (a page's, a document's); normal priority a faint glyph again (a fixed
# slot on every row); a row's faces one neutral slate; a row's primary its accent words alone at
# rest. Exact replacements, each must match once.
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
Apply "kit\Page.module.css" @(
  ,@("  font-size: var(--fs-6);`n  font-weight: 600;", "  font-size: var(--fs-6);`n  font-weight: 500;")
)
Apply "kit\Text.module.css" @(
  ,@(".display {`n  font-size: var(--fs-ticket);`n  font-weight: 600;", ".display {`n  font-size: var(--fs-ticket);`n  font-weight: 500;")
)
Apply "kit\Form.module.css" @(
  ,@("  font-size: var(--fs-ticket);`n  font-weight: 600;", "  font-size: var(--fs-ticket);`n  font-weight: 500;")
)
Apply "kit\tokens.css" @(
  @("  --priority-none: transparent; /* normal priority: nothing drawn, its room kept so keys line up */", "  --priority-none: color-mix(in srgb, var(--ink-1) 18%, transparent); /* normal: faint, every row's slot kept */"),
  @("  --id-violet-row: color-mix(in srgb, var(--id-violet) var(--face-id), var(--page));`n  --id-blue-row: color-mix(in srgb, var(--id-blue) var(--face-id), var(--page));`n  --id-rose-row: color-mix(in srgb, var(--id-rose) var(--face-id), var(--page));`n  --id-teal-row: color-mix(in srgb, var(--id-teal) var(--face-id), var(--page));", "  /* in a row every face is the one neutral slate (a list's colour belongs to its states); the hues`n     stay where a face stands for a voice (a thread, a picker's own row) */`n  --id-violet-row: var(--id-slate-row);`n  --id-blue-row: var(--id-slate-row);`n  --id-rose-row: var(--id-slate-row);`n  --id-teal-row: var(--id-slate-row);")
)
Apply "kit\Button.module.css" @(
  ,@("/* outline: a primary in a list's line (Approve in My queue): the accent's words on the control's face`n   inside an edge of the accent, so the row says act here without being the loudest thing on the`n   page; under the pointer the accent's soft wash */`n.outline {`n  border-color: var(--you-edge);`n  color: var(--you-text);`n}", "/* outline: a primary in a list's line (Approve in My queue): the accent's words alone at rest, an`n   inline action, so the row says act here without a box; under the pointer its edge and the`n   accent's soft wash */`n.outline {`n  border-color: transparent;`n  background: none;`n  color: var(--you-text);`n}")
)
Apply "kit\ledger.json" @(
  ,@("`"outline`": `"A primary in a list's line (Approve in My queue's Your move): the accent's words inside an edge of the accent, so the row still says act here without being the page's loudest thing.`"", "`"outline`": `"A primary in a list's line (Approve, Retry in My queue): the accent's words alone at rest, an inline action, its edge and soft wash under the pointer, so the row still says act here without a box.`"")
)
