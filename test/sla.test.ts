import { describe, it, expect } from "vitest";
import { SLAScorer } from "../src/scorer.js";

describe("SLAScorer", () => {
  it("scores 100% success", () => {
    const sc = new SLAScorer();
    for (let i=0;i<100;i++) sc.recordRequest("a", true);
    const s = sc.score({ name: "uptime", targetPercent: 99, windowDays: 30 });
    expect(s.actualPercent).toBe(100);
    expect(s.passed).toBe(true);
  });

  it("fails below target", () => {
    const sc = new SLAScorer();
    for (let i=0;i<90;i++) sc.recordRequest("a", true);
    for (let i=0;i<10;i++) sc.recordRequest("a", false);
    const s = sc.score({ name: "uptime", targetPercent: 99, windowDays: 30 });
    expect(s.actualPercent).toBe(90);
    expect(s.passed).toBe(false);
  });

  it("calculates error budget", () => {
    const sc = new SLAScorer();
    for (let i=0;i<100;i++) sc.recordRequest("a", i<99); // 1 error
    const s = sc.score({ name: "uptime", targetPercent: 99, windowDays: 30 });
    expect(s.errorBudgetRemaining).toBe(0); // 99% of 100 = 1 allowed error, used 1
  });

  it("burn rate zero with no errors", () => {
    const sc = new SLAScorer();
    sc.recordRequest("a", true);
    expect(sc.burnRate({ name: "x", targetPercent: 99, windowDays: 30 })).toBe(0);
  });

  it("scores multiple targets", () => {
    const sc = new SLAScorer();
    sc.recordRequest("a", true); sc.recordRequest("a", false);
    const scores = sc.scores([
      { name: "high", targetPercent: 99.9, windowDays: 30 },
      { name: "low", targetPercent: 50, windowDays: 30 },
    ]);
    expect(scores).toHaveLength(2);
    expect(scores[1].passed).toBe(true);
  });

  it("clear resets", () => {
    const sc = new SLAScorer();
    sc.recordRequest("a", false);
    sc.clear();
    expect(sc.score({ name: "x", targetPercent: 99, windowDays: 30 }).errors).toBe(0);
  });

  it("worstAgent identifies highest-error agent", () => {
    const sc = new SLAScorer();
    sc.recordRequest("a", false);
    sc.recordRequest("a", false);
    sc.recordRequest("b", true);
    expect(sc.worstAgent()).toBe("a");
  });

  it("worstAgent null when no errors", () => {
    const sc = new SLAScorer();
    sc.recordRequest("a", true);
    expect(sc.worstAgent()).toBeNull();
  });

  it("byAgent breakdown", () => {
    const sc = new SLAScorer();
    sc.recordRequest("a", true); sc.recordRequest("a", false);
    sc.recordRequest("b", true);
    const r = sc.byAgent();
    expect(r["a"].requests).toBe(2);
    expect(r["a"].errors).toBe(1);
    expect(r["a"].errorRate).toBe(50);
    expect(r["b"].errors).toBe(0);
    expect(r["b"].errorRate).toBe(0);
  });
});
