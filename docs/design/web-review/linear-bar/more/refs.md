# Linear references: more screens

This folder holds 23 PNGs for the screens that had no good counterpart among the first references in `.review/linear-bar/`. Each file is the full-resolution original from Linear's Sanity CDN (`webassets.linear.app/images/ornj730p/production/<file>?fm=png&q=100`), and I opened every one to check it. Sizes are in pixels.

Most changelog and docs images are framed. The app window sits on a gradient or a plain backdrop, and some images are tight crops of one panel. That is noted per file. "Dark" or "light" describes the Linear UI itself, not the backdrop.

## 1. ticket (full issue page)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `ticket-01-issue-page-dark.png` | https://linear.app/docs/assigning-issues | 2392x1434 | dark | The whole issue page edge to edge: tab title bar, breadcrumb, title, description, sub-issues row, Activity with a comment box, and the Properties sidebar on the right (status, priority, assignee, estimate, labels, cycle, project). The source is a JPEG video frame, so it is slightly soft. | The ticket page layout: head (title and lead), the properties column, and the conversation with its reply box. |
| `ticket-02-issue-page-light.png` | https://linear.app/docs/comment-on-issues | 1682x1465 | light | The same layout in light theme, with a richer description (bullets, links), a Links row, and an AI "Discussion summary" card at the top of Activity. | The ticket's head and properties, plus the summary card at the top of the conversation (our "now" or plan block). |
| `ticket-03-activity-feed.png` | https://linear.app/changelog/2026-06-11-coding-sessions | 3600x2275 | dark | A close-up of the Activity timeline: system events with small icons and a connecting rail, "Automation" chips, an agent run collapsed into a card ("Changed 5 files ... #77421 >"), and the comment box. | The ticket's conversation and runs: how agent work and status changes read inside the timeline. |

## 2. overlays (peek, create modal, large modal, side sheet)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `overlays-01-create-issue-modal.png` | https://linear.app/changelog/2023-08-03-similar-issues | 3312x1734 | dark (on a purple gradient, no app behind) | The create-issue modal: team > Template chips, title, description placeholder, a row of property pills, an attach icon, "Create more" toggle, the primary "Create issue" button, and a "Possible duplicates" section. This is the 2023 design, close to today's. | `NewTicket` (the new-ticket modal), including its property pills and footer. |
| `overlays-02-large-modal-over-app.png` | https://linear.app/docs/loops | 3422x2292 | light | The whole app (sidebar plus the Loops list) dimmed behind a large "Create a new loop" modal: a prompt box, then a 2-column grid of template cards, with "Start from scratch" and a close button. | Large overlays over a screen: the scrim, the modal's width, its header and close button. Fits the workflow overlay and the item overlay. |
| `overlays-03-side-panel.png` | https://linear.app/docs/custom-views | 2160x1326 | dark (cropped corner on a gradient) | A right-docked details panel on a view: Overview/Insights tabs, title with star and menu, Visibility and Owner rows, and a segmented Assignees/Labels/Projects tab with a counted list. The toolbar has a panel-toggle button. This is an older (2023-24) design. | The peek's panel framing: the docked right sheet, its header, property rows and tabs. Linear's own Peek is no longer documented (see the end). |

## 3. library (settings-style lists of things)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `library-01-members-settings.png` | https://linear.app/changelog/2024-12-18-personalized-sidebar | 3312x1732 | dark (window on a white backdrop) | The whole settings screen: a grouped settings nav (Account / Features / Administration) and the Members table with a search field, a filter dropdown, "Export CSV" and the primary "Invite people", column headers, an "Active 7" group row and avatar rows. | The library screens (agents, skills, workflows, files): the left nav, the page title, the search/filter row with the primary action, and the dense table rows. |
| `library-02-dashboards-list.png` | https://linear.app/docs/dashboards | 2016x1036 | dark (on a gradient) | In-app list of saved things: Views tabs (Issues / Projects / Dashboards), "+ New dashboard", a "Linear · Workspace" group row, rows with a colored icon and name, and an Owner column. | The workflows and agents lists: one line per item, the icon and name at the left, metadata packed at the right, and a "new" action. |
| `library-03-labels-context-menu.png` | https://linear.app/changelog/2025-10-09-label-descriptions-and-archiving | 3600x1600 | dark (crop) | The Issue labels settings list with two rows selected (checkboxes, selection tint), Name and Description columns, expandable label groups, and a row context menu (Move to group >, Merge labels..., Archive..., Delete...). | Library rows: selection, groups, and a row's menu. Also usable as a context-menu reference for controls. |

