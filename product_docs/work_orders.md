Implementation Work Orders
WO-001 — Monorepo Foundation

Create:

pnpm workspace
Turborepo
TypeScript config
ESLint
Prettier
Vitest

Acceptance:

pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
WO-002 — Shared Validation Package

Create:

packages/shared

Implement:

ProjectSlugSchema
GithubRepoUrlSchema
CreateProjectSchema
BootstrapProjectSchema

Tests:

valid GitHub HTTPS URL
valid GitHub SSH URL
invalid non-GitHub URL
invalid malformed URL
slug validation

Acceptance:

pnpm --filter @celeris/shared test
WO-003 — Platform DB Package

Create:

packages/db

Implement Prisma schema:

User
Project
BootstrapJob
BootstrapStatus
JobStatus

Acceptance:

pnpm --filter @celeris/db db:generate
pnpm --filter @celeris/db test
WO-004 — Celeris Web App Shell

Create:

apps/web

Pages:

/
/login
/dashboard
/projects/new
/projects/[projectId]

Acceptance:

pnpm --filter @celeris/web dev

Manual:

All pages render
Project creation page shows form
WO-005 — Project API

Implement:

POST /api/projects
GET /api/projects
GET /api/projects/:projectId

Use mocked user until GitHub auth is implemented.

Tests:

create project
reject invalid repo URL
reject duplicate slug
list projects
get project

Acceptance:

pnpm --filter @celeris/web test
WO-006 — Project UI Wiring

Wire project form to API.

Acceptance:

User can create project from UI
User lands on project detail page
Project detail page shows repo URL and bootstrap status
WO-007 — GitHub Helper Package

Create:

packages/github

Implement:

parseGithubRepoUrl()
getRepoMetadata()
listRootContents()
isRepoSafeForBootstrap()
createFilesCommit()

Tests:

repo URL parsing
safe empty repo
safe repo with README only
unsafe repo with package.json
unsafe repo with apps/

Acceptance:

pnpm --filter @celeris/github test
WO-008 — Bootstrap Generator Package

Create:

packages/generator

Implement:

renderBootstrapRepo(input): GeneratedRepo

Initial generated files:

README.md
celeris.config.ts
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json

Tests:

all variables replaced
expected file paths generated
no unreplaced __VARIABLE__

Acceptance:

pnpm --filter @celeris/generator test
WO-009 — Bootstrap Preview API

Implement:

POST /api/projects/:projectId/bootstrap-preview

Returns generated file paths.

Acceptance:

Created project can produce bootstrap preview file list
WO-010 — Bootstrap Commit API

Implement:

POST /api/projects/:projectId/bootstrap

Flow:

Load project
Validate GitHub access
Validate repo safety
Render generated repo
Commit generated files
Store commit SHA
Set bootstrapStatus = BOOTSTRAPPED

Tests:

success
unsafe repo rejected
GitHub commit failure sets FAILED

Acceptance:

Real empty GitHub repo receives bootstrap commit
Project detail page shows BOOTSTRAPPED
WO-011 — Generated Workspace Skeleton

Expand template to include:

apps/web
apps/server
packages/db
packages/shared
packages/game-core
programs/game
scripts

Acceptance inside generated repo:

pnpm install
pnpm typecheck
pnpm test
pnpm build
WO-012 — Generated Fastify Backend

Implement:

GET /health
GET /actions

Acceptance:

pnpm --filter @game/server test
pnpm --filter @game/server dev
curl http://localhost:4000/health
WO-013 — Generated Shared Actions

Implement:

packages/shared/src/actions.ts

Action:

mint_item
creditCost = 10

Backend /actions must return it.

Acceptance:

curl http://localhost:4000/actions
WO-014 — Generated Prisma DB

Implement:

Player
Item
seed-db.ts

Acceptance:

pnpm --filter @game/db prisma generate
pnpm db:migrate
pnpm db:seed
WO-015 — Backend DB Action

Implement:

POST /actions/mint-item

Behavior:

Validate request
Upsert player
Create item
Return result

Acceptance:

curl -X POST http://localhost:4000/actions/mint-item \
  -H "Content-Type: application/json" \
  -d '{"playerId":"demo-player","itemId":"demo-sword"}'
WO-016 — Generated Frontend

Implement homepage:

Health status
Actions list
Mint Demo Item button
Result panel
RPC URL
Program ID

Acceptance:

pnpm --filter @game/web dev

Manual:

Open localhost:3000
Click Mint Demo Item
Result JSON appears
WO-017 — Generated Anchor Program

Implement Anchor program with:

initialize_game
mint_item_record

Acceptance:

cd programs/game
anchor build
WO-018 — Program ID Consistency Script

Implement:

scripts/check-program-id.ts

Verifies keypair public key matches:

declare_id!()
Anchor.toml
celeris.config.ts
.env.example

Acceptance:

pnpm tsx scripts/check-program-id.ts
WO-019 — Local Docker Compose

Implement:

docker-compose.local.yml
Dockerfile.deployer
apps/server/Dockerfile
apps/web/Dockerfile

Acceptance:

pnpm celeris:local

Then:

curl http://localhost:4000/health
curl http://localhost:3000
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
WO-020 — Local README and Onboarding

Generated README must include:

Prerequisites
Clone command
Install command
Local run command
Service URLs
Troubleshooting
Reset local environment command

Reset command:

docker compose -f docker-compose.local.yml down -v --remove-orphans

Acceptance:

A new developer can follow README and run the local stack
WO-021 — GitHub OAuth

Implement real GitHub login.

Store:

githubUserId
githubUsername
email
encrypted access token

Acceptance:

User signs in with GitHub
Dashboard shows GitHub username
Project belongs to signed-in user
WO-022 — Bootstrap Uses User GitHub Token

Bootstrap must use the signed-in user’s GitHub token.

Acceptance:

User signs in
Creates project
Pastes empty repo URL
Clicks bootstrap
Commit appears in GitHub repo
WO-023 — Dashboard Final UX

Project detail page shows:

Repo URL
Bootstrap status
Commit SHA
Clone command
Install command
Local run command
Service URLs

Acceptance:

The dashboard clearly tells the developer how to run the generated project locally

Final MVP Acceptance Test

A full MVP pass means this works from zero:

1. User signs in with GitHub
2. User creates a project
3. User submits an empty GitHub repo URL
4. Celeris commits generated stack
5. User clones repo
6. User runs pnpm install
7. User runs pnpm celeris:local
8. Frontend opens on localhost:3000
9. Backend responds on localhost:4000/health
10. Postgres stores demo item records
11. Solana local validator responds on localhost:8899
12. Anchor program deploys successfully
13. Mint Demo Item button works from frontend

Final demo command:

git clone https://github.com/user/my-game.git
cd my-game
pnpm install
pnpm celeris:local