# Round 6: a row's title alone (what it waits on in its tooltip); a properties row's pickers plain
# text until the pointer; a firmer popover on Carbon; the Now column unnamed again; Quiet repos'
# list a word; a run stage's state in ink; a quieter problem panel and +N; facts' old gap; the
# display twin's pickers on form rows. Exact replacements, each must match once.
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
Apply "features\compact\TicketLine.tsx" @(
  @("/** The status glyph, the title, and after it the quiet words of what it waits on: one line, cut`n *  at its end, so the words give way before the title does.", "/** The status glyph and the title alone, what it waits on in its tooltip (the row's Now and stage`n *  already say it): one line, cut at its end."),
  @("      <Text tone=`"3`" truncate title={after ? ``$`{t.title} · `$`{after}`` : t.title}>`n        <Text weight={500} tone={settled ? `"2`" : `"1`"}>`n          {t.title}`n        </Text>`n        {after ? (`n          <Text variant=`"meta`" tone=`"3`">`n            {``\u2002`$`{after}``}`n          </Text>`n        ) : null}`n      </Text>", "      <Text`n        weight={500}`n        tone={settled ? `"2`" : `"1`"}`n        truncate`n        title={after ? ``$`{t.title} · `$`{after}`` : t.title}`n      >`n        {t.title}`n      </Text>")
)
Apply "kit\Facts.module.css" @(
  @("  gap: 0 var(--sp-6);", "  gap: 0 var(--sp-5);"),
  @(".fact:not([data-picker]):hover {", "/* a picker among the values reads as one of them: plain words at rest, its chip and edge only under`n   the pointer or while open (Linear's property rows) */`n.fact[data-picker] [role=`"combobox`"]:not(:hover, [data-popup-open]) {`n  background: none;`n  box-shadow: none;`n}`n.fact:not([data-picker]):hover {")
)
Apply "kit\tokens.css" @(
  @("  --list-open: color-mix(in srgb, var(--you) 14%, transparent);", "  --list-open: color-mix(in srgb, var(--you) 14%, transparent);`n  /* the popover's edge firmer, so a menu stands off the dark sheet it covers */`n  --pop-edge: color-mix(in srgb, var(--hair) 24%, transparent);"),
  @("  --problem-edge: color-mix(in srgb, var(--blocked) 35%, transparent);", "  --problem-edge: color-mix(in srgb, var(--blocked) 22%, transparent);")
)
Apply "kit\Notice.module.css" @(
  ,@("  border-radius: 50%;`n  box-shadow: inset 0 0 0 var(--line-1) var(--rule-strong);`n  font-size: var(--fs-1);", "  border-radius: 50%;`n  font-size: var(--fs-1);")
)
Apply "features\compact\CompactView.tsx" @(
  ,@("  { label: `"Now`", width: `"xl`", hug: true, end: true },", "  { label: `"`", width: `"xl`", hug: true, end: true },")
)
Apply "features\teams\TeamsView.tsx" @(
  ,@("    <Button`n      variant=`"quiet`"`n      size=`"xs`"`n      icon=`"compact`"`n      href={``/compact?repo=`$`{encodeURIComponent(repo)}``}`n      title={``Open the list of every ticket in `$`{repoShort(repo)}``}`n    />", "    <Button`n      variant=`"link`"`n      href={``/compact?repo=`$`{encodeURIComponent(repo)}``}`n      title={``Every ticket in `$`{repoShort(repo)}``}`n    >`n      Open list`n    </Button>")
)
Apply "features\ticket\RunsTab.tsx" @(
  @("/** At a stage's right end: a check's verdict, else what it's doing while it has none, in words in`n *  its state's ink (no box: the glyph at the line's start already shows the state). */", "/** Beside a stage's name: a check's verdict, else what it's doing while it has none, in plain words`n *  (the glyph at the line's start already shows the state in its hue, so the words take none). */"),
  @("      <Text variant=`"meta`" tone={s.verdict === `"pass`" ? `"done`" : `"blocked`"} weight={500}>", "      <Text variant=`"meta`" tone=`"2`">"),
  @("      <Text variant=`"meta`" tone=`"live`" weight={500}>", "      <Text variant=`"meta`" tone=`"2`">")
)
Apply "features\sheet\twins\display.tsx" @(
  ,@("/** A picker on a line: its glyph and words at the start, the picker (and its extra) at the end. */`nfunction Picker({ label, icon, value, extra }: PickerProps) {`n  return (`n    <Stack dir=`"row`" justify=`"between`" align=`"center`">`n      <Stack dir=`"row`" gap={4} align=`"center`">`n        <Icon name={icon} quiet />`n        <Text tone=`"3`">{label}</Text>`n      </Stack>`n      <Stack dir=`"row`" gap={4} align=`"center`">`n        <Select`n          label={label}`n          value={value}`n          options={[{ id: value, label: value }]}`n          onChange={keep}`n        />`n        {extra}`n      </Stack>`n    </Stack>`n  );`n}", "/** A picker on a form row: its words, then the picker (and its extra) from one shared left edge, the`n *  pickers down the panel one width (Linear's draw a glyph before the words; a form row has none). */`nfunction Picker({ label, value, extra }: PickerProps) {`n  return (`n    <FormRow label={label}>`n      <Select label={label} value={value} options={[{ id: value, label: value }]} onChange={keep} />`n      {extra}`n    </FormRow>`n  );`n}")
)
