
function drawUserStats(svg, width, height) {
  drawLoader();
  loadUserStats().then(_ => {
    displayUserStats(svg, width, height);
    removeLoader();
  });
}

function displayUserStats(svg, width, height) {

  var userStatsContainer = svg.append("g").attr("class", "user-stats-container");

  var fontSize = width * 13 / 1400;
  if (width > 1000) fontSize = 13;

  userStatsContainer
    .selectAll("g")
    .data(data.userStats.split("\n"))
    .enter()
    .append("text")
    .attr("class", "user-stats-text")
    .attr("x", 50)
    .attr("y", (_, i) => 30 + i * 15)
    .style("dy", ".35em")
    .style("font-size", `${fontSize}`)
    .style("font-family", "monospace")
    .style("white-space", "pre-wrap")
    .text(d => d)

  d3.select("svg").attr("height", userStatsContainer.node().getBoundingClientRect().height + 50);
}

function cleanUserStatsPage(svg) {
  svg.select(".user-stats-container").remove();
  d3.select("svg").attr("height", window.innerHeight);
}
