import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { PlotlyFigure } from "@/types/api";

// react-plotly.js pulls the full plotly.js by default; wiring the dist-min build
// through the factory keeps the bundle smaller.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Plot = createPlotlyComponent(Plotly as any);

interface FigurePlotProps {
  figure: PlotlyFigure;
  className?: string;
}

/** Renders a ready-made Plotly figure returned by the /viz/* endpoints. */
export function FigurePlot({ figure, className }: FigurePlotProps) {
  return (
    <Plot
      data={figure.data as Plotly.Data[]}
      layout={figure.layout as Partial<Plotly.Layout>}
      useResizeHandler
      className={className}
      style={{ width: "100%", height: "100%" }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}

export default Plot;
