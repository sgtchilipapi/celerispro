import { describe, expect, it } from "vitest";

import { GithubRepoUrlSchema, ProjectSlugSchema } from "./schemas.js";

describe("GithubRepoUrlSchema", () => {
  it("accepts a valid GitHub HTTPS URL", () => {
    const result = GithubRepoUrlSchema.safeParse(
      "https://github.com/user/my-game",
    );

    expect(result.success).toBe(true);
  });

  it("accepts a valid GitHub SSH URL", () => {
    const result = GithubRepoUrlSchema.safeParse(
      "git@github.com:user/my-game.git",
    );

    expect(result.success).toBe(true);
  });

  it("rejects an invalid non-GitHub URL", () => {
    const result = GithubRepoUrlSchema.safeParse(
      "https://gitlab.com/user/my-game",
    );

    expect(result.success).toBe(false);
  });

  it("rejects an invalid malformed URL", () => {
    const result = GithubRepoUrlSchema.safeParse("not-a-url");

    expect(result.success).toBe(false);
  });
});

describe("ProjectSlugSchema", () => {
  it("accepts a valid slug and rejects invalid slugs", () => {
    expect(ProjectSlugSchema.safeParse("my-game").success).toBe(true);
    expect(ProjectSlugSchema.safeParse("My Game").success).toBe(false);
    expect(ProjectSlugSchema.safeParse("-my-game").success).toBe(false);
  });
});
