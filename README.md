# agent-sla-scorer

SLA scoring with error-budget accounting for AI agent fleets. Zero-dependency TypeScript.

## Features

- **`recordRequest(agentId, success, errorType?)`** — log one request
- **`score(target)`** — actual uptime % vs target, error budget remaining, pass/fail
- **`burnRate(target)`** — error-budget burn rate (0 = healthy, >1 = overspent)
- **`scores(targets)`** — evaluate multiple SLAs at once
- **`worstAgent()`** — the agent with the most errors
- **`byAgent()`** — per-agent requests / errors / error rate

## Install

```bash
npm install agent-sla-scorer
```

## Usage

```typescript
import { SLAScorer } from "agent-sla-scorer";

const sc = new SLAScorer();
sc.recordRequest("agent-a", true);
sc.recordRequest("agent-a", false);

const s = sc.score({ name: "uptime", targetPercent: 99, windowDays: 30 });
sc.worstAgent(); // "agent-a"
sc.byAgent();    // { "agent-a": { requests: 2, errors: 1, errorRate: 50 } }
```

## API

| Method | Description |
|--------|-------------|
| `recordRequest(agentId, success, errorType?)` | Log one request |
| `score(target)` | Uptime %, error budget, passed |
| `burnRate(target)` | Budget burn rate |
| `scores(targets)` | Score multiple targets |
| `worstAgent()` | Most-error agent id or null |
| `byAgent()` | Per-agent request/error stats |
| `clear()` | Reset all state |

## Test

```bash
npm install
npm test
```

MIT
