# Surface float: a panel open over the page takes the popover's lift again (the blind judges: the
# twins' popovers read flat and wireframe-like once the sheet lost its shadow).
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
$edits = [ordered]@{
  "kit\Surface.tsx" = @(
    ,@("  /** recess: the one zone per view, flush on the sheet; sheet: a panel of tone held over it (a`n   *  hairline, a soft shadow); list: a section of a view under its own head (a zone of My queue,`n   *  an Intake query), no card, parted from the one before by room and a hairline. */`n  level?: `"recess`" | `"sheet`" | `"list`";", "  /** recess: the one zone per view, flush on the sheet; sheet: a card on it (a faint tone in a`n   *  hairline, no shadow); float: a panel open over the page (an options panel), the popover's own`n   *  surface, hairline and soft shadow; list: a section of a view under its own head (a zone of My`n   *  queue, an Intake query), no card, parted from the one before by room. */`n  level?: `"recess`" | `"sheet`" | `"float`" | `"list`";")
  )
  "kit\Surface.module.css" = @(
    ,@("/* a sheet inside a sheet (a message, a change in an agent's panel) lies flat, a clear step lighter, as", "/* float: a panel open over the page (an options panel from a bar's button): the popover's surface,`n   its hairline and its soft shadow, the one card that lifts, because it floats */`n.float {`n  --ground: var(--pop);`n  --well: var(--nest);`n  background: var(--pop);`n  border-radius: var(--r-4);`n  box-shadow:`n    0 0 0 var(--line-1) var(--pop-edge),`n    var(--pop-shadow);`n}`n/* a sheet inside a sheet (a message, a change in an agent's panel) lies flat, a clear step lighter, as")
  )
  "kit\ledger.json" = @(
    ,@("            `"sheet`": `"A card on the page, a faint step of tone inside a hairline, no shadow (Linear's options panels, its comment cards, its agent panel and latest-update card).`",", "            `"sheet`": `"A card on the page, a faint step of tone inside a hairline, no shadow (Linear's comment cards, its agent panel and latest-update card).`",`n            `"float`": `"A panel open over the page, Linear's options panels (the display and sub-issues twins' Display): the popover's surface, hairline and soft shadow, since it floats.`",")
  )
  "features\sheet\twins\subissues.tsx" = @(
    ,@("    <Surface level=`"sheet`" pad={8}>", "    <Surface level=`"float`" pad={8}>")
  )
  "features\sheet\twins\display.tsx" = @(
    ,@("          <Surface level=`"sheet`" pad={7} parts label=`"Display options`">", "          <Surface level=`"float`" pad={7} parts label=`"Display options`">")
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
