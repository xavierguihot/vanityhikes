
function drawGraphs(svg, width, height) {
  loadHikeTraces().then(_ => {
    loadTimeline().then(_ => {
      displayGraphs(svg, width, height);
    });
  });
}

function displayGraphs(svg, width, height) {

  var margin = { top: 50, right: 70, bottom: 50, left: 60 };
  var graphWidth = width - margin.left - margin.right;
  var graphHeight = height - margin.top - margin.bottom;

  var selectedGraph = selectableGraphs[0];

  var graphContainer =
    svg
      .append("g")
      .attr("class", "graphs-container")
      .attr("width", graphWidth + margin.left + margin.right)
      .attr("height", graphHeight + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  drawGraphTitle(selectedGraph, graphContainer, graphWidth, graphHeight, margin);
  drawGraph(selectedGraph, graphContainer, graphWidth, graphHeight, margin);
}

function drawGraph(selectedGraph, graphContainer, graphWidth, graphHeight, margin) {

  d3.select("svg").attr("height", window.innerHeight);

  graphContainer.select("g.graph-holder").remove();
  var graphHolder = graphContainer.append("g").attr("class", "graph-holder");

  if (selectedGraph.type == "calendar") {
    drawCalendarGraph(graphContainer, graphHolder, selectedGraph, graphWidth);
  } else if (selectedGraph.type == "bubble chart") {
    drawBubbleChart(graphHolder, selectedGraph, graphWidth, graphHeight);
  } else {
    drawTimeseriesGraph(selectedGraph, graphContainer, graphHolder, graphWidth, graphHeight, margin);
  }
}

function cleanGraphPage() {
  d3.select("svg").select("g.graph-selector-container").remove();
  d3.select("svg").select(".graphs-container").remove();
}
