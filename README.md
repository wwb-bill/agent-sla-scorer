# agent-sla-scorer

SLA scoring with error-budget accounting for AI agent fleets.

```typescript
import { SLAScorer } from "agent-sla-scorer";
const sc = new SLAScorer();
sc.recordRequest("agent-a", true);
sc.score({ name: "uptime", targetPercent: 99, windowDays: 30 });
```

MIT
