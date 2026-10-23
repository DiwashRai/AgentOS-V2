// What the workflow screens read from the library: the agents, skills and files a workflow names
// (by id), the runtimes the overrides pick from, and the ticket fields a prompt may name.
import { useAgents, useFiles, useRuntimes, useSkills, useTemplateFields } from "../../api/queries";
import type { Library } from "../../domain/workflow";

export function useLibrary(): Library {
  return {
    agents: useAgents().data?.items ?? [],
    skills: useSkills().data?.items ?? [],
    files: useFiles().data?.items ?? [],
    runtimes: useRuntimes().data ?? [],
    fields: useTemplateFields().data ?? [],
  };
}
