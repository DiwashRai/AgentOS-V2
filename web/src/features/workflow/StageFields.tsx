// The selected stage's settings, inline in its opened card (no dialog): name and phase; the agent
// and its overrides together on two lines; the prompt; the stage's own skills and files; maker or
// check (said on screen, with a check's repairs beside it); then the switches and numbers in two
// columns. A shell stage has its command in place of the agent and
// prompt. Every edit is one step of the draft.
import type { ReactNode } from "react";

import type { AgentStage, Effort, ShellStage, Stage } from "../../api/types";
import {
  Field,
  FormRow,
  NumberField,
  type Option,
  Segmented,
  Select,
  Stack,
  TextArea,
  Toggle,
} from "../../kit";
import { agentOf, type Library, runtimeName } from "./library";
import { isCheck, PHASES, type RefKind, type StageProblem } from "./model";
import { type Fresh, StageChips } from "./StageCard";

const EFFORTS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];
const REPAIRS = [0, 1, 2, 3] as const;

export interface FieldsProps {
  stage: Stage;
  lib: Library;
  /** What's wrong with the stage (said under the prompt when it is the prompt's). */
  problem: StageProblem | undefined;
  set: (s: Stage) => void;
  removeRef: (kind: RefKind, id: string) => void;
  /** The chip that just landed here, to scroll to and flash. */
  fresh: Fresh | null;
}

/** Two settings side by side, each with its own label column; one under the other when narrow. */
function Pair({ children }: { children: ReactNode }) {
  return (
    <Stack cols={2} gap={9}>
      {children}
    </Stack>
  );
}

function Half({ children }: { children?: ReactNode }) {
  return <Stack gap={4}>{children}</Stack>;
}

const opts = (xs: readonly string[], inherit: string): Option[] => [
  { id: "", label: inherit },
  ...xs.map((x) => ({ id: x, label: x })),
];

interface AgentProps {
  s: AgentStage;
  lib: Library;
  set: (s: Stage) => void;
}

/** The runtime, model and effort this stage sets over its agent's, each "the agent's" when unset. */
function Overrides({ s, lib, set }: AgentProps) {
  const a = agentOf(lib, s.agent);
  const o = s.overrides;
  const runtime = o.runtime ?? a?.runtime;
  const models = lib.runtimes.find((r) => r.id === runtime)?.models ?? [];
  const over = (patch: Partial<AgentStage["overrides"]>) => {
    set({ ...s, overrides: { ...o, ...patch } });
  };
  const own = a ? `the agent's: ${runtimeName(lib, a.runtime)} · ${a.model} · ${a.effort}` : "";
  return (
    <FormRow label="Overrides" note={own}>
      <Select
        label="Runtime"
        value={o.runtime ?? ""}
        options={[
          { id: "", label: "Agent's runtime" },
          ...lib.runtimes.map((r) => ({ id: r.id, label: r.name })),
        ]}
        onChange={(id) => {
          over({ runtime: lib.runtimes.find((r) => r.id === id)?.id ?? null, model: null });
        }}
      />
      <Select
        label="Model"
        value={o.model ?? ""}
        options={opts(models, "Agent's model")}
        onChange={(id) => {
          over({ model: id === "" ? null : id });
        }}
      />
      <Select
        label="Effort"
        value={o.effort ?? ""}
        options={opts(EFFORTS, "Agent's effort")}
        onChange={(id) => {
          over({ effort: EFFORTS.find((e) => e === id) ?? null });
        }}
      />
    </FormRow>
  );
}

/** The picker's option ids are the faces' seeds, so an agent has one face on its card, in the
 *  library panel and here. */
const SEED = "agent:";

/** The agent, and its overrides on the line under it. */
function AgentRows({ s, lib, set }: AgentProps) {
  const a = agentOf(lib, s.agent);
  return (
    <>
      <FormRow label="Agent" {...(a ? { note: a.description } : {})}>
        <Select
          label="Agent"
          value={`${SEED}${s.agent}`}
          options={lib.agents.map((x) => ({ id: `${SEED}${x.id}`, label: x.name, face: true }))}
          onChange={(id) => {
            set({ ...s, agent: id.slice(SEED.length) });
          }}
        />
      </FormRow>
      <Overrides s={s} lib={lib} set={set} />
    </>
  );
}

const fieldsNote = (lib: Library) =>
  `Ticket fields as {{ name }}: ${lib.fields.map((f) => f.name).join(", ")}`;

