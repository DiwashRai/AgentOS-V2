# Compact: group heads lose their right-hand summaries; the Now tag is plain words, not a boxed chip.
$ErrorActionPreference = "Stop"
$root = "C:\code\AgentOS-V2-web\web\src\features\compact"
$m = [IO.File]::ReadAllText((Join-Path $root "model.ts"))
$i = $m.IndexOf("/** A group head's right slot. */")
$j = $m.IndexOf("export interface CompactGroup {")
if ($i -lt 0 -or $j -lt $i) { throw "model: summary block not found" }
$m = $m.Remove($i, $j - $i)
$pairs = @(
  @("  items: TicketRow[];`n  summary: Summary;`n}", "  items: TicketRow[];`n}"),
  @("  me: Person | null,`n  now: number,`n  showEmpty: boolean,`n): Section[] {", "  me: Person | null,`n  showEmpty: boolean,`n): Section[] {"),
  @("    if (items.length > 0) {`n      const summary = summaryOf(g, items, me, now);`n      return [`n        { kind: `"group`", group: { id: g, title: GROUP_WORD[g], mark: MARK[g], items, summary } },`n      ];`n    }", "    if (items.length > 0)`n      return [{ kind: `"group`", group: { id: g, title: GROUP_WORD[g], mark: MARK[g], items } }];")
)
foreach ($p in $pairs) {
  if (([regex]::Matches($m, [regex]::Escape($p[0]))).Count -ne 1) { throw "model miss: $($p[0].Substring(0, 40))" }
  $m = $m.Replace($p[0], $p[1])
}
[IO.File]::WriteAllText((Join-Path $root "model.ts"), $m)
"ok model.ts"

$v = [IO.File]::ReadAllText((Join-Path $root "CompactView.tsx"))
$i = $v.IndexOf("function SummaryText({ summary }: { summary: Summary }) {")
$j = $v.IndexOf("`n}`n", $i) + 3
if ($i -lt 0) { throw "view: SummaryText not found" }
$v = $v.Remove($i, $j - $i)
$pairs = @(
  @("                summary={<SummaryText summary={g.summary} />}`n", ""),
  @("/** The Now tag: what a line waits on beyond its glyph, group and stage, as the row's one tag. */`nfunction NowTag({ mark, count }: { mark: MarkModel | null; count: string | null }) {`n  if (!mark) return <Stack />;`n  const words = chipWords(mark);`n  return (`n    <Chip`n      tone=`"fill`"`n      label={words}`n      title={[words, count].filter(Boolean).join(`" · `")}`n      {...(count ? { after: { text: count } } : {})}`n    />`n  );`n}", "/** The Now: what a line waits on beyond its glyph, group and stage, in plain words (no box), its step`n *  count quieter after them. */`nfunction NowTag({ mark, count }: { mark: MarkModel | null; count: string | null }) {`n  if (!mark) return <Stack />;`n  const words = chipWords(mark);`n  return (`n    <Text variant=`"meta`" tone=`"2`" truncate title={[words, count].filter(Boolean).join(`" · `")}>`n      {words}`n      {count ? <Text tone=`"3`" tabular>{``\u2002`${count}``}</Text> : null}`n    </Text>`n  );`n}")
)
foreach ($p in $pairs) {
  if (([regex]::Matches($v, [regex]::Escape($p[0]))).Count -ne 1) { throw "view miss: $($p[0].Substring(0, 40))" }
  $v = $v.Replace($p[0], $p[1])
}
[IO.File]::WriteAllText((Join-Path $root "CompactView.tsx"), $v)
"ok CompactView.tsx"
