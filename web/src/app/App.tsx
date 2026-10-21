import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import { fixtureSource } from "../api/fixtureSource";
import { SourceContext } from "../api/queries";
import { CompactView } from "../features/compact/CompactView";
import { IntakeView } from "../features/intake/IntakeView";
import { AgentsView } from "../features/library/AgentsView";
import { AgentView } from "../features/library/AgentView";
import { FilesView } from "../features/library/FilesView";
import { FileView } from "../features/library/FileView";
import { SkillsView } from "../features/library/SkillsView";
import { SkillView } from "../features/library/SkillView";
import { WorkflowsView } from "../features/library/WorkflowsView";
import { KitSheet } from "../features/sheet/KitSheet";
import { QueueView } from "../features/queue/QueueView";
import { TeamsView } from "../features/teams/TeamsView";
import { TicketView } from "../features/ticket/TicketView";
import { WorkflowView } from "../features/workflow/WorkflowView";
import { Layout } from "./Layout";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <QueueView /> },
      { path: "compact", element: <CompactView /> },
      { path: "intake", element: <IntakeView /> },
      { path: "t/:key", element: <TicketView /> },
      { path: "teams", element: <TeamsView /> },
      { path: "library/workflows", element: <WorkflowsView /> },
      { path: "library/workflows/:id", element: <WorkflowView /> },
      { path: "library/agents", element: <AgentsView /> },
      { path: "library/agents/:id", element: <AgentView /> },
      { path: "library/skills", element: <SkillsView /> },
      { path: "library/skills/:id", element: <SkillView /> },
      { path: "library/files", element: <FilesView /> },
      { path: "library/files/:id", element: <FileView /> },
      { path: "kit", element: <KitSheet /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

// Reads never retry: a failure shows at once. Fixture data never goes stale.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});

export function App() {
  return (
    <SourceContext value={fixtureSource}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </SourceContext>
  );
}
