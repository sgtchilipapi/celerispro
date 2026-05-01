export const MOCK_USER_ID = "mock-user";

export type ProjectRecord = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  githubOwner: string;
  githubRepo: string;
  githubRepoUrl: string;
  bootstrapStatus: "PENDING";
  bootstrapCommitSha: null;
  createdAt: string;
  updatedAt: string;
};

type CreateProjectRecordInput = {
  userId: string;
  name: string;
  slug: string;
  githubOwner: string;
  githubRepo: string;
  githubRepoUrl: string;
};

const projects = new Map<string, ProjectRecord>();

export function createProjectRecord(
  input: CreateProjectRecordInput,
): ProjectRecord {
  const timestamp = new Date().toISOString();
  const project: ProjectRecord = {
    id: crypto.randomUUID(),
    userId: input.userId,
    name: input.name,
    slug: input.slug,
    githubOwner: input.githubOwner,
    githubRepo: input.githubRepo,
    githubRepoUrl: input.githubRepoUrl,
    bootstrapStatus: "PENDING",
    bootstrapCommitSha: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  projects.set(project.id, project);

  return project;
}

export function findProjectBySlug(
  userId: string,
  slug: string,
): ProjectRecord | undefined {
  return Array.from(projects.values()).find((project) => {
    return project.userId === userId && project.slug === slug;
  });
}

export function listProjectsForUser(userId: string): ProjectRecord[] {
  return Array.from(projects.values()).filter((project) => {
    return project.userId === userId;
  });
}

export function getProjectById(projectId: string): ProjectRecord | undefined {
  return projects.get(projectId);
}

export function resetProjectStore(): void {
  projects.clear();
}
