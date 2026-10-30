# All teams: the repo heads lose their tally of states and the foot its glyph legend (the judges'
# "too much on the right of group heads"); the tally goes from the model and its test.
$ErrorActionPreference = "Stop"
$root = "C:\code\AgentOS-V2-web\web\src\features\teams"
$edits = [ordered]@{
  "TeamsView.tsx" = @(
    @("// works there, how many of its tickets are in flight and a tally of their states (what needs you`n// in the accent), with its list at the head's end; inside a group the rows run down the stages.", "// works there and how many of its tickets are in flight, with its list at the head's end; inside a`n// group the rows run down the stages."),
    @("import { groupsOf, type RepoGroup, STAGE, stageCounts, stateOf, type Tally } from `"./model`";", "import { groupsOf, type RepoGroup, STAGE, stageCounts, stateOf } from `"./model`";"),
    @("const LEGEND = [`n  [`"run`", `"Running`"],`n  [`"wait`", `"Waiting on someone`"],`n  [`"you`", `"Your move`"],`n  [`"blk`", `"Blocked`"],`n  [`"queued`", `"Queued`"],`n] as const;`n`n/** The table's foot: how much is at each stage across the repos (where work piles up), where the`n *  rest of the work lives, and what each glyph says. */", "/** The table's foot: how much is at each stage across the repos (where work piles up), and where the`n *  rest of the work lives. */"),
    @("      <Text variant=`"meta`">Inbox and merged work live in each repo&apos;s list.</Text>`n      <Stack grow />`n      {LEGEND.map(([kind, word]) => (`n        <Stack key={kind} dir=`"row`" gap={3} align=`"center`">`n          <Mark kind={kind} glyph name={false} />`n          <Text variant=`"meta`" tone=`"2`">`n            {word}`n          </Text>`n        </Stack>`n      ))}`n    </>", "      <Text variant=`"meta`">Inbox and merged work live in each repo&apos;s list.</Text>`n    </>"),
    @("/** A repo's tally: each state its tickets are in, its glyph and how many; your move's in the`n *  accent. */`nfunction TallyLine({ tally }: { tally: readonly Tally[] }) {`n  return (`n    <Stack dir=`"row`" gap={7} align=`"center`">`n      {tally.map((s) => (`n        <Stack key={s.mark} dir=`"row`" gap={3} align=`"center`">`n          <Mark kind={s.mark} glyph small name={false} />`n          <Text variant=`"meta`" tone={s.mark === `"you`" ? `"you`" : `"2`"} tabular>`n            <Text weight={600} tone={s.mark === `"you`" ? `"you`" : `"1`"}>`n              {String(s.n)}`n            </Text>`n            {`` `${s.word}``}`n          </Text>`n        </Stack>`n      ))}`n    </Stack>`n  );`n}`n`n", ""),
    @("/** A repo's group: its head (the repo, how many in flight, its path and people, its tally and its`n *  list), then a line per ticket. */", "/** A repo's group: its head (the repo, how many in flight, its path and people, its list), then a`n *  line per ticket. */"),
    @("        summary={`n          <Stack dir=`"row`" gap={9} align=`"center`">`n            <TallyLine tally={g.tally} />`n            <OpenList repo={g.repo} />`n          </Stack>`n        }", "        summary={<OpenList repo={g.repo} />}")
  )
  "model.ts" = @(
    @("// queued. Its head carries who works there and its tally of states; a repo with nothing in flight`n// is quiet.", "// queued. Its head carries who works there; a repo with nothing in flight is quiet."),
    @("/** A tally's states, in the order they call for a look; each with its glyph and word. */`nexport const TALLY = [`n  { group: `"needs_you`", mark: `"you`", word: `"need you`" },`n  { group: `"blocked`", mark: `"blk`", word: `"blocked`" },`n  { group: `"running`", mark: `"run`", word: `"running`" },`n  { group: `"waiting`", mark: `"wait`", word: `"waiting`" },`n  { group: `"queued`", mark: `"queued`", word: `"queued`" },`n] as const;`n`n", ""),
    @("export interface Tally {`n  mark: (typeof TALLY)[number][`"mark`"];`n  word: string;`n  n: number;`n}`n`n", ""),
    @("  rows: TicketRow[];`n  tally: Tally[];`n}", "  rows: TicketRow[];`n}"),
    @("      flying: flying.length,`n      tally: TALLY.map((s) => ({`n        mark: s.mark,`n        word: s.word,`n        n: shown.filter((t) => groupOf(t, me) === s.group).length,`n      })).filter((s) => s.n > 0),`n    };", "      flying: flying.length,`n    };")
  )
  "model.test.ts" = @(
    ,@("    expect(web?.tally.map((s) => [s.word, s.n])).toEqual([`n      [`"need you`", 1],`n      [`"blocked`", 1],`n      [`"running`", 2],`n    ]);`n", "")
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
