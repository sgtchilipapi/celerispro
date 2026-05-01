Product Goal

Celeris lets an indie game developer:

Sign in with GitHub.
Create a Celeris project.
Paste an empty GitHub repo URL.
Let Celeris commit a complete game bootstrap stack.
Clone the repo locally.
Run one command.
Launch the full local game development stack.

The local stack includes:

Frontend
Backend API
Postgres database
Prisma migrations
Solana local validator
Anchor/Solana program deployment
MVP User Workflow
1. Developer signs in to Celeris with GitHub
2. Developer creates a new Celeris project
3. Developer creates an empty GitHub repo
4. Developer pastes repo URL into Celeris
5. Developer clicks Bootstrap Repository
6. Celeris commits the generated stack to GitHub
7. Developer clones the repo
8. Developer runs:

   pnpm install
   pnpm celeris:local

9. Local frontend becomes available at:

   http://localhost:3000

10. Local backend becomes available at:

   http://localhost:4000

11. Local Solana RPC becomes available at:

   http://localhost:8899
Generated Repo Structure
my-game/
  apps/
    web/
      app/
      package.json
      Dockerfile

    server/
      src/
        index.ts
        routes/
          health.ts
          actions.ts
      package.json
      Dockerfile

  packages/
    db/
      prisma/
        schema.prisma
      src/
        client.ts
      package.json

    shared/
      src/
        actions.ts
        index.ts
      package.json

    game-core/
      src/
        index.ts
      package.json

  programs/
    game/
      Anchor.toml
      Cargo.toml
      programs/
        game/
          Cargo.toml
          src/
            lib.rs

  scripts/
    seed-db.ts
    check-program-id.ts
    local-start.sh

  docker-compose.local.yml
  Dockerfile.deployer
  celeris.config.ts
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  .env.example
  README.md
Generated Root Scripts
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",

    "db:generate": "pnpm --filter @game/db prisma generate",
    "db:migrate": "pnpm --filter @game/db prisma migrate deploy",
    "db:seed": "pnpm tsx scripts/seed-db.ts",

    "program:build": "cd programs/game && anchor build",
    "program:deploy": "cd programs/game && anchor deploy --provider.cluster localnet",

    "celeris:local": "docker compose -f docker-compose.local.yml up --build"
  }
}
Local Runtime Architecture
Developer Machine
  ↓
docker-compose.local.yml
  ↓
postgres
solana-validator
deployer
server
web

Services:

web              http://localhost:3000
server           http://localhost:4000
postgres         localhost:5432
solana-validator localhost:8899
deployer         one-shot setup container
docker-compose.local.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: game
      POSTGRES_PASSWORD: game
      POSTGRES_DB: game
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  solana-validator:
    image: celeris/solana-anchor:latest
    command: solana-test-validator --reset --rpc-port 8899 --bind-address 0.0.0.0
    ports:
      - "8899:8899"

  deployer:
    build:
      context: .
      dockerfile: Dockerfile.deployer
    depends_on:
      - postgres
      - solana-validator
    environment:
      DATABASE_URL: postgresql://game:game@postgres:5432/game
      SOLANA_RPC_URL: http://solana-validator:8899
    command: >
      sh -c "
      pnpm install &&
      pnpm db:generate &&
      pnpm db:migrate &&
      pnpm db:seed &&
      pnpm program:build &&
      pnpm program:deploy
      "

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    depends_on:
      - postgres
      - solana-validator
      - deployer
    environment:
      DATABASE_URL: postgresql://game:game@postgres:5432/game
      SOLANA_RPC_URL: http://solana-validator:8899
      PORT: 4000
    ports:
      - "4000:4000"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    depends_on:
      - server
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
      NEXT_PUBLIC_SOLANA_RPC_URL: http://localhost:8899
    ports:
      - "3000:3000"

volumes:
  postgres-data:
Celeris Platform Scope
Web App Features
GitHub login
Project creation
GitHub repo URL submission
Repo safety validation
Bootstrap commit
Project detail screen
Copyable local setup commands

Project detail screen shows:

Project name
GitHub repo URL
Bootstrap status
Bootstrap commit SHA
Clone command
Local run command
Celeris Database Schema
model User {
  id             String   @id @default(cuid())
  githubUserId   String   @unique
  githubUsername String
  email          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  projects       Project[]
}

model Project {
  id                 String   @id @default(cuid())
  userId             String
  name               String
  slug               String
  githubOwner        String
  githubRepo         String
  githubRepoUrl      String
  bootstrapStatus    BootstrapStatus @default(PENDING)
  bootstrapCommitSha String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user               User @relation(fields: [userId], references: [id])
  bootstrapJobs      BootstrapJob[]

  @@unique([userId, slug])
}

