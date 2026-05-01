import { beforeEach, describe, expect, it } from "vitest";

import { GET as getProject } from "./[projectId]/route.js";
import { GET as listProjects, POST as createProject } from "./route.js";
import { resetProjectStore } from "./store.js";

async function readJson(response: Response): Promise<unknown> {
  return response.json();
}

describe("/api/projects", () => {
  beforeEach(() => {
    resetProjectStore();
  });

  it("creates a project", async () => {
    const response = await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My Game",
          slug: "my-game",
          githubRepoUrl: "https://github.com/user/my-game",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const body = (await readJson(response)) as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(body.name).toBe("My Game");
    expect(body.slug).toBe("my-game");
    expect(body.githubOwner).toBe("user");
    expect(body.githubRepo).toBe("my-game");
    expect(body.githubRepoUrl).toBe("https://github.com/user/my-game");
    expect(body.bootstrapStatus).toBe("PENDING");
  });

  it("rejects an invalid repo URL", async () => {
    const response = await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My Game",
          slug: "my-game",
          githubRepoUrl: "https://gitlab.com/user/my-game",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const body = (await readJson(response)) as {
      details: {
        fieldErrors: Record<string, string[] | undefined>;
      };
    };

    expect(response.status).toBe(400);
    expect(body.details.fieldErrors.githubRepoUrl).toContain(
      "Invalid GitHub repository URL",
    );
  });

  it("rejects a duplicate slug", async () => {
    await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My First Game",
          slug: "my-game",
          githubRepoUrl: "https://github.com/user/my-first-game",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const response = await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My Second Game",
          slug: "my-game",
          githubRepoUrl: "https://github.com/user/my-second-game",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const body = (await readJson(response)) as Record<string, unknown>;

    expect(response.status).toBe(409);
    expect(body.error).toBe("Project slug already exists");
  });

  it("lists projects", async () => {
    const firstResponse = await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My First Game",
          slug: "my-first-game",
          githubRepoUrl: "https://github.com/user/my-first-game",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const secondResponse = await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My Second Game",
          slug: "my-second-game",
          githubRepoUrl: "https://github.com/user/my-second-game",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const firstProject = (await readJson(firstResponse)) as {
      id: string;
    };
    const secondProject = (await readJson(secondResponse)) as {
      id: string;
    };

    const response = await listProjects();
    const body = (await readJson(response)) as Array<{
      id: string;
      slug: string;
    }>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body.map((project) => project.id)).toEqual([
      firstProject.id,
      secondProject.id,
    ]);
  });

  it("gets a project", async () => {
    const createResponse = await createProject(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "My Game",
          slug: "my-game",
          githubRepoUrl: "git@github.com:user/my-game.git",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const createdProject = (await readJson(createResponse)) as {
      id: string;
      githubOwner: string;
      githubRepo: string;
    };

    const response = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({
        projectId: createdProject.id,
      }),
    });
    const body = (await readJson(response)) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body.id).toBe(createdProject.id);
    expect(body.githubOwner).toBe("user");
    expect(body.githubRepo).toBe("my-game");
  });
});
