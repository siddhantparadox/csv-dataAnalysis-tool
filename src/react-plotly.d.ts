declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import * as React from 'react';

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    frames?: Plotly.Frame[];
    config?: Partial<Plotly.Config>;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
    onClick?: (event: Plotly.PlotMouseEvent) => void;
    onClickAnnotation?: (event: Plotly.PlotMouseEvent) => void;
    onHover?: (event: Plotly.PlotMouseEvent) => void;
    onUnhover?: (event: Plotly.PlotMouseEvent) => void;
    onSelected?: (event: Plotly.PlotSelectionEvent) => void;
    onRelayout?: (event: Plotly.PlotRelayoutEvent) => void;
    onRestyle?: (event: Plotly.PlotRestyleEvent) => void;
    onRedraw?: () => void;
    onAnimated?: () => void;
    onAfterPlot?: () => void;
    onAutoSize?: () => void;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    debug?: boolean;
    divId?: string;
  }

  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
}