import { getProjectById, MOCK_USER_ID } from "../store";

type ProjectRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: ProjectRouteContext,
): Promise<Response> {
  const { projectId } = await context.params;
  const project = getProjectById(projectId);

  if (!project || project.userId !== MOCK_USER_ID) {
    return Response.json(
      {
        error: "Project not found",
      },
      { status: 404 },
    );
  }

  return Response.json(project);
}
