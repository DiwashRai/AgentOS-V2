# My queue's header: the counters become the zone filter's chips (as Compact's), `?z=`.
$ErrorActionPreference = "Stop"
$path = "C:\code\AgentOS-V2-web\web\src\features\queue\QueueView.tsx"
$edits = @(
  @("  Row,`n  Stack,`n  Surface,`n  Table,`n  Text,`n} from `"../../kit`";", "  Row,`n  type Segment,`n  Segmented,`n  Stack,`n  Surface,`n  Table,`n  Text,`n} from `"../../kit`";"),
  @("  ...LINE_END,`n];`n", "  ...LINE_END,`n];`n`n/** The bar's chips, as Compact's: Everything, then each zone with its count; one pressed shows that`n *  zone alone (``?z=``). */`ntype Zone = `"all`" | `"you`" | `"work`" | `"ready`" | `"done`";`nconst ZONE_IDS: readonly Zone[] = [`"all`", `"you`", `"work`", `"ready`", `"done`"];`nconst zoneOf = (v: string | null): Zone => ZONE_IDS.find((z) => z === v) ?? `"all`";`n`nfunction zoneChips(z: Zones): Segment[] {`n  const all = z.yourMove.length + z.agents.length + z.ready.length + z.done.length;`n  return [`n    { id: `"all`", label: `"Everything`", count: all },`n    { id: `"you`", label: `"Your move`", count: z.yourMove.length, mark: `"you`" },`n    { id: `"work`", label: `"Agents at work`", count: z.agents.length, mark: `"run`" },`n    { id: `"ready`", label: `"Ready to start`", count: z.ready.length, mark: `"idle`" },`n    { id: `"done`", label: `"Done recently`", count: z.done.length, mark: `"done`" },`n  ];`n}`n"),
  @("interface ZoneListProps {`n  z: Zones;`n  me: Person | null;`n  now: number;`n  open: Open;`n}`n`nfunction ZoneList({ z, me, now, open }: ZoneListProps) {`n  const n = shipped(z.done);", "interface ZoneListProps {`n  z: Zones;`n  me: Person | null;`n  now: number;`n  open: Open;`n  /** The zone the bar's filter shows alone, or all of them. */`n  only: Zone;`n}`n`nfunction ZoneList({ z, me, now, open, only }: ZoneListProps) {`n  const n = shipped(z.done);`n  const show = (id: Zone) => only === `"all`" || only === id;"),
  @("    <Stack>`n      <Surface level=`"list`" label=`"Your move`">", "    <Stack>`n      {show(`"you`") ? (`n      <Surface level=`"list`" label=`"Your move`">"),
  @("          </Table>`n        )}`n      </Surface>`n      <Surface level=`"list`" label=`"Agents at work`">", "          </Table>`n        )}`n      </Surface>`n      ) : null}`n      {show(`"work`") ? (`n      <Surface level=`"list`" label=`"Agents at work`">"),
  @("            ) : null}`n          </Table>`n        )}`n      </Surface>`n      {z.ready.length > 0 ? (", "            ) : null}`n          </Table>`n        )}`n      </Surface>`n      ) : null}`n      {show(`"ready`") && z.ready.length > 0 ? ("),
  @("      {z.done.length > 0 ? (", "      {show(`"done`") && z.done.length > 0 ? ("),
  @("  const [, setParams] = useSearchParams();`n  const space = useSpace();`n  const { query, search } = useSearch();", "  const [params, setParams] = useSearchParams();`n  const zone = zoneOf(params.get(`"z`"));`n  const space = useSpace();`n  const { query, search } = useSearch();"),
  @("      counters={[`n        { n: z.yourMove.length, label: `"your move`", mark: `"you`" },`n        { n: z.mine, label: `"runs yours`" },`n        { n: z.running, label: `"running`", mark: `"run`" },`n        { n: z.queued, label: `"queued`", mark: `"queued`" },`n      ]}", "      middle={`n        <Segmented`n          label=`"Filter`"`n          items={zoneChips(z)}`n          value={zone}`n          onChange={(id) => {`n            setParams((p) => {`n              const out = new URLSearchParams(p);`n              if (id === `"all`") out.delete(`"z`");`n              else out.set(`"z`", id);`n              return out;`n            });`n          }}`n        />`n      }"),
  @("          <ZoneList z={z} me={me} now={now} open={open} />", "          <ZoneList z={z} me={me} now={now} open={open} only={zone} />")
)
$t = [IO.File]::ReadAllText($path)
foreach ($p in $edits) {
  $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
  if ($n -ne 1) { throw "matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  $t = $t.Replace($p[0], $p[1])
}
[IO.File]::WriteAllText($path, $t)
"ok"