function AgentFields({ s, lib, problem, set }: FieldsProps & { s: AgentStage }) {
  const promptProblem = problem?.field === "prompt" ? problem.text : undefined;
  return (
    <>
      <AgentRows s={s} lib={lib} set={set} />
      <FormRow
        label="Prompt"
        note={fieldsNote(lib)}
        {...(promptProblem ? { problem: promptProblem } : {})}
      >
        <TextArea
          label="Prompt"
          value={s.prompt}
          lines={4}
          onChange={(prompt) => {
            set({ ...s, prompt });
          }}
        />
      </FormRow>
    </>
  );
}

function ShellFields({ s, set }: { s: ShellStage; set: (s: Stage) => void }) {
  return (
    <FormRow label="Command">
      <Field
        label="Command"
        mono
        value={s.command}
        placeholder="npm run lint"
        onChange={(command) => {
          set({ ...s, command });
        }}
      />
    </FormRow>
  );
}

const ROLES = [
  { id: "maker", label: "Maker" },
  { id: "check", label: "Check" },
] as const;

/** What each role does in a loop, said beside the choice. */
function roleNote(s: Stage): string {
  if (!isCheck(s)) return "Changes the work; a loop repeats it until its checks pass";
  return s.kind === "shell"
    ? "Fails the round on a non-zero exit"
    : "Its verdict can fail the round; an invalid one is repaired by resuming, up to this often";
}

/** Maker or check, said on screen, with a check's repairs beside it. */
function CheckRow({ s, set }: { s: Stage; set: (s: Stage) => void }) {
  const role = (id: string) => {
    const check = id === "check";
    if (check === isCheck(s)) return;
    if (s.kind === "shell") set({ ...s, check });
    else set({ ...s, check: check ? { repairs: 1 } : null });
  };
  return (
    <FormRow label="Role" note={roleNote(s)}>
      <Segmented
        label="Role"
        items={ROLES}
        value={isCheck(s) ? "check" : "maker"}
        onChange={role}
        fit
      />
      {s.kind === "agent" && s.check ? (
        <NumberField
          label="Verdict repairs"
          value={s.check.repairs}
          min={0}
          max={3}
          unit="repairs"
          onChange={(n) => {
            set({ ...s, check: { repairs: REPAIRS.find((r) => r === n) ?? 0 } });
          }}
        />
      ) : null}
    </FormRow>
  );
}

function Switch({ label, on, flip }: { label: string; on: boolean; flip: (on: boolean) => void }) {
  return (
    <FormRow label={label}>
      <Toggle label={label} on={on} onChange={flip} />
    </FormRow>
  );
}

export function StageFields(props: FieldsProps) {
  const { stage: s, lib, set, removeRef, fresh } = props;
  return (
    <Stack gap={4}>
      <Pair>
        <Half>
          <FormRow label="Name">
            <Field
              label="Name"
              value={s.name}
              onChange={(name) => {
                set({ ...s, name });
              }}
            />
          </FormRow>
        </Half>
        <Half>
          <FormRow label="Phase">
            <Select
              label="Phase"
              value={s.phase}
              options={PHASES}
              onChange={(id) => {
                set({ ...s, phase: PHASES.find((p) => p.id === id)?.id ?? s.phase });
              }}
            />
          </FormRow>
        </Half>
      </Pair>
      {s.kind === "agent" ? <AgentFields {...props} s={s} /> : <ShellFields s={s} set={set} />}
      <FormRow label="Skills and files" note="Drag more from the library, or click one there">
        <StageChips stage={s} lib={lib} onRemove={removeRef} fresh={fresh} />
      </FormRow>
      <CheckRow s={s} set={set} />
      <Pair>
        <Half>
          {s.kind === "agent" ? (
            <Switch
              label="Resume session"
              on={s.resume}
              flip={(resume) => {
                set({ ...s, resume });
              }}
            />
          ) : null}
          <Switch
            label="Enabled"
            on={s.enabled}
            flip={(enabled) => {
              set({ ...s, enabled });
            }}
          />
        </Half>
        <Half>
          <FormRow label="Timeout">
            <NumberField
              label="Timeout"
              value={s.timeout_min}
              min={1}
              max={240}
              unit="min"
              onChange={(timeout_min) => {
                set({ ...s, timeout_min });
              }}
            />
          </FormRow>
          <Switch
            label="Needs a repo"
            on={s.needs_repo}
            flip={(needs_repo) => {
              set({ ...s, needs_repo });
            }}
          />
        </Half>
      </Pair>
    </Stack>
  );
}
