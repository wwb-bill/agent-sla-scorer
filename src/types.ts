export interface SLATarget{name:string;targetPercent:number;windowDays:number;}
export interface ErrorEvent{agentId:string;timestamp:number;errorType:string;}
export interface SLAScore{name:string;targetPercent:number;actualPercent:number;totalRequests:number;errors:number;errorBudgetRemaining:number;passed:boolean;}