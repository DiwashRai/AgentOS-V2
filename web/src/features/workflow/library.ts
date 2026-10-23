// What the workflow screens read from the library: the agents, skills and files a workflow names
// (by id), the runtimes the overrides pick from, and the ticket fields a prompt may name.
import { useAgents, useFiles, useRuntimes, useSkills, useTemplateFields } from "../../api/queries";
import type { Agent, LibraryFile, Runtime, Skill, TemplateField } from "../../api/types";
import type { RefKind } from "./model";

export interface Library {
  agents: readonly Agent[];
  skills: readonly Skill[];
  files: readonly LibraryFile[];
  runtimes: readonly Runtime[];
  fields: readonly TemplateField[];
}

export function useLibrary(): Library {
  return {
    agents: useAgents().data?.items ?? [],
    skills: useSkills().data?.items ?? [],
    files: useFiles().data?.items ?? [],
    runtimes: useRuntimes().data ?? [],
    fields: useTemplateFields().data ?? [],
  };
}

export const agentOf = (lib: Library, id: string): Agent | undefined =>
  lib.agents.find((a) => a.id === id);

/** A skill's name or a file's path, by id (the id itself if the library has no such item). */
export function refName(lib: Library, kind: RefKind, id: string): string {
  if (kind === "skills") return lib.skills.find((s) => s.id === id)?.name ?? id;
  return lib.files.find((f) => f.id === id)?.path ?? id;
}

export const runtimeName = (lib: Library, id: string): string =>
  lib.runtimes.find((r) => r.id === id)?.name ?? id;
