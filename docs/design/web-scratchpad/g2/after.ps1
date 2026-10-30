# After a gauntlet round: save its result, print the scores and the integration, remove the
# round's worktrees safely (their node_modules junctions unlinked first, so nothing behind them is
# touched), fold the round into state.json, write the next args and rebuild the progress page.
param([int]$Round, [string]$TaskOutput, [string]$RunId, [string]$NextMode, [string[]]$Extra = @())
$ErrorActionPreference = "Stop"
$g = "C:\Users\diwash\AppData\Local\Temp\claude\C--code-AgentOS-V2-web\6d0fdab0-5ae2-4898-99b9-b3d2c29ccdad\scratchpad\g2"
$out = "C:\code\AgentOS-V2-web\.review\gauntlet2\r$Round"
Set-Location C:\code\AgentOS-V2-web
$w = Get-Content $TaskOutput -Raw | ConvertFrom-Json
$r = $w.result; if ($r -is [string]) { $r = $r | ConvertFrom-Json }
$r | ConvertTo-Json -Depth 8 | Set-Content "$out\result.json"
$w.logs
"--- integration"
"commit: $($r.integration.commit)"
"applied: $($r.integration.applied -join ' | ')"
"dropped: $($r.integration.dropped)"
"kit: $($r.integration.kit)"
$main = "C:\code\AgentOS-V2-web\web\node_modules"
$before = (Get-ChildItem $main -Force).Count
foreach ($wt in Get-ChildItem C:\code\AgentOS-V2\.claude\worktrees -Directory -Filter "$RunId-*") {
  $nm = Join-Path $wt.FullName "web\node_modules"
  if (Test-Path $nm) {
    $item = Get-Item $nm -Force
    if ($item.LinkType) { cmd /c rmdir "$nm" | Out-Null }
    else {
      Get-ChildItem $nm -Force | Where-Object { $_.LinkType } | ForEach-Object { cmd /c rmdir "$($_.FullName)" | Out-Null }
      Get-ChildItem $nm -Force -Directory | Where-Object { -not $_.LinkType } | ForEach-Object { Get-ChildItem $_.FullName -Force | Where-Object { $_.LinkType } | ForEach-Object { cmd /c rmdir "$($_.FullName)" | Out-Null } }
    }
  }
  $left = Get-ChildItem $wt.FullName -Recurse -Force -Attributes ReparsePoint -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($left) { "links left in $($wt.Name), not removed: $($left.FullName)" } else { git worktree remove --force $wt.FullName | Out-Null }
}
"worktrees left: $((git worktree list | Select-String $RunId).Count); main node_modules $before -> $((Get-ChildItem $main -Force).Count)"
$head = git rev-parse HEAD
"head: $(git log -1 --format='%h %s')"
node "$g\next.mjs" $Round $head $NextMode @Extra
node "$g\progress.mjs" C:\code\AgentOS-V2-web\.review\gauntlet2\state.json $g | Out-Null
