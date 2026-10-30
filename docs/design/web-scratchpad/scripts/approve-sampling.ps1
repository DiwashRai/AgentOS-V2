# Wait for the Opus style reviewer; approve only its read-only Pillow sampling prompts, stop on anything else.
param([string]$Agent = "web-style-opus", [int]$Rounds = 40)
for ($i = 0; $i -lt $Rounds; $i++) {
  $state = (herdr agent wait $Agent --until idle --until done --until blocked --timeout 1800000 | ConvertFrom-Json).result.agent.agent_status
  if ($state -ne "blocked") { "settled: $state"; exit 0 }
  $screen = (herdr agent read $Agent --source visible --lines 30) -join "`n"
  if ($screen -match "uv run --no-project --with pillow python -I" -and $screen -match "Do you want to proceed") {
    herdr agent send-keys $Agent Enter | Out-Null
    "approved sampling prompt $($i + 1)"
    Start-Sleep -Seconds 3
  } else {
    "blocked on something else; left for review"
    $screen
    exit 1
  }
}
"gave up after $Rounds rounds"
