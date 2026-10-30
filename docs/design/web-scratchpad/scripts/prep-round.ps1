# One judging round's material from the committed build: shoot screens and twins into q<shots>,
# the blind twin match m<match>, and the scored pairs in score<round> (with Linear's band references).
param([Parameter(Mandatory)] [string]$Shots, [Parameter(Mandatory)] [string]$Match, [Parameter(Mandatory)] [string]$Round)
$ErrorActionPreference = "Stop"
$s = 'C:\Users\diwash\AppData\Local\Temp\claude\C--code-AgentOS-V2-web\6d0fdab0-5ae2-4898-99b9-b3d2c29ccdad\scratchpad'
$g = 'C:\code\AgentOS-V2-web\.review\gauntlet3'
$L = 'C:\code\AgentOS-V2-web\.review\linear-bar'
node "$s\g2\gshots.mjs" C:\code\AgentOS-V2-web\web 5191 "$g\q$Shots\screens" all | Select-Object -Last 1
node "$s\g3\tshots.mjs" C:\code\AgentOS-V2-web\web 5191 "$g\q$Shots\twins" $L all | Select-Object -Last 1
node "$s\g3\xprep.mjs" "$g\h2h\s5" "m$Match" "$g\q$Shots\twins" "$g\q$Shots\twins" linear | Select-Object -Last 1
$o = "$g\score$Round"
New-Item -ItemType Directory -Force $o | Out-Null
$pairs = @(
  @('frame/1-my-queue-light', "$L\01-theme-ash.png"),
  @('lists/3-compact-light', "$L\01-theme-ash.png"),
  @('lists/2-compact-open-dark', "$L\06-docs-07-select-issues.png"),
  @('intake/2-intake-dark', "$L\more\intake-01-inbox-with-detail.png"),
  @('ticket/1-ticket-light', "$L\more\ticket-02-issue-page-light.png"),
  @('ticket/2-ticket-runs-dark', "$L\more\ticket-01-issue-page-dark.png"),
  @('teams/2-all-teams-dark', "$L\more\teams-02-initiatives-lead-teams.png"),
  @('editors/1-agent-editor-light', "$L\more\editors-04-project-draft-with-chat.png"),
  @('editors/2-workflow-editor-dark', "$L\more\editors-01-workflow-statuses.png"),
  @('controls/2-owner-picker-dark', "$L\more\controls-02-context-menu.png")
)
$i = 1
foreach ($p in $pairs) {
  Copy-Item "$g\q$Shots\screens\$($p[0]).png" "$o\p$i-ours.png" -Force
  Copy-Item $p[1] "$o\p$i-linear.png" -Force
  $i++
}
Copy-Item "$g\score\pairs.txt" "$o\pairs.txt" -Force
Copy-Item "$L\01-theme-ash.png" "$o\ref-linear-group-bands-light.png" -Force
Copy-Item "$g\q$Shots\twins\issues\linear.png" "$o\ref-linear-group-bands-dark.png" -Force
"score$Round : $((Get-ChildItem $o).Count) files"
