# Spec: the library and the workflow editor (web, static, on fixtures)

The owner's goal: building an agentic workflow should feel like digital Lego. Reusable parts go in a library, and a workflow puts them together in order. Editing takes few clicks; the controls used together sit together and are always visible; stages and parts can be dragged; editing always gets the full window.

This extends the W0 screens. It is static and on fixtures, like them: buttons may do nothing, but every screen and state below is drawn. Use V2's terms (docs/vision.md, requirements.md R16–R28, rules.md › Workflows):

| The owner's word | V2's term |
|---|---|
| Pipeline | Workflow |
| A step | Stage |
| Primitives | Library items |

Add nothing outside this spec. If the spec doesn't say whether something exists, leave it out.

## The model (what the screens show)

**Library** (one per Space, R19): the shared items. A ticket copies what it uses, and shows drift both ways.

**Agent** (R23):
- name and description;
- instructions (markdown);
- runtime (Claude Code or Copilot CLI);
- model and effort (low, medium, high, xhigh, max);
- version, and who changed it and when;
- which workflows use it.

**Skill** (R16, R20):
- name and description;
- `SKILL.md` content (markdown);
- version, who and when;
- which workflows and tickets use it.

**File** (R16), a path plus its content. `AGENTS.md` is a file, edited as named blocks: each block has a name and markdown, and the blocks can be reordered. Notes and the plan are ticket-only items, not library files.

**Workflow** (R24–R28): name, description, version, and whether it's the default ("Standard" is seeded). It has:
- **Stages, in order.** Each stage has:
  - kind: agent or shell;
  - name and phase (plan, build, verify or review);
  - enabled;
  - for an agent stage: the agent, plus optional runtime, model and effort overrides;
  - for a shell stage: the command;
  - the prompt (a template over ticket fields, R28; agent stages);
  - check or maker; for a check, verdict repairs from 0 to 3;
  - resume session (agent stages);
  - needs a repo;
  - timeout;
  - gate after.
- **Loops:** a block of consecutive stages repeated up to 5 rounds until its checks pass. A loop needs one check and one maker; loops don't overlap; a gate only on a loop's last stage (rules.md › Workflows).
- **Workflow-wide context:** the skills and files every stage gets, usually including `AGENTS.md`. A stage can add more skills and files of its own.

The prompt belongs to the stage, not the library.

**A ticket's copy** (R27): which workflow and version it came from, and whether it has drifted (the library is newer, or the ticket changed it). It offers:
- **Take the library's version.**
- **Promote to library** (admins; refused with a diff if the library moved meanwhile).

## The screens

The sidebar's Context section lists Workflows, Agents, Skills and Files (Agents and Skills are already there). Each opens its library screen.

### 1. Library lists: Workflows, Agents, Skills, Files

Each is a list in the app's list style, with search and New:
- **Workflows:** name, stages as a compact strip, the default mark, version, last changed, used by N tickets.
- **Agents:** name, runtime, model, effort, used by N workflows.
- **Skills:** name, description, used by N.
- **Files:** path, size, used by N. `AGENTS.md` is first.

Selecting an item opens its editor. A list-and-detail split is fine where it saves a click.

### 2. Item editors: Agent, Skill, File

One shared layout for all three:
- a header with the name, the version, "edited by … · when", and Save and Discard;
- the main body: the content editor, a monospace markdown area; for `AGENTS.md`, a list of named blocks, each collapsible, reorderable and editable in place;
- a side column with the properties (for an agent: runtime, model and effort, as pickers inline), "Used by" (the workflows and tickets that use it), and the version history (the latest few, each with who or which run).

States: clean; edited (unsaved, with Save lit); a version conflict on save (someone else saved meanwhile: show both, with keep-mine and take-theirs).

### 3. The workflow editor: the central screen

