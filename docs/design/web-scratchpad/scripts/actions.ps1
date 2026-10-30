# A row's actions: the primary outlined in the accent, the second shown on the row's hover or focus.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
$edits = [ordered]@{
  "kit\Button.tsx" = @(
    ,@("export type ButtonVariant = `"default`" | `"ink`" | `"you`" | `"accent`" | `"quiet`" | `"link`";", "export type ButtonVariant =`n  | `"default`"`n  | `"ink`"`n  | `"you`"`n  | `"outline`"`n  | `"aside`"`n  | `"accent`"`n  | `"quiet`"`n  | `"link`";")
  )
  "kit\Button.module.css" = @(
    ,@("/* blocked (R11):", "/* outline: a primary in a list's line (Approve in My queue): the accent's words on the control's face`n   inside an edge of the accent, so the row says act here without being the loudest thing on the`n   page; under the pointer the accent's soft wash */`n.outline {`n  border-color: var(--you-edge);`n  color: var(--you-text);`n}`n.outline:hover {`n  border-color: var(--you);`n  background: var(--you-soft);`n}`n/* aside: a row's second action (Request changes): the default's look, shown while its row is under`n   the pointer or holds the focus, its room kept so nothing moves */`n:where([data-row]:not(:hover, :focus-within)) .aside {`n  visibility: hidden;`n}`n/* blocked (R11):")
  )
  "kit\tokens.css" = @(
    ,@("  --you-soft: color-mix(in srgb, var(--you) 15%, transparent);", "  --you-soft: color-mix(in srgb, var(--you) 15%, transparent);`n  /* an outlined primary's edge */`n  --you-edge: color-mix(in srgb, var(--you) 55%, transparent);")
  )
  "kit\ledger.json" = @(
    ,@("            `"accent`": `"Only Dispatch run, only on a ticket.`",", "            `"outline`": `"A primary in a list's line (Approve in My queue's Your move): the accent's words inside an edge of the accent, so the row still says act here without being the page's loudest thing.`",`n            `"aside`": `"A row's second action (Request changes): the default's look, shown only while its row is under the pointer or holds the focus, its room kept so the row never moves.`",`n            `"accent`": `"Only Dispatch run, only on a ticket.`",")
  )
  "features\shared\Actions.tsx" = @(
    @("/** The variants an action takes: the strong two, the accent (Dispatch on the header), the rest. */`ntype ActionLook = `"you`" | `"ink`" | `"accent`" | `"default`";", "/** The variants an action takes: the strong two, the accent (Dispatch on the header), the rest; in a`n *  list's line the gate's primary is outlined and the rest wait for the row's hover or focus. */`ntype ActionLook = `"you`" | `"ink`" | `"outline`" | `"aside`" | `"accent`" | `"default`";"),
    @("function variantOf(action: Action, header: boolean): ActionLook {`n  if (header && action.id === `"dispatch`") return `"accent`";`n  return VARIANT[action.id] ?? `"default`";`n}", "function variantOf(action: Action, header: boolean, line: boolean): ActionLook {`n  if (header && action.id === `"dispatch`") return `"accent`";`n  const look = VARIANT[action.id] ?? `"default`";`n  if (!line) return look;`n  return look === `"you`" ? `"outline`" : look === `"default`" ? `"aside`" : look;`n}"),
    @("  const variant = variantOf(action, header);", "  // xs is a list's dense line`n  const variant = variantOf(action, header, size === `"xs`");")
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
