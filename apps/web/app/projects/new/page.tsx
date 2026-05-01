"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateProjectResponse = {
  id: string;
};

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        slug: formData.get("slug"),
        githubRepoUrl: formData.get("githubRepoUrl"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(body?.error ?? "Failed to create project");
      setIsSubmitting(false);
      return;
    }

    const project = (await response.json()) as CreateProjectResponse;
    router.push(`/projects/${project.id}`);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "32rem" }}>
      <h1>Create Project</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>Project Name</span>
          <input name="name" type="text" required />
        </label>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>Project Slug</span>
          <input name="slug" type="text" required />
        </label>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>GitHub Repository URL</span>
          <input name="githubRepoUrl" type="url" required />
        </label>
        {error ? (
          <p style={{ color: "#b00020", margin: 0 }}>{error}</p>
        ) : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating Project..." : "Create Project"}
        </button>
      </form>
    </main>
  );
}