Used full window, both from the library and from a ticket (screen 5). One component, two framings.
- **Header:** the workflow's name, version, the default mark, Save and Discard, and Undo and Redo. From a ticket: "Ticket NW-17's copy of Standard v3", the drift state, and Take library version and Promote.
- **Centre: the stage lane.** The stages top to bottom, as cards in order:
  - Each card shows its phase, name, agent (face and name) or shell command, effort, skill and file chips, and the check or maker mark. Its prompt is collapsed to one line and expands in place.
  - A gate sits between cards as a diamond on the lane, matching the ticket's stepper. Clicking the diamond toggles it.
  - A loop draws as a bracket around its stages, with "up to N rounds".
  - Disabled stages are dimmed.
  - Cards drag to reorder (with a handle and a drop line). Each has a + between it and the next, to insert a stage.
- **The selected card** shows all its fields inline, with no dialog: agent, overrides, prompt, check and repairs, resume, needs a repo, timeout, enabled.
- **Right: the library panel.** Tabs for Agents, Skills and Files, a search box, and items as small cards. You can:
  - drag an agent onto a card to set it, or onto the lane to add a stage with it;
  - drag a skill or a file onto a card to add it to that stage, or onto the workflow-context strip to give it to every stage;
  - click an item to add it to the selected card, as a keyboard-friendly alternative to dragging.
- **Above the lane: the workflow-context strip.** The skills and files every stage gets, as chips, each with a remove.
- **Validation inline:** a loop without a check, a prompt naming an unknown field, or a gate inside a loop shows a short message on the card. Save stays possible but says how many problems there are.

States to draw:
- Standard, in the library, clean;
- the same with a card selected and expanded;
- mid-drag (a skill over a card, with the drop line or highlight);
- a ticket copy with drift ("Library has v4"), opened from the ticket;
- a validation problem on one card.

### 4. The ticket's Workflow tab (read only)

On the ticket page, under its tabs:
- the workflow's name, version and drift state, with the stages as a read-only lane (the same cards, compact, with no editing affordances);
- the gates and loops;
- per stage, its last run state if any, taken from the ticket's runs;
- the workflow context as chips;
- one Edit button, which opens screen 3 for the ticket's copy.

No editing happens inside the tab.

### 5. The ticket's workflow editor (overlay)

Edit opens screen 3 as a full-window overlay over the ticket: the whole viewport, with a close at the top left and Esc. Its body is the same component as the library editor, framed as the ticket's copy. Closing with unsaved changes asks inside the overlay (Save, Discard, or keep editing).

### 6. The ticket's other tabs

These are views the ticket page already lists (R14), drawn here so the set is complete:
- **Runs:** the ticket's runs, newest first. Each run shows its state, who started it, from which stage, its stages with their states, rounds and verdicts, and its time and budget. One run expanded.
- **Context:** the ticket's items (R16):
  - `AGENTS.md` blocks, skills, agents, notes, the plan and files;
  - each with its version, a writable-by-agents toggle, and its drift from the library;
  - Edit opens the shared item editor (screen 2) in the same full-window overlay as screen 5.

## Fixtures

Extend `web/src/domain/fixtures.ts` and the API types with:
- a Northwind library: 3 workflows (Standard, plus a review-heavy one with a loop, plus a no-repo docs one), 5 agents (Planner, Builder, Reviewer, Linter as a shell check, Writer), 6 skills, and 4 files including `AGENTS.md` with 3 blocks;
- NW-17's copy of Standard, drifted from v4;
- NW-17's runs: the running one plus one finished;
- NW-17's context items.

Keep them plausible and consistent with the existing fixtures (the same people, repos and tickets).

## Interaction principles (the owner's)

- Fewest clicks: the common edits (pick an agent, toggle a gate, add a skill, reorder) are one action, in place.
- Controls used together sit together and stay visible. No hunting through menus for frequent actions.
- Drag and drop for building, with a click alternative for everything.
- Editing always has the full window. Read-only views stay compact.
- The library editor and the ticket editor are the same component.
