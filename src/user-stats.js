
function drawUserStats(svg, width, height) {

  var userStatsContainer = svg.append("g").attr("class", "user-stats-container");

  userStatsContainer
    .selectAll("g")
    .data(data.userStats.split("\n"))
    .enter()
    .append("text")
    .attr("class", "user-stats-text")
    .attr("x", 50)
    .attr("y", (_, i) => 30 + i * 15)
    .style("dy", ".35em")
    .style("font-size", "13")
    .style("font-family", "monospace")
    .style("white-space", "pre-wrap")
    .text(d => d)

  d3.select("svg").attr("height", userStatsContainer.node().getBoundingClientRect().height + 50);
}

function cleanUserStatsPage(svg) {
  svg.select(".user-stats-container").remove();
  d3.select("svg").attr("height", window.innerHeight);
}
