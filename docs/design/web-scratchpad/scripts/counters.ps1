# Page's counters had no users left (every list's bar is the filter's chips now): remove them.
$ErrorActionPreference = "Stop"
$kit = "C:\code\AgentOS-V2-web\web\src\kit"
$edits = [ordered]@{
  "Page.tsx" = @(
    @("// A view: the top bar (title, context, counters, the view's own middle, search, one button) and the", "// A view: the top bar (title, context, the view's own middle, search, one button) and the"),
    @("import { Mark, type MarkKind } from `"./Mark`";`n", ""),
    @("export interface Counter {`n  n: number;`n  label: string;`n  mark?: MarkKind;`n}`n`n", ""),
    @("  /** The number carries the weight, a zero recedes, a state's glyph leads it. */`n  counters?: readonly Counter[];`n  /** The view's own controls after the counters (filter pills, a crumb). */", "  /** The view's own controls after the title (a list's filter chips, a crumb). */"),
    @("function Counters({ items }: { items: readonly Counter[] }) {`n  return (`n    <span className={s.counters} aria-live=`"polite`">`n      {items.map((c) => (`n        <span`n          key={c.label}`n          className={cx(s.counter, c.n === 0 && s.zero, c.n > 0 && c.mark === `"you`" && s.you)}`n        >`n          {c.mark ? <Mark kind={c.mark} glyph small name={false} /> : null}`n          <b>{c.n}</b> {c.label}`n        </span>`n      ))}`n    </span>`n  );`n}`n`n", ""),
    @("  context,`n  counters,`n  middle,", "  context,`n  middle,"),
    @("        {counters ? <Counters items={counters} /> : null}`n", "")
  )
  "Page.module.css" = @(
    ,@("/* counters: the number carries the weight; a zero recedes; a non-zero `"need you`" takes the accent's`n   ink, with no fill, so nothing in the bar is a filled block */`n.counters {`n  flex: 0 0.001 auto;`n  display: flex;`n  align-items: center;`n  gap: var(--sp-8);`n  min-width: 0;`n  overflow: hidden;`n  white-space: nowrap;`n}`n.counter {`n  display: inline-flex;`n  align-items: baseline;`n  gap: var(--sp-2);`n  padding: var(--line-3) 0;`n  font-size: var(--fs-3);`n  color: var(--ink-2);`n}`n.counter > b {`n  font-size: var(--fs-5);`n  font-weight: 600;`n  color: var(--ink-1);`n  font-variant-numeric: tabular-nums;`n}`n.counter > span:first-child {`n  align-self: center;`n}`n.zero,`n.zero > b {`n  color: var(--ink-3);`n  font-weight: 500;`n}`n.zero > b {`n  font-size: var(--fs-3);`n}`n.you {`n  color: var(--you-text);`n  font-weight: 500;`n}`n.you > b {`n  color: var(--you-text);`n}`n`n", "")
  )
  "index.ts" = @(
    ,@("export { type Counter, Page, type PageProps, type Search } from `"./Page`";", "export { Page, type PageProps, type Search } from `"./Page`";")
  )
  "Mark.tsx" = @(
    ,@("(a filter chip, a counter, a head)", "(a filter chip, a head)")
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
