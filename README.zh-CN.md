# agent-sla-scorer

面向 AI 代理集群的 SLA 评分与错误预算核算。零依赖 TypeScript。

## 特性

- **`recordRequest(agentId, success, errorType?)`** — 记录一次请求
- **`score(target)`** — 实际可用率 vs 目标、剩余错误预算、通过/未通过
- **`burnRate(target)`** — 错误预算消耗速率（0 = 健康，>1 = 超支）
- **`scores(targets)`** — 一次性评估多个 SLA
- **`worstAgent()`** — 出错最多的代理
- **`byAgent()`** — 每代理的请求/错误/错误率

## 安装

```bash
npm install agent-sla-scorer
```

## 使用

```typescript
import { SLAScorer } from "agent-sla-scorer";

const sc = new SLAScorer();
sc.recordRequest("agent-a", true);
sc.recordRequest("agent-a", false);

const s = sc.score({ name: "uptime", targetPercent: 99, windowDays: 30 });
sc.worstAgent(); // "agent-a"
sc.byAgent();    // { "agent-a": { requests: 2, errors: 1, errorRate: 50 } }
```

## 测试

```bash
npm install
npm test
```

MIT
