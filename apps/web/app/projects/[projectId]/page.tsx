import { getProjectById, MOCK_USER_ID } from "../../api/projects/store";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Project Detail</h1>
      <p>Project ID: {projectId}</p>
      {!project || project.userId !== MOCK_USER_ID ? (
        <p>Project not found</p>
      ) : (
        <>
          <p>Project Name: {project.name}</p>
          <p>Repo URL: {project.githubRepoUrl}</p>
          <p>Bootstrap Status: {project.bootstrapStatus}</p>
        </>
      )}
    </main>
  );
}