## 4. editors (forms and editor pages)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `editors-01-workflow-statuses.png` | https://linear.app/docs/issue-property | 1922x1350 | dark (on a gradient) | The "Issue statuses & automations" settings: title and explanation, then a framed list grouped by phase (Triage, Backlog, Unstarted, Started). Each group has a header bar with "+", and each status row has a tinted icon tile, its name, an issue count and a description. | The workflow editor's stages grouped by phase: phase headers, stage rows, add affordances. Linear has no lane of stage cards, so this list is the nearest match. |
| `editors-02-team-settings.png` | https://linear.app/changelog/2024-12-18-personalized-sidebar | 3312x1732 | dark (window on a white backdrop) | A team's settings page: the settings nav, a "< Teams" back link, an Icon & Name / Identifier form card, then grouped setting rows (icon, title, description, value, chevron) under "Workflow". | Form cards and setting rows in our editors: field labels, inputs, row-with-value-and-chevron. |
| `editors-03-template-editor.png` | https://linear.app/docs/project-templates | 2160x1326 | dark (on a pink gradient) | "Edit project template": a back link, a "Template name" input, then a preview card of the project (title, summary, property pills), with Milestones and Issues sub-lists that have remove buttons and "+ Add milestone". | The library item editor and a workflow's own screen: name field, the editable body, and sub-lists with add and remove. |
| `editors-04-project-draft-with-chat.png` | https://linear.app/changelog/2026-09-03-priority-inbox | 3600x2368 | dark | A large project-drafting editor with an agent chat panel beside it. On the left: team > Template, "Save as draft", title, summary, two rows of property pills, then Problem / Outcome / Approach sections and a "Create project" button. On the right: chat messages, a "Worked for 1 minute" trace, a result card, and a composer with Skills. | The editor with a side panel (our library panel next to the lane), the top bar with its save actions, and the agent conversation. |

## 5. controls (menus, command menu, filter, tooltip, toast)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `controls-01-command-menu.png` | https://linear.app/docs/exporting-data | 1476x786 | dark | The Cmd+K command menu over a list: a context chip ("Project - New timeline"), a large query input with a spinner, a section header, a highlighted action row, and a "Search for ..." fallback with "Go to advanced search". | Our command menu or search (`useSearch`): input scale, sections, the highlighted row. |
| `controls-02-context-menu.png` | https://linear.app/docs/issue-property | 1752x1028 | dark | A right-click menu on an issue row: Status, Assignee, Priority (highlighted), Labels, Estimate, Cycle, Project, Milestone, Set due date..., each with a shortcut and a submenu arrow. The Priority submenu is open with a checkmark on the current value. | `TicketMenu` and row actions: item height, shortcut column, submenu, checked state. |
| `controls-03-filter-builder.png` | https://linear.app/changelog/2026-02-13-advanced-filters-and-share-issues-in-private-teams | 3600x1434 | dark (crop) | A filter chip ("Project is Localization API or Priority is Urgent ×") over its expanded editor: segmented chips (field / operator / value / ×) joined by "or", and "+ Add filter". | Our filter bar and its chips. This is not the plain Filter dropdown (see the end). |
| `controls-04-tooltip.png` | https://linear.app/docs/issue-property | 1356x833 | dark (on a gradient) | A two-line tooltip ("Due on May 31 / Tomorrow" with an icon) over a due-date pill in a list row. The row's pills (label, project, milestone, cycle) show behind it. | Tooltips on our pills and stage strips: size, padding, two-line content. Slightly under 1400 px wide but sharp. |
| `controls-05-notification-card.png` | https://linear.app/changelog/2025-12-04-openai-codex-agent | 3600x1376 | dark | A stacked notification card: an agent avatar with a done badge, an unread dot, "ENG-928 Uninitialized config variable", "now", and "Codex finished: ..." with two cards stacked behind it. Probably a stylized rendering of an Inbox notification, not an in-app toast. | The nearest thing to a toast: card radius, elevation, title and secondary line. Use with care (see the end). |

