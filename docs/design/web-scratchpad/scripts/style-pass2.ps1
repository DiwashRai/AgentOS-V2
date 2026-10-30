# The second style pass: full-bleed bands, a 2px rim, firmer dark card edges, comment rules, nested
# sheets flat. Exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$kit = "C:\code\AgentOS-V2-web\web\src\kit"
$edits = [ordered]@{
  "tokens.css" = @(
    ,@("  --group-band: color-mix(in srgb, var(--wash) 2%, transparent);`n  --group-band-hover: var(--fill-1);", "  --group-band: color-mix(in srgb, var(--wash) 4%, transparent);`n  --group-band-hover: color-mix(in srgb, var(--wash) 6.5%, transparent);`n  --card-edge: color-mix(in srgb, var(--hair) 11%, var(--page));`n  --nest: color-mix(in srgb, var(--wash) 3%, var(--raised));`n  --sheet-rim-w: var(--line-2);")
  )
  "tokens.css#2" = @(
    ,@("  --sheet-rim: var(--rule);`n  --switch-edge: transparent;", "  --sheet-rim: var(--rule);`n  --sheet-rim-w: var(--line-1);`n  --switch-edge: transparent;`n  /* a card inside a card: flat, a step lighter, no line (Linear's chat bubble in its panel) */`n  --nest: color-mix(in srgb, var(--wash) 6%, var(--page));`n  /* how far a group's band runs past its head: to the sheet's edges */`n  --band-out: calc(var(--gutter) * -1);")
  )
  "tokens.css#3" = @(
    ,@("  --chip-firm: transparent;`n  --chip-firm-edge: var(--rule-strong);`n}", "  --chip-firm: transparent;`n  --chip-firm-edge: var(--rule-strong);`n  /* a card's edge as Linear's: about 26 levels over the sheet, the card itself about 6 */`n  --card-edge: color-mix(in srgb, var(--hair) 13%, var(--page));`n}")
  )
  "tokens.css#4" = @(
    @("  --tone-1: color-mix(in srgb, var(--wash) 0.8%, var(--page));", "  --tone-1: color-mix(in srgb, var(--wash) 1.4%, var(--page));"),
    @("  --tone-2: color-mix(in srgb, var(--wash) 1.5%, var(--page));", "  --tone-2: color-mix(in srgb, var(--wash) 2.8%, var(--page));"),
    @("  --tone-3: color-mix(in srgb, var(--wash) 3%, var(--page));", "  --tone-3: color-mix(in srgb, var(--wash) 4.5%, var(--page));")
  )
  "Head.module.css" = @(
    @("/* group: a list's band (Linear's group head): a light block of grey as wide as the rows' patches,", "/* group: a list's band (Linear's group head): a light block of grey square to the sheet's edges,"),
    @("  inset: 0 var(--list-pad);`n  border-radius: var(--r-2);`n  background: var(--group-band);", "  inset: 0 var(--band-out);`n  background: var(--group-band);")
  )
  "Table.module.css" = @(
    @("/* a list on a surface keeps room at its sides for its rows' wash, so the rows' words (and the`n   head's, over them) stay on the surface's edge; at its right the scrollbar's gutter is part of`n   that room */", "/* a list on a surface keeps room at its sides out to the sheet's edges, for its rows' wash and its`n   groups' bands, so the rows' words (and the head's, over them) stay on the surface's edge; at its`n   right the scrollbar's gutter is part of that room */"),
    @("  margin-inline: calc(var(--list-bleed) * -1);`n  padding-inline: var(--list-bleed) calc(var(--list-bleed) - var(--bar-thin));", "  margin-inline: calc(var(--gutter) * -1);`n  padding-inline: var(--gutter) calc(var(--gutter) - var(--bar-thin));"),
    @("  --list-inset: var(--gutter);`n  --row-rule: var(--list-rule);`n}", "  --list-inset: var(--gutter);`n  --row-rule: var(--list-rule);`n  --band-out: 0px;`n}")
  )
  "Surface.module.css" = @(
    @("  background: var(--tone-2);`n  border-radius: var(--r-4);`n  box-shadow: inset 0 0 0 var(--line-1) var(--card-edge);`n}", "  --thread-rule: var(--card-edge);`n  background: var(--tone-2);`n  border-radius: var(--r-4);`n  box-shadow: inset 0 0 0 var(--line-1) var(--card-edge);`n}`n/* a sheet inside a sheet (a message, a change in an agent's panel) lies flat, a step lighter */`n.sheet .sheet {`n  --ground: var(--nest);`n  background: var(--nest);`n  box-shadow: none;`n}"),
    @("  overflow: clip;`n  overflow-clip-margin: var(--list-bleed);", "  overflow: clip;`n  overflow-clip-margin: var(--gutter);")
  )
  "Page.module.css" = @(
    ,@("  --list-pad: 0;`n  --list-inset: var(--list-in);", "  --list-pad: 0;`n  --list-inset: var(--list-in);`n  --band-out: 0px;")
  )
  "Frame.module.css" = @(
    ,@("  outline: var(--line-1) solid var(--sheet-rim);", "  outline: var(--sheet-rim-w) solid var(--sheet-rim);")
  )
  "Thread.module.css" = @(
    ,@(".msg {`n  display: grid;`n  grid-template-columns: var(--sp-9) minmax(0, 1fr);`n  gap: var(--sp-5);`n  min-width: 0;`n}", ".msg {`n  position: relative;`n  display: grid;`n  grid-template-columns: var(--sp-9) minmax(0, 1fr);`n  gap: var(--sp-5);`n  min-width: 0;`n}`n/* in a card, a hairline parts one person's message from the next, from the words' edge to the card's`n   (Linear's comment thread); a run of one person's messages stays unbroken */`n.msg:not(.mine) + .msg:not(.same, .mine)::before {`n  content: `"`";`n  position: absolute;`n  top: calc(var(--sp-9) / -2);`n  left: calc(var(--sp-9) + var(--sp-5));`n  right: calc(var(--pad, 0px) * -1);`n  height: var(--line-1);`n  background: var(--thread-rule, transparent);`n}")
  )
}
foreach ($k in $edits.Keys) {
  $f = $k.Split("#")[0]
  $path = Join-Path $kit $f
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $edits[$k]) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$k matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  }
  foreach ($p in $edits[$k]) { $t = $t.Replace($p[0], $p[1]) }
  [IO.File]::WriteAllText($path, $t)
  "ok $k"
}
