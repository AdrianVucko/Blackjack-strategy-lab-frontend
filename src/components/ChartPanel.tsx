import { FigurePlot } from "@/components/Plot";
import type { PlotlyFigure } from "@/types/api";

interface ChartPanelProps {
  title: string;
  description?: string;
  figure: PlotlyFigure;
  height?: number;
}

export function ChartPanel({
  title,
  description,
  figure,
  height = 320,
}: ChartPanelProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
      </div>
      <div
        className="overflow-hidden rounded-md bg-white"
        style={{ height }}
      >
        <FigurePlot figure={figure} />
      </div>
    </div>
  );
}
