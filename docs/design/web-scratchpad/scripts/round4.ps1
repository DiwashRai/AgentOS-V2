# Round 4: an expanded row on hairlines (the tint is a selection's), the Now column named, Open list
# quiet, room on property lines and a narrower label column, a form row's selects one width, the
# sub-issues popover in parts. Exact replacements, each must match once.
$ErrorActionPreference = "Stop"
$web = "C:\code\AgentOS-V2-web\web\src"
function Apply($rel, $pairs) {
  $path = Join-Path $web $rel
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $pairs) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$rel matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  }
  foreach ($p in $pairs) { $t = $t.Replace($p[0], $p[1]) }
  [IO.File]::WriteAllText($path, $t)
  "ok $rel"
}
Apply "kit\Row.module.css" @(
  ,@(".row:is(.line, .item).open::before {`n  background: var(--list-open);`n}", ".row:is(.line, .item).open::before {`n  background: var(--list-open);`n}`n/* an expanded row (its expansion under it) is no band but a part of the list on two hairlines, so a`n   large panel never reads as a slab of the accent */`n.row:is(.line, .item).open:has(.more)::before {`n  background: none;`n  box-shadow:`n    inset 0 var(--line-1) 0 var(--card-edge),`n    inset 0 calc(var(--line-1) * -1) 0 var(--card-edge);`n}")
)
Apply "kit\Facts.module.css" @(
  ,@("  gap: 0 var(--sp-5);", "  gap: 0 var(--sp-6);")
)
Apply "kit\tokens.css" @(
  ,@("  --w-fact-label: 104px; /* the properties row's head column */", "  --w-fact-label: 92px; /* the properties row's head column */")
)
Apply "kit\Form.module.css" @(
  ,@("/* a picker's chip (Select) lines its words up with the plain values, its padding in the gap */", "/* a form row's picker (Select) takes the control's room, up to a popover's width, its chevron at its`n   end, so the selects down a form (a display popover's) share one width and one right edge */`n.control > [role=`"combobox`"] {`n  flex: 1 1 auto;`n  max-width: var(--w-pop);`n  justify-content: space-between;`n}`n/* a picker's chip (Select) lines its words up with the plain values, its padding in the gap */")
)
Apply "features\compact\CompactView.tsx" @(
  ,@("  { label: `"`", width: `"xl`", hug: true, end: true },", "  { label: `"Now`", width: `"xl`", hug: true, end: true },")
)
Apply "features\teams\TeamsView.tsx" @(
  ,@("    <Button`n      variant=`"link`"`n      icon=`"compact`"`n      href={``/compact?repo=`${encodeURIComponent(repo)}``}`n      title={``Every ticket in `${repoShort(repo)}``}`n    >`n      Open list`n    </Button>", "    <Button`n      variant=`"quiet`"`n      size=`"xs`"`n      icon=`"compact`"`n      href={``/compact?repo=`${encodeURIComponent(repo)}``}`n      title={``Open the list of every ticket in `${repoShort(repo)}``}`n    />")
)
Apply "features\sheet\twins\subissues.tsx" @(
  @("    <Surface level=`"float`" pad={8}>`n      <Stack gap={10}>`n        <Stack gap={9}>", "    <Surface level=`"float`" pad={8} parts>`n        <Stack gap={9}>"),
  @("          </Stack>`n        </Stack>`n      </Stack>`n    </Surface>", "          </Stack>`n        </Stack>`n    </Surface>")
)
