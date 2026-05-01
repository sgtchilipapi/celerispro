import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const schemaPath = resolve(import.meta.dirname, "../prisma/schema.prisma");

describe("platform prisma schema", () => {
  it("defines the required models", () => {
    const schema = readFileSync(schemaPath, "utf8");

    expect(schema).toContain("model User {");
    expect(schema).toContain("model Project {");
    expect(schema).toContain("model BootstrapJob {");
  });

  it("defines the required enums", () => {
    const schema = readFileSync(schemaPath, "utf8");

    expect(schema).toContain("enum BootstrapStatus {");
    expect(schema).toContain("enum JobStatus {");
    expect(schema).toContain("BOOTSTRAPPED");
    expect(schema).toContain("RUNNING");
    expect(schema).toContain("SUCCESS");
    expect(schema).toContain("FAILED");
  });
});