model BootstrapJob {
  id          String   @id @default(cuid())
  projectId   String
  status      JobStatus @default(PENDING)
  error       String?
  commitSha   String?
  createdAt   DateTime @default(now())
  completedAt DateTime?

  project     Project @relation(fields: [projectId], references: [id])
}

enum BootstrapStatus {
  PENDING
  BOOTSTRAPPED
  FAILED
}

enum JobStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
}
Celeris API Endpoints
GET  /api/auth/github
GET  /api/auth/github/callback
POST /api/auth/logout
GET  /api/me

POST /api/projects
GET  /api/projects
GET  /api/projects/:projectId

POST /api/projects/:projectId/bootstrap
GET  /api/projects/:projectId/bootstrap/status

Create project request:

{
  "name": "My Game",
  "slug": "my-game",
  "githubRepoUrl": "https://github.com/user/my-game"
}

Bootstrap response:

{
  "status": "BOOTSTRAPPED",
  "commitSha": "abc123",
  "repoUrl": "https://github.com/user/my-game",
  "commands": [
    "git clone https://github.com/user/my-game.git",
    "cd my-game",
    "pnpm install",
    "pnpm celeris:local"
  ]
}
Bootstrap Generator
Input
type BootstrapInput = {
  projectId: string;
  projectName: string;
  projectSlug: string;
  githubOwner: string;
  githubRepo: string;
};
Output
type GeneratedRepo = {
  files: Array<{
    path: string;
    content: string;
  }>;
};
Required template variables
__CELERIS_PROJECT_ID__
__PROJECT_NAME__
__PROJECT_SLUG__
__GITHUB_OWNER__
__GITHUB_REPO__
__PROGRAM_ID__

The generator must fail if any generated file still contains an unreplaced __VARIABLE__.

Repo Safety Rules

Reject bootstrap if repo root contains:

package.json
pnpm-workspace.yaml
turbo.json
apps/
packages/
programs/
docker-compose.local.yml
celeris.config.ts

Allow:

README.md
.gitignore
LICENSE

Error message:

Repository is not empty enough for bootstrap. Create a fresh empty repository and try again.
Generated Backend
Required routes
GET /health
GET /actions
POST /actions/mint-item
GET /health
{
  "ok": true,
  "service": "game-server"
}
GET /actions
[
  {
    "id": "mint_item",
    "name": "Mint Item",
    "creditCost": 10
  }
]
POST /actions/mint-item

Request:

{
  "playerId": "demo-player",
  "itemId": "demo-sword"
}

Response:

{
  "ok": true,
  "action": "mint_item",
  "playerId": "demo-player",
  "itemId": "demo-sword"
}

Behavior:

Upsert Player
Create Item row
Return created action result
Generated Frontend

The frontend home page must display:

Game Bootstrap Running
Backend health status
Available actions
Mint Demo Item button
Result JSON panel
Solana RPC URL
Program ID

Button behavior:

Click Mint Demo Item
↓
POST /actions/mint-item
↓
Show returned JSON
Generated Database
model Player {
  id        String   @id
  createdAt DateTime @default(now())
  items     Item[]
}

model Item {
  id        String   @id @default(cuid())
  playerId  String
  itemId    String
  createdAt DateTime @default(now())

  player    Player @relation(fields: [playerId], references: [id])
}

Seed script creates:

Player ID: demo-player
Generated Solana Program

Anchor program:

programs/game

Instructions:

initialize_game
mint_item_record

For MVP, these instructions only prove:

Anchor builds
Program deploys to local validator
Program ID is known
Backend/frontend can reference the deployed program

No SPL token minting is required.

Program ID Handling

Generated repo includes a demo local program keypair:

programs/game/target/deploy/game-keypair.json

The public key must match:

declare_id!()
Anchor.toml
celeris.config.ts
.env.example
frontend display
backend config

Validation script:

pnpm tsx scripts/check-program-id.ts

The script fails if any ID mismatches.

Local Success Criteria

After cloning the generated repo, this must work:

pnpm install
pnpm celeris:local

Then these must pass:

curl http://localhost:4000/health

Expected:

{
  "ok": true,
  "service": "game-server"
}

Solana RPC health:

curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

Expected:

{
  "jsonrpc": "2.0",
  "result": "ok",
  "id": 1
}

Frontend:

http://localhost:3000

Must show:

Backend connected
Available action: Mint Item
Mint Demo Item button works