
function drawGraphTitle(selectedGraph, graphContainer, graphWidth, graphHeight, margin) {

  svg.select("g.graph-selector-container").remove();
  var graphTitleContainer = svg.append("g").attr("class", "graph-selector-container");

  var text =
    graphTitleContainer
      .append("text")
      .attr("class", "selected-graph-title-text")
      .attr("x", 10)
      .attr("y", 15)
      .style("dy", ".35em")
      .style("font-size", "15")
      .style("font-family", "sans-serif")
      .text(selectedGraph["name"]);

  var cog =
    graphTitleContainer
      .append("svg:image")
      .attr("id", "graphs-button")
      .attr("xlink:href", "img/cog.jpeg")
      .attr("width", 16)
      .attr("height", 16)
      .attr("x", 2)
      .attr("y", 2);

  var clickArea =
    graphTitleContainer
      .append("rect")
      .attr("class", "select-graph-title-rect")
      .attr("height", 20)
      .style("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", _ => drawGraphTitleSelector(graphContainer, graphWidth, graphHeight, margin));

  var titleTextWidth = text.node().getBoundingClientRect().width;
  graphTitleContainer.attr("transform", `translate(${width / 2 - titleTextWidth / 2 - 10}, 30)`);
  clickArea.attr("width", titleTextWidth + 20 /* margins */ + 22 /* cog img */);
  cog.attr("x", titleTextWidth + 17);
}

function drawGraphTitleSelector(graphContainer, graphWidth, graphHeight, margin) {

  function removeSelector() {
    d3.select("g.selector-click-exit-background").remove();
    d3.select("g.graph-title-selector-choices-container").remove();
  }

  // A transparent area covering the whole page such that clicking on it removes the selection menu:
  svg
    .append("g")
    .attr("class", "selector-click-exit-background")
    .append("rect")
    .style("fill", "grey")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0.1)
    .on("click", _ => removeSelector());

  var graphTitleSelectorContainer =
    svg.append("g").attr("class", "graph-title-selector-choices-container");

  var selectorWhiteBackground =
    graphTitleSelectorContainer
      .append("rect")
      .style("fill", "white")
      .attr("x", -10)
      .attr("y", 35);

  var textChoices =
    graphTitleSelectorContainer
      .selectAll("g")
      .data(selectableGraphs)
      .enter()
      .append("text")
      .attr("class", "graph-title-choice-text")
      .text(graphChoice => graphChoice.name)
      .attr("y", (d, i) => 50 + i * 20)
      .style("dy", ".35em")
      .style("font-size", "15")
      .style("font-family", "sans-serif");

  var textChoicesClickAreas =
    graphTitleSelectorContainer
      .selectAll("g")
      .data(selectableGraphs)
      .enter()
      .append("rect")
      .attr("class", "graph-title-choice-click-area")
      .attr("height", 20)
      .attr("x", -10)
      .attr("y", (d, i) => 35 + i * 20)
      .style("fill", "transparent")
      .style("stroke", "black") // remove me
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        removeSelector();
        selectedGraph = d;
        drawGraph(selectedGraph, graphContainer, graphWidth, graphHeight, margin);
        drawGraphTitle(selectedGraph, graphContainer, graphWidth, graphHeight, margin);
      });

  var selectedTitleWidth = d3.select(".selected-graph-title-text").node().getBoundingClientRect().width;
  graphTitleSelectorContainer.attr("transform", `translate(${width / 2 - selectedTitleWidth / 2}, 15)`)
  var textChoicesSize = d3.select(".graph-title-selector-choices-container").node().getBoundingClientRect();
  textChoicesClickAreas.attr("width", textChoicesSize.width + 20);
  selectorWhiteBackground.attr("width", textChoicesSize.width + 20).attr("height", textChoicesSize.height);
}
