import type { SLATarget, ErrorEvent, SLAScore } from "./types.js";

export class SLAScorer {
  private events: ErrorEvent[] = [];
  private totalRequests = 0;
  private agentTotals = new Map<string, number>();

  recordRequest(agentId: string, success: boolean, errorType = "unknown"): void {
    this.totalRequests++;
    this.agentTotals.set(agentId, (this.agentTotals.get(agentId) ?? 0) + 1);
    if (!success) this.events.push({ agentId, timestamp: Date.now(), errorType });
  }

  score(target: SLATarget): SLAScore {
    const windowStart = Date.now() - target.windowDays * 86400_000;
    const windowErrors = this.events.filter(e => e.timestamp >= windowStart).length;
    const windowTotal = this.totalRequests || 1;
    const errorRate = windowErrors / windowTotal;
    const actualPercent = (1 - errorRate) * 100;
    const allowedErrors = windowTotal * (1 - target.targetPercent / 100);
    const errorBudgetRemaining = Math.max(0, allowedErrors - windowErrors);
    return {
      name: target.name, targetPercent: target.targetPercent,
      actualPercent: Math.round(actualPercent * 100) / 100,
      totalRequests: windowTotal, errors: windowErrors,
      errorBudgetRemaining: Math.round(errorBudgetRemaining),
      passed: errorRate <= (1 - target.targetPercent / 100),
    };
  }

  burnRate(target: SLATarget): number {
    const s = this.score(target);
    const allowed = s.totalRequests * (1 - s.targetPercent / 100);
    if (allowed === 0) return s.errors > 0 ? Infinity : 0;
    return Math.round(s.errors / allowed * 100) / 100;
  }

  scores(targets: SLATarget[]): SLAScore[] {
    return targets.map(t => this.score(t));
  }

  worstAgent(): string | null {
    const counts = new Map<string, number>();
    for (const e of this.events) counts.set(e.agentId, (counts.get(e.agentId) ?? 0) + 1);
    let worst: string | null = null;
    let max = 0;
    for (const [id, n] of counts) {
      if (n > max) { max = n; worst = id; }
    }
    return worst;
  }

  byAgent(): Record<string, { requests: number; errors: number; errorRate: number }> {
    const err = new Map<string, number>();
    for (const e of this.events) err.set(e.agentId, (err.get(e.agentId) ?? 0) + 1);
    const out: Record<string, { requests: number; errors: number; errorRate: number }> = {};
    for (const [agent, requests] of this.agentTotals) {
      const errors = err.get(agent) ?? 0;
      out[agent] = { requests, errors, errorRate: requests ? Math.round((errors / requests) * 10000) / 100 : 0 };
    }
    return out;
  }

  clear(): void { this.events = []; this.totalRequests = 0; this.agentTotals.clear(); }
}
