# Round 3, type: Carbon's inks soften and step further apart; medium weight a touch lighter on dark
# (light on dark reads heavier); a document's title clearly over its body.
$ErrorActionPreference = "Stop"
$kit = "C:\code\AgentOS-V2-web\web\src\kit"
$edits = [ordered]@{
  "tokens.css" = @(
    @("  --ink-1: #eceef3;`n  --ink-2: #b7bac6;`n  --ink-3: #aeb2bf;`n  --ink-hover: #d3d6df;", "  --ink-1: #e2e4ea;`n  --ink-2: #a9adb9;`n  --ink-3: #8b909d;`n  --ink-hover: #d0d3db;"),
    @("  --tk-label: color-mix(in srgb, var(--ink-3) 70%, var(--page)); /* dark ink-3 sits near ink-2 */", "  --tk-label: var(--ink-3);`n  /* medium, a touch lighter: light on dark reads a weight heavier, so a row's title still leads`n     without reading bold */`n  --fw-medium: 450;"),
    @("  --tk-label: var(--ink-3); /* a property's head, a section head: clearly under the values */", "  --tk-label: var(--ink-3); /* a property's head, a section head: clearly under the values */`n  /* type: medium, the weight a row's title, a label and a group's name take */`n  --fw-medium: 500;"),
    @("  --fs-ticket: 22px; /* a document's title: the ticket's, an editor's */", "  --fs-ticket: 26px; /* a document's title, the ticket's and an editor's: clearly over its body */")
  )
  "Text.module.css" = @(
    @(".text[data-weight=`"500`"] {`n  font-weight: 500;", ".text[data-weight=`"500`"] {`n  font-weight: var(--fw-medium);")
  )
}
foreach ($f in $edits.Keys) {
  $path = Join-Path $kit $f
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $edits[$f]) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$f matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  }
  foreach ($p in $edits[$f]) { $t = $t.Replace($p[0], $p[1]) }
  [IO.File]::WriteAllText($path, $t)
  "ok $f"
}
# the label variant and a group's name take the same medium
foreach ($f in "Text.module.css", "Head.module.css") {
  $path = Join-Path $kit $f
  $t = [IO.File]::ReadAllText($path)
  $before = ([regex]::Matches($t, "font-weight: 500;")).Count
  "$f has $before literal 500s"
}
