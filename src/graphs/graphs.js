
function drawGraphs(svg, width, height) {
  drawLoader();
  setPageDescription("Vanity Hikes: Some graphs based on my hikes - Xavier Guihot");
  loadHikeTraces().then(_ => {
    loadTimeline().then(_ => {
      displayGraphs(svg, width, height, "Rolling cumulated distance over previous 365 days");
      removeLoader();
    });
  });
}

function displayGraphs(svg, width, height, selectedGraphName) {

  var margin = { top: 50, right: 70, bottom: 50, left: 60 };
  var graphWidth = width - margin.left - margin.right;
  var graphHeight = height - margin.top - margin.bottom;

  var selectedGraph = selectableGraphs.find(graph => graph.name == selectedGraphName);

  svg.selectAll("g.graphs-container").remove();
  var graphPageContainer = svg.append("g").attr("class", "graphs-container");

  var graphContainer =
    graphPageContainer
      .append("g")
      .attr("width", graphWidth + margin.left + margin.right)
      .attr("height", graphHeight + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  drawGraph(selectedGraph, graphContainer, graphWidth, graphHeight, margin);

  // The title (also a selector of graphs):
  drawSelector(
    graphPageContainer,
    "available-graphs",
    selectableGraphs.map(d => d.name),
    selectedGraph["name"],
    selectedGraphName => displayGraphs(svg, width, height, selectedGraphName),
    width / 2,
    30,
    true
  );
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
