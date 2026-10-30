# All teams' header: the counters become Compact's filter chips, the same `?f=`.
$ErrorActionPreference = "Stop"
$path = "C:\code\AgentOS-V2-web\web\src\features\teams\TeamsView.tsx"
$edits = @(
  @("  Row,`n  Stack,`n  Surface,`n  Table,`n  Text,`n} from `"../../kit`";`nimport { stageWord } from `"../compact/model`";", "  Row,`n  Segmented,`n  Stack,`n  Surface,`n  Table,`n  Text,`n} from `"../../kit`";`nimport { parseFilter, pills, stageWord } from `"../compact/model`";"),
  @("  const [, setParams] = useSearchParams();`n  const open = (key: string) => {", "  const [params, setParams] = useSearchParams();`n  // the bar's chips, as Compact's and with its ``?f=``: one pressed lists that group's tickets alone`n  const filter = parseFilter(params.get(`"f`"));`n  const open = (key: string) => {"),
  @("  const live = rows.filter((t) => t.attention.kind === `"running`").length;`n  const queued = rows.filter((t) => t.attention.kind === `"queued`").length;`n  const needYou = rows.filter((t) => groupOf(t, me) === `"needs_you`").length;`n  const { active, quiet } = groupsOf(`n    rows,", "  const { active, quiet } = groupsOf(`n    rows.filter((t) => filter === `"all`" || groupOf(t, me) === filter),"),
  @("      counters={[`n        { n: needYou, label: `"need you`", mark: `"you`" },`n        { n: live, label: `"running`", mark: `"run`" },`n        { n: queued, label: `"queued`", mark: `"queued`" },`n      ]}", "      middle={`n        <Segmented`n          label=`"Filter`"`n          items={pills(rows, me, filter)}`n          value={filter}`n          onChange={(id) => {`n            setParams((p) => {`n              const out = new URLSearchParams(p);`n              if (id === `"all`") out.delete(`"f`");`n              else out.set(`"f`", id);`n              return out;`n            });`n          }}`n        />`n      }"),
  @("        {quiet.length > 0 ? <QuietSection quiet={quiet} /> : null}", "        {filter === `"all`" && quiet.length > 0 ? <QuietSection quiet={quiet} /> : null}")
)
$t = [IO.File]::ReadAllText($path)
foreach ($p in $edits) {
  $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
  if ($n -ne 1) { throw "matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  $t = $t.Replace($p[0], $p[1])
}
[IO.File]::WriteAllText($path, $t)
"ok"
