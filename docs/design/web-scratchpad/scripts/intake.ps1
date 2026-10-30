# Intake: statuses in the app's glyphs, and the queries as the bar's filter chips (`?q=`).
$ErrorActionPreference = "Stop"
$root = "C:\code\AgentOS-V2-web\web\src\features\intake"
$edits = [ordered]@{
  "IntakeView.tsx" = @(
    @("import { useState } from `"react`";", "import { useState } from `"react`";`nimport { useSearchParams } from `"react-router`";"),
    @("  Icon,`n  Notice,`n  Page,`n  Row,`n  Stack,", "  Icon,`n  Mark,`n  Notice,`n  Page,`n  Row,`n  type Segment,`n  Segmented,`n  Stack,"),
    @("  jqlHref,`n  metaFact,`n  sharedPrefix,", "  jqlHref,`n  sharedPrefix,`n  statusMark,"),
    @("the title firm, one fact (a priority worth saying, led by`n// its bars, else the Jira status; the rest in its tooltip),", "the title firm, its priority's bars and`n// its Jira status in the app's glyphs with the status's words (the rest in its tooltip),"),
    @("function IssueRow({ issue, now }: { issue: IntakeIssue; now: number }) {`n  const fact = metaFact(issue);`n  return (", "function IssueRow({ issue, now }: { issue: IntakeIssue; now: number }) {`n  return ("),
    @("      <Stack dir=`"row`" gap={3} align=`"center`">`n        {fact.priority ? <Icon name={fact.priority} /> : null}`n        <Text tone=`"2`" truncate title={issueFacts(issue)}>`n          {fact.text}`n        </Text>`n      </Stack>", "      <Stack dir=`"row`" gap={4} align=`"center`">`n        <Icon name={issue.priority} />`n        <Mark kind={statusMark(issue.status)} glyph name={false} />`n        <Text tone=`"2`" truncate title={issueFacts(issue)}>`n          {issue.status}`n        </Text>`n      </Stack>"),
    @("export function IntakeView() {`n  const intake = useIntake();", "/** The bar's chips, as the other lists': everything to take in, then each query and its count; a`n *  query that didn't answer carries the blocked glyph. One pressed lists that query alone. */`nfunction queryChips(queries: readonly IntakeQuery[], total: number): Segment[] {`n  return [`n    { id: `"all`", label: `"Everything`", count: total },`n    ...queries.map((q) =>`n      q.result.kind === `"error`"`n        ? { id: q.name, label: q.name, mark: `"blk`" as const }`n        : { id: q.name, label: q.name, count: issuesOf(q, []).length },`n    ),`n  ];`n}`n`nexport function IntakeView() {`n  const intake = useIntake();`n  const [params, setParams] = useSearchParams();`n  const only = params.get(`"q`");"),
    @("      {...(data`n        ? {`n            counters: [`n              { n: toTakeIn(data), label: `"to take in`" },`n              { n: data.queries.length, label: data.queries.length === 1 ? `"query`" : `"queries`" },`n            ],`n          }`n        : {})}", "      {...(data`n        ? {`n            middle: (`n              <Segmented`n                label=`"Filter`"`n                items={queryChips(data.queries, toTakeIn(data))}`n                value={only ?? `"all`"}`n                onChange={(id) => {`n                  setParams((p) => {`n                    const out = new URLSearchParams(p);`n                    if (id === `"all`") out.delete(`"q`");`n                    else out.set(`"q`", id);`n                    return out;`n                  });`n                }}`n              />`n            ),`n          }`n        : {})}"),
    @("          data.queries.map((q) => (`n            <Group key={q.name} q={q} query={query} jiraUrl={jiraUrl} now={now} />`n          ))", "          data.queries`n            .filter((q) => only === null || q.name === only)`n            .map((q) => <Group key={q.name} q={q} query={query} jiraUrl={jiraUrl} now={now} />)")
  )
}
foreach ($f in $edits.Keys) {
  $path = Join-Path $root $f
  $t = [IO.File]::ReadAllText($path)
  foreach ($p in $edits[$f]) {
    $n = ([regex]::Matches($t, [regex]::Escape($p[0]))).Count
    if ($n -ne 1) { throw "$f matched $n times: $($p[0].Substring(0, [Math]::Min(70, $p[0].Length)))" }
  }
  foreach ($p in $edits[$f]) { $t = $t.Replace($p[0], $p[1]) }
  [IO.File]::WriteAllText($path, $t)
  "ok $f"
}
