# Watch the Codex reviewer: approve only its read-only Chrome probes and its Vite start on its own
# port; stop and report on any other approval, or when it is idle or done.
param([string]$Agent = "agentos-v2-web-review", [string]$Findings)
for ($i = 0; $i -lt 60; $i++) {
  $s = (herdr agent wait $Agent --until idle --until done --until blocked --timeout 1800000 | ConvertFrom-Json).result.agent.agent_status
  if ($s -ne "blocked") { "state: $s"; break }
  Start-Sleep -Seconds 2
  $screen = (herdr agent read $Agent 2>&1 | Select-Object -Last 120) -join "`n"
  if ($screen -notmatch "Would you like to run") { continue }
  $probe = ($screen -match "chromium\.launch" -or $screen -match "page\.(goto|keyboard|getByRole|evaluate)" -or $screen -match "getPreEmitDiagnostics") -and $screen -notmatch "(Remove-Item|git (commit|push|stash|reset|checkout)|Set-Content|Out-File|rm -)"
  $vite = $screen -match "vite\.js --port 5231|\$ node tools/kit\.mjs|\$ node --test tools/|\$ npx vitest run"
  if ($probe -or $vite) { herdr agent send-keys $Agent y | Out-Null; "approved a probe"; continue }
  "needs a look:"; $screen; break
}
if ($Findings) { "findings file: $(Test-Path $Findings)" }
