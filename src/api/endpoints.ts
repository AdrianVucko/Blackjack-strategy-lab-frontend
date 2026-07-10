import { apiGet, apiPost } from "@/api/client";
import { rulesToQuery } from "@/lib/rules";
import type {
  CountingRequest,
  CountingResponse,
  PlotlyFigure,
  Rules,
  RunSummary,
  SimulationRequest,
  SimulationResponse,
  StrategyChartResponse,
} from "@/types/api";

export function getStrategyChart(
  rules: Rules,
  signal?: AbortSignal,
): Promise<StrategyChartResponse> {
  const query = rulesToQuery(rules);
  return apiGet<StrategyChartResponse>(`/strategy/chart?${query}`, { signal });
}

export function runSimulation(
  request: SimulationRequest,
  signal?: AbortSignal,
): Promise<SimulationResponse> {
  return apiPost<SimulationResponse>("/simulate", request, { signal });
}

export function runCounting(
  request: CountingRequest,
  signal?: AbortSignal,
): Promise<CountingResponse> {
  return apiPost<CountingResponse>("/simulate/counting", request, { signal });
}

export function listRuns(
  limit = 20,
  signal?: AbortSignal,
): Promise<RunSummary[]> {
  return apiGet<RunSummary[]>(`/simulate/runs?limit=${limit}`, { signal });
}

export function getRun(id: number, signal?: AbortSignal): Promise<RunSummary> {
  return apiGet<RunSummary>(`/simulate/runs/${id}`, { signal });
}

export const viz = {
  bankroll: (request: SimulationRequest, signal?: AbortSignal) =>
    apiPost<PlotlyFigure>("/viz/bankroll", request, { signal }),
  resultDistribution: (request: SimulationRequest, signal?: AbortSignal) =>
    apiPost<PlotlyFigure>("/viz/result-distribution", request, { signal }),
  edgeCurve: (request: CountingRequest, signal?: AbortSignal) =>
    apiPost<PlotlyFigure>("/viz/counting/edge-curve", request, { signal }),
  trueCountDistribution: (request: CountingRequest, signal?: AbortSignal) =>
    apiPost<PlotlyFigure>("/viz/counting/true-count-distribution", request, {
      signal,
    }),
};
