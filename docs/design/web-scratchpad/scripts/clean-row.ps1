# The cleanup: Row's unused triage kind. Exact replacements, each must match once.
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
Apply "kit\Row.tsx" @(
  @("// One item of a list: its cells on the Table's columns. A line, an item and a triage row are flat,", "// One item of a list: its cells on the Table's columns. A line and an item are flat,"),
  @("two-line row (a ticket's context); triage: a tight two-line row led by a face (Intake); rack:`n   *  a bare entry (a run's stage). */`n  kind?: `"line`" | `"item`" | `"triage`" | `"rack`";", "two-line row (a ticket's context); rack: a bare entry (a run's stage). */`n  kind?: `"line`" | `"item`" | `"rack`";")
)
Apply "kit\Row.module.css" @(
  @("/* lists: a line, an item and a triage row are flat:", "/* lists: a line and an item are flat:"),
  @(".line,`n.item,`n.triage {`n  border-radius: 0;`n}", ".line,`n.item {`n  border-radius: 0;`n}"),
  @(".row:is(.line, .item, .triage)::before {", ".row:is(.line, .item)::before {"),
  @(".row:is(.line, .item, .triage) + .row:is(.line, .item, .triage)::after {", ".row:is(.line, .item) + .row:is(.line, .item)::after {"),
  @(".row:is(.line, .item, .triage):is(:hover, :has(:focus-visible))::before {", ".row:is(.line, .item):is(:hover, :has(:focus-visible))::before {"),
  @(".row:is(.line, .item, .triage):has(.hit:focus-visible) {", ".row:is(.line, .item):has(.hit:focus-visible) {"),
  @(".row:is(.line, .item, .triage):has(.hit:focus-visible)::before {", ".row:is(.line, .item):has(.hit:focus-visible)::before {"),
  @(".line > .inner,`n.item > .inner,`n.triage > .inner {", ".line > .inner,`n.item > .inner {"),
  @(".triage > .inner {`n  min-height: var(--h-triage);`n  padding: var(--sp-3) var(--list-end, var(--list-inset)) var(--sp-3) var(--list-inset);`n}`n", "")
)
