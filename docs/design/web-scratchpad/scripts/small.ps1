# The small fixes: a queued meter's track empty, Carbon's quiet ink a step up, a narrow Table for the
# library's short lists, and the ledger's `you` wording. Exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
$edits = [ordered]@{
  "kit\Table.module.css" = @(
    ,@("  --list-reach: 0;`n}", "  --list-reach: 0;`n}`n/* narrow: a short list's columns held to a reading width (the library's), its rules, washes and`n   foot still out to the sheet's edges */`n.narrow {`n  --list-end: max(var(--list-inset), calc(100% - var(--list-inset) - var(--w-list)));`n}")
  )
  "kit\Table.tsx" = @(
    @("  edge?: boolean;", "  edge?: boolean;`n  /** Its columns held to a reading width, its rules still to the edges (the library's short lists`n   *  on a wide sheet). */`n  narrow?: boolean;"),
    @("  const { columns, head = true, scroll = true, foot, edge, children } = props;", "  const { columns, head = true, scroll = true, foot, edge, narrow, children } = props;"),
    @("className={cx(s.table, scroll && s.scroll, edge && s.edge)}", "className={cx(s.table, scroll && s.scroll, edge && s.edge, narrow && s.narrow)}")
  )
  "features\library\list.tsx" = @(
    ,@("      <Table columns={columns} edge foot={<Foot noun={noun} total={total} shown={hrefs.length} />}>", "      <Table`n        columns={columns}`n        edge`n        narrow`n        foot={<Foot noun={noun} total={total} shown={hrefs.length} />}`n      >")
  )
  "kit\ledger.json" = @(
    ,@("; the same solid fill in a list's row, so the ask reads as the row's one action.`"", "; in a list's line it is the outline instead.`"")
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
