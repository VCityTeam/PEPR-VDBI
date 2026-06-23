// adapted from https://gist.github.com/mbostock/01ab2e85e8727d6529d20391c0fd9a16
importScripts("https://d3js.org/d3-collection.v1.min.js")
importScripts("https://d3js.org/d3-dispatch.v1.min.js")
importScripts("https://d3js.org/d3-quadtree.v1.min.js")
importScripts("https://d3js.org/d3-timer.v1.min.js")
importScripts("https://d3js.org/d3-force.v1.min.js")

/**
 * Run a d3-force simulation synchronously to completion off the main
 * thread, posting `tick` progress messages and a final `end` message with
 * the resolved node/link positions back to the caller.
 *
 * @param {MessageEvent} event - message event with `data.nodes`, `data.links`,
 *    `data.keyMap`, `data.chargeStrength`, and `data.r`
 * @returns {void}
 */
onmessage = function (event) {
  const nodes = event.data.nodes,
    links = event.data.links,
    keyMap = event.data.keyMap,
    chargeStrength = event.data.chargeStrength,
    r = event.data.r

  const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(links).id(keyMap).strength(chargeStrength))
    .force("collide", d3.forceCollide().radius(r).iterations(3))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .stop()
  // .forceSimulation(this.nodes)
  // .alphaDecay(performanceMode ? 0.1 : undefined)
  // .force("link", d3.forceLink(this.links).id(this.keyMap))
  // .force("charge", d3.forceManyBody().strength(this.chargeStrength))
  // .force("x", d3.forceX())
  // .force("y", d3.forceY())
  // .force("fx", this.xMap)
  // .force("fy", this.yMap)
  // .on("tick", this.handleTick())

  for (
    var i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
      );
    i < n;
    ++i
  ) {
    postMessage({ type: "tick", progress: i / n })
    simulation.tick()
  }

  postMessage({ type: "end", nodes: nodes, links: links })
}
