type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Project Detail</h1>
      <p>Project ID: {projectId}</p>
    </main>
  );
}
