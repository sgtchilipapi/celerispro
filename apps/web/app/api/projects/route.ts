import { z } from "zod";

import {
  createProjectRecord,
  findProjectBySlug,
  listProjectsForUser,
  MOCK_USER_ID,
} from "./store";

const githubHttpsRepoPathPattern =
  /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/;
const githubSshRepoUrlPattern =
  /^git@github\.com:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/;

function isGithubRepoUrl(value: string): boolean {
  if (githubSshRepoUrlPattern.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || url.hostname !== "github.com") {
      return false;
    }

    const repoPath = url.pathname.replace(/^\/+/, "");
    return githubHttpsRepoPathPattern.test(repoPath);
  } catch {
    return false;
  }
}

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  githubRepoUrl: z.string().refine(isGithubRepoUrl, {
    message: "Invalid GitHub repository URL",
  }),
});

function parseGithubRepoUrl(githubRepoUrl: string): {
  githubOwner: string;
  githubRepo: string;
} {
  if (githubRepoUrl.startsWith("git@github.com:")) {
    const repoPath = githubRepoUrl
      .slice("git@github.com:".length)
      .replace(/\.git$/, "");
    const [githubOwner, githubRepo] = repoPath.split("/");

    return {
      githubOwner,
      githubRepo,
    };
  }

  const url = new URL(githubRepoUrl);
  const repoPath = url.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
  const [githubOwner, githubRepo] = repoPath.split("/");

  return {
    githubOwner,
    githubRepo,
  };
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const result = CreateProjectSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        error: "Invalid request body",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const duplicateProject = findProjectBySlug(MOCK_USER_ID, result.data.slug);

  if (duplicateProject) {
    return Response.json(
      {
        error: "Project slug already exists",
      },
      { status: 409 },
    );
  }

  const { githubOwner, githubRepo } = parseGithubRepoUrl(
    result.data.githubRepoUrl,
  );
  const project = createProjectRecord({
    userId: MOCK_USER_ID,
    name: result.data.name,
    slug: result.data.slug,
    githubOwner,
    githubRepo,
    githubRepoUrl: result.data.githubRepoUrl,
  });

  return Response.json(project, { status: 201 });
}

export async function GET(): Promise<Response> {
  return Response.json(listProjectsForUser(MOCK_USER_ID));
}
