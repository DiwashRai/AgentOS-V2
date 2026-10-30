# The style pass from the two reviews (opus.md, codex.md): exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$kit = "C:\code\AgentOS-V2-web\web\src\kit"
$edits = [ordered]@{
  "Head.module.css" = @(
    ,@("  inset: 0 var(--list-pad);`n  border-radius: var(--r-3);`n  background: var(--group-band);", "  inset: 0 var(--list-pad);`n  border-radius: var(--r-2);`n  background: var(--group-band);")
  )
  "Row.module.css" = @(
    ,@(".row:is(.line, .item).open::before {`n  background: var(--list-open);`n}", "/* open: a card, the sheet's tone inside the card's hairline */`n.row:is(.line, .item).open::before {`n  background: var(--list-open);`n  box-shadow: inset 0 0 0 var(--line-1) var(--card-edge);`n}")
  )
  "Stepper.module.css" = @(
    @("/* the now row: the card's foot, a band a step deeper under the stages edge to edge, so the live run`n   reads as the card's status bar;", "/* the now row: the card's foot, parted from the stages by a hairline edge to edge (the card's own`n   tone, no band), so the live run reads as the card's status bar;"),
    @("  border-radius: 0 0 var(--r-5) var(--r-5);`n  background: var(--fill-1);", "  border-radius: 0 0 var(--r-5) var(--r-5);`n  box-shadow: inset 0 var(--line-1) 0 var(--card-edge);")
  )
  "Popover.module.css" = @(
    @("/* the filter: a real field, full bleed on a step of tone over the rows (no rule), its words on`n   theirs */", "/* the filter: a real field, full bleed on the popover's own tone, a hairline under it, its words on`n   the rows' */"),
    @("  border: 0;`n  border-radius: calc(var(--r-4) - var(--line-1)) calc(var(--r-4) - var(--line-1)) 0 0;`n  background: var(--fill-1);", "  border: 0;`n  border-bottom: var(--line-1) solid var(--pop-rule);`n  border-radius: calc(var(--r-4) - var(--line-1)) calc(var(--r-4) - var(--line-1)) 0 0;`n  background: none;")
  )
  "Thread.module.css" = @(
    ,@("  border-radius: var(--r-4);`n  background: var(--tk-mine);", "  border-radius: var(--r-4);`n  background: var(--tk-mine);`n  box-shadow: inset 0 0 0 var(--line-1) var(--card-edge);")
  )
  "Frame.module.css" = @(
    @("/* the frame: two planes and no line.", "/* the frame: two planes and one line, the sheet's rim."),
    @("  border-radius: var(--r-5);`n  background: var(--page);`n  overflow-y: auto;`n}", "  border-radius: var(--r-5);`n  background: var(--page);`n  outline: var(--line-1) solid var(--sheet-rim);`n  overflow-y: auto;`n}"),
    @(".create {`n  border-radius: 50%;`n  background: var(--fill-2);", "/* compose: a circle on a hairline (Linear's), no disc of grey */`n.create {`n  border-radius: 50%;`n  background: none;`n  box-shadow: inset 0 0 0 var(--line-1) var(--rule-strong);")
  )
  "Segmented.module.css" = @(
    ,@(".pill:is([aria-pressed=`"true`"], [data-current=`"true`"]) {`n  background: var(--you-soft);`n  color: var(--you-text);`n}", "/* pressed: a control's face on a firm hairline, its words in full ink, the accent in its count alone */`n.pill:is([aria-pressed=`"true`"], [data-current=`"true`"]) {`n  border-color: var(--rule-strong);`n  background: var(--ctl);`n  color: var(--ink-1);`n}")
  )
  "Icon.module.css" = @(
    ,@(".icon.quiet {`n  color: var(--ink-3);", ".icon.quiet {`n  color: var(--kind, var(--ink-3));")
  )
  "Button.module.css" = @(
    ,@(".btn:hover {`n  background: var(--ctl-lift);`n}", ".btn:hover {`n  border-color: var(--ctl-edge-hover);`n  background: var(--ctl-lift);`n}")
  )
  "Form.module.css" = @(
    @(".box:hover {`n  background: var(--fill-3);`n}", ".box:hover {`n  border-color: var(--ctl-edge-hover);`n  background: var(--input-hover);`n}"),
    @(".search:hover {`n  background: var(--fill-3);`n}", ".search:hover {`n  background: var(--input-hover);`n  box-shadow: inset 0 0 0 var(--line-1) var(--ctl-edge-hover);`n}"),
    @("  background: var(--switch-off);`n  transition: background-color var(--dur-fast) ease;`n}", "  background: var(--switch-off);`n  box-shadow: inset 0 0 0 var(--line-1) var(--switch-edge);`n  transition: background-color var(--dur-fast) ease;`n}"),
    @(".switch[aria-checked=`"true`"] {`n  background: var(--you);`n}", ".switch[aria-checked=`"true`"] {`n  background: var(--you);`n  box-shadow: none;`n}")
  )
  "Notice.module.css" = @(
    @("  border-radius: var(--r-4);`n  background: var(--card-problem);`n}", "  border-radius: var(--r-4);`n  box-shadow: inset 0 0 0 var(--line-1) var(--problem-edge);`n}"),
    @("  border-radius: 50%;`n  background: var(--list-band);`n  font-size: var(--fs-1);", "  border-radius: 50%;`n  box-shadow: inset 0 0 0 var(--line-1) var(--rule-strong);`n  font-size: var(--fs-1);")
  )
}
foreach ($f in $edits.Keys) {
  $path = Join-Path $kit $f
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $edits[$f]) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$f matched $n times: $($p[0].Substring(0, [Math]::Min(60, $p[0].Length)))" }
    $t = $t.Replace($p[0], $p[1])
  }
  [IO.File]::WriteAllText($path, $t)
  "ok $f"
}
