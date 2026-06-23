import * as Plot from '@observablehq/plot';

/**
 * Build an Observable Plot timeline (rule marks with dot markers and
 * labels) from an array of dated events
 *
 * @param {Object[]} events - events to plot, each with `year`, `y`, and `name` fields
 * @param {Object} [options]
 * @param {number} [options.width] - chart width
 * @param {number} [options.height] - chart height
 * @returns {SVGElement} the rendered timeline
 */
export function timeline(events, { width, height } = {}) {
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    x: { nice: true, label: null, tickFormat: '' },
    y: { axis: null },
    marks: [
      Plot.ruleX(events, {
        x: 'year',
        y: 'y',
        markerEnd: 'dot',
        strokeWidth: 2.5,
      }),
      Plot.ruleY([0]),
      Plot.text(events, {
        x: 'year',
        y: 'y',
        text: 'name',
        lineAnchor: 'bottom',
        dy: -10,
        lineWidth: 10,
        fontSize: 12,
      }),
    ],
  });
}
