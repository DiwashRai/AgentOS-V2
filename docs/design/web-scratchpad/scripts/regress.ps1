# The owner's regressions: the runs card's corners, the off stage's dashes and the lane under it, the
# agent panel's inner contrast. Exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$kit = "C:\code\AgentOS-V2-web\web\src\kit"
$edits = [ordered]@{
  "Card.module.css" = @(
    @("/* a disabled stage: no tone, a dashed outline alone (the card's only line), dimmed */`n.card[data-look=`"stage`"][data-off]:not([data-open]) {`n  --ground: var(--page);`n  background: none;`n}", "/* a disabled stage: the sheet's own ground, opaque like every card, so the lane's line stops at its`n   edge and never runs through it; no tone and no hairline, a dashed outline alone (the card's only`n   line, in a skipped stage's dashes), dimmed */`n.card[data-look=`"stage`"][data-off]:not([data-open]) {`n  --ground: var(--page);`n  background: var(--page);`n  box-shadow: none;`n}"),
    @("  outline: var(--line-1) dashed var(--ctl-edge-hover);`n  outline-offset: calc(var(--line-1) * -1);", "  outline: var(--line-1) dashed var(--tk-skip);`n  outline-offset: calc(var(--line-1) * -1);")
  )
  "tokens.css" = @(
    @("  --nest: color-mix(in srgb, var(--wash) 6%, var(--page));", "  --nest: color-mix(in srgb, var(--wash) 8%, var(--page));"),
    @("  --list-reach: calc(var(--gutter) * -1);", "  --list-reach: calc(var(--gutter) * -1);`n  /* their corners: square where they reach the sheet's edges, round where they stop short of them */`n  --list-radius: 0;")
  )
  "Page.module.css" = @(
    ,@("  --list-reach: 0;", "  --list-reach: 0;`n  --list-radius: var(--r-3);")
  )
  "Row.module.css" = @(
    ,@("  inset: 0 var(--list-reach);`n  transition: background-color var(--dur-fast) ease;", "  inset: 0 var(--list-reach);`n  border-radius: var(--list-radius);`n  transition: background-color var(--dur-fast) ease;")
  )
  "Head.module.css" = @(
    ,@("  inset: 0 var(--list-reach);", "  inset: 0 var(--list-reach);`n  border-radius: var(--list-radius);")
  )
  "Surface.module.css" = @(
    @("  --ground: var(--tone-2);`n  --well: var(--page);`n  --thread-rule: var(--card-edge);", "  --ground: var(--tone-2);`n  --well: var(--nest);`n  --thread-rule: var(--card-edge);"),
    @("/* a sheet inside a sheet (a message, a change in an agent's panel) lies flat, a step lighter */", "/* a sheet inside a sheet (a message, a change in an agent's panel) lies flat, a clear step lighter, as`n   its reply box (the well) is: Linear's are about 8 levels over their panel */")
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
