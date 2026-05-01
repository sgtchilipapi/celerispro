// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NewProjectPage from "./page.js";

const push = vi.fn();

vi.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push,
    }),
  };
});

describe("NewProjectPage", () => {
  beforeEach(() => {
    push.mockReset();
    vi.restoreAllMocks();
  });

  it("submits the project form and redirects to the project detail page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "project-123",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<NewProjectPage />);

    await userEvent.type(screen.getByLabelText("Project Name"), "My Game");
    await userEvent.type(screen.getByLabelText("Project Slug"), "my-game");
    await userEvent.type(
      screen.getByLabelText("GitHub Repository URL"),
      "https://github.com/user/my-game",
    );
    await userEvent.click(screen.getByRole("button", { name: "Create Project" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My Game",
          slug: "my-game",
          githubRepoUrl: "https://github.com/user/my-game",
        }),
      });
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/projects/project-123");
    });
  });
});
