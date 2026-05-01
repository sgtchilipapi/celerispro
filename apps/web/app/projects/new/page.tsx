export default function NewProjectPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "32rem" }}>
      <h1>Create Project</h1>
      <form style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>Project Name</span>
          <input name="name" type="text" />
        </label>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>Project Slug</span>
          <input name="slug" type="text" />
        </label>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>GitHub Repository URL</span>
          <input name="githubRepoUrl" type="url" />
        </label>
        <button type="submit">Create Project</button>
      </form>
    </main>
  );
}
