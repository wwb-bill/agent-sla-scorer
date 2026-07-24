import type{SLATarget,SLAScore}from"./types.js";
export class SLAScorer{private events:{agentId:string;timestamp:number;errorType:string}[]=[];private totalRequests=0;
 recordRequest(agentId:string,success:boolean,errorType="unknown"){this.totalRequests++;if(!success)this.events.push({agentId,timestamp:Date.now(),errorType});}
 score(target:SLATarget):SLAScore{const ws=Date.now()-target.windowDays*86400000;const we=this.events.filter(e=>e.timestamp>=ws).length;const wt=this.totalRequests||1;const er=we/wt;const ap=(1-er)*100;const ae=wt*(1-target.targetPercent/100);return{name:target.name,targetPercent:target.targetPercent,actualPercent:Math.round(ap*100)/100,totalRequests:wt,errors:we,errorBudgetRemaining:Math.round(Math.max(0,ae-we)),passed:er<=(1-target.targetPercent/100)};}
 burnRate(target:SLATarget):number{const s=this.score(target);const a=s.totalRequests*(1-s.targetPercent/100);return a===0?s.errors>0?Infinity:0:Math.round(s.errors/a*100)/100;}
 scores(targets:SLATarget[]):SLAScore[]{return targets.map(t=>this.score(t));}
 clear(){this.events=[];this.totalRequests=0;}}