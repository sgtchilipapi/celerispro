import { z } from "zod";

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

export const ProjectSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const GithubRepoUrlSchema = z.string().refine(isGithubRepoUrl, {
  message: "Invalid GitHub repository URL",
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  slug: ProjectSlugSchema,
  githubRepoUrl: GithubRepoUrlSchema,
});

export const BootstrapProjectSchema = z.object({
  projectId: z.string().min(1),
});