## 6. teams (many teams' work)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `teams-01-project-board-team-swimlanes.png` | https://linear.app/changelog/2025-03-06-sub-teams | 3600x1800 | dark (window on a white backdrop) | The full app with a projects board. The columns are statuses (Backlog 4 / Planned 4 / In Progress 5, each with ... and +). The swimlanes are teams (Mobile, iOS, Android) with tinted, collapsible lane headers, and the project cards are compact. | `TeamsView`: stages as columns, one swimlane per repo, lane heads, cards. This is the closest structural match. |
| `teams-02-initiatives-lead-teams.png` | https://linear.app/changelog/2026-08-13-team-initiatives | 3600x2080 | dark | The Initiatives list (Active / Planned / All tabs, filter and display buttons). Parent initiatives have nested children, and the columns are Priority, Owner, Lead team (team icon and key, outlined in a dashed marketing highlight), Projects (done/total) and Health. | The team or repo head line: who works there, how much is in flight, a health or status glyph, team keys. |
| `teams-03-project-board-status-swimlanes.png` | https://linear.app/docs/board-layout | 2560x1440 | dark | A projects board with quarter columns (Q4 2023 ... Q3 2024) and status swimlanes (Planned 4 / In Progress 6 / Complete 2). The cards carry an icon, title, summary, health and avatar, target date, and milestone with %. | Lane headers and richer cards on a board with swimlanes. |

## 7. intake (beyond Triage)

| File | Source | Size | Theme | What it shows | Matches in our screen |
|---|---|---|---|---|---|
| `intake-01-inbox-with-detail.png` | https://linear.app/changelog/2024-10-10-document-subscriptions | 3312x1734 | dark (window on a white backdrop) | The Inbox: a notification list (avatar, title, actor line, time, status glyph; the selected row is lit and the rest dim) and on the right the item's detail. The header has Unsubscribe, Snooze and Delete notification, and a floating "Latest changes" card shows a diff. | `IntakeView` and the Inbox: the list of incoming items, the selected row, header actions on the item (our "Take in" sits there). |
| `intake-02-my-issues-agents-waiting.png` | https://linear.app/changelog/2025-08-21-cursor-agent | 3600x1800 | dark (crop) | My Issues (Assigned / Created / Subscribed / Activity tabs) grouped by "Agents waiting for input 2" and "Low Risk 4". The rows carry a priority, key, status, title, then pills (project, label, age, $ value) and an agent state chip (Waiting / Finished / Working...) with avatars and a date. | Intake or queue rows that carry agent state and per-row chips at the right, grouped with counts. |

## Alternates (not downloaded, at the same CDN)

- Cmd+K in settings, light backdrop: `3c2b17b023bc6cac386cfb93c073a3ddf55e1b53-3600x1638.png` from https://linear.app/changelog/2025-07-24-dashboards
- Reviews split view (list plus a right preview pane, a peek-like layout): `79c4ed95f19dbea0b96655bad5c7bc0a7b0888c3-3312x1732.png` from https://linear.app/changelog/2025-01-23-pull-request-reviews
- Confirm dialog ("Retire team", with a destructive button): `7bad8b08be03d104e8291ac363a347844d09f822-3600x1770.png` from https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management
- Priority Inbox, list pane only: `b442b340278740de70919c868dce1afca4335fe7-3600x2080.png` from https://linear.app/docs/inbox
- Current create-issue modal (small): `25ae979891503f4780b6e837aaa71b5027c67281-1224x534.png` from https://linear.app/docs/creating-issues
- Teams list (in-app, dark): `2aa78477eeb62feb13b2bc41395ee5c69464a763-1771x948.png` from https://linear.app/docs/teams

## Where I found nothing good

- **Issue peek (the side preview).** `linear.app/docs/peek` now returns 404, and neither the docs nor the changelog has a current Peek screenshot. `overlays-03` (a docked side panel) and `intake-01` (list plus detail) stand in, and the Reviews split view above is another option.
- **Toasts.** No real in-app toast appears anywhere. `controls-05` is a notification card and only approximates one.
- **The plain Filter dropdown** (Filter > the list of properties). Only the advanced filter builder (`controls-03`) is large. The AI-filter dropdown on /docs/filters is 848x405, too small to use.
- **A current-design create-issue modal at 1400 px or wider.** The large one (`overlays-01`) is from 2023. Today's design exists only at 1224x534 (see Alternates).
- **Integrations settings list.** The integration pages have only logo art and marketplace listings, no settings list.
- **A workflow editor with a lane of stage cards.** Linear has no equivalent. The statuses list (`editors-01`) and the editor with a side panel (`editors-04`) are the nearest.
