// plotly.js-dist-min ships no bundled types; reuse the plotly.js typings that
// @types/react-plotly.js already depends on.
declare module "plotly.js-dist-min" {
  import Plotly from "plotly.js";
  export = Plotly;
}
