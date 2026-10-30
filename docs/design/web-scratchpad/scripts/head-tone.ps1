# Head: every group's count in the one quiet ink (the glyph says the state); the tone prop goes.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
$edits = [ordered]@{
  "kit\Head.tsx" = @(
    @("  /** The group's state: its count says it (you: Needs you, in the accent; live, blocked, done a`n   *  step firmer in ink). The heading keeps one look and the name in ink. */`n  tone?: `"neutral`" | `"you`" | `"live`" | `"blocked`" | `"done`";`n", ""),
    @("  tone: NonNullable<HeadProps[`"tone`"]>;`n", ""),
    @("function Title({ name, count, icon, tone, note }: TitleProps) {", "/** The count in the one quiet ink, whatever the group: its glyph says the state. */`nfunction Title({ name, count, icon, note }: TitleProps) {"),
    @("        <Badge kind=`"count`" tone={tone}>", "        <Badge kind=`"count`">"),
    @("  const { name, count, icon, tone = `"neutral`", note, summary, level = `"group`", fold } = props;", "  const { name, count, icon, note, summary, level = `"group`", fold } = props;"),
    @("    <Title name={name} count={count} icon={icon} tone={tone} note={inFold ? noteEl : null} />", "    <Title name={name} count={count} icon={icon} note={inFold ? noteEl : null} />")
  )
  "features\compact\CompactView.tsx" = @(
    @("/** A group's count takes its state's hue (its band stays grey): the ones that call for a look; the`n *  waiting ones stay ink. */`nconst TONE: Record<Group, `"neutral`" | `"you`" | `"live`" | `"blocked`" | `"done`"> = {`n  needs_you: `"you`",`n  blocked: `"blocked`",`n  running: `"live`",`n  queued: `"neutral`",`n  waiting: `"neutral`",`n  inbox: `"neutral`",`n  done: `"done`",`n};`n`n", ""),
    @("                tone={TONE[g.id]}`n", "")
  )
  "features\queue\QueueView.tsx" = @(
    @("            tone=`"you`"`n", ""),
    @("            tone=`"live`"`n", ""),
    @("          tone=`"done`"`n", "")
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
# the ledger: drop Head's tone entry
$l = "C:\code\AgentOS-V2-web\web\src\kit\ledger.json"
$j = [IO.File]::ReadAllText($l)
$start = $j.IndexOf("`"tone`"", $j.IndexOf("`"Head`": {"))
$head = $j.IndexOf("`"Head`": {")
$next = $j.IndexOf("`"note`"", $head)
if ($start -lt 0 -or $next -lt $start) { throw "ledger: Head tone not before note" }
$lineStart = $j.LastIndexOf("`n", $start) + 1
$noteLine = $j.LastIndexOf("`n", $next) + 1
"ledger removes:"
$j.Substring($lineStart, $noteLine - $lineStart)
[IO.File]::WriteAllText($l, $j.Remove($lineStart, $noteLine - $lineStart))
