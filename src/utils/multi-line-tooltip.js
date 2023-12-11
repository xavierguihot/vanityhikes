
function drawMultiLineTooltip(lines, svg, event, plusX, plusY) {

  var x = d3.select(event.currentTarget).node().getBoundingClientRect().x + plusX;
  var y = d3.select(event.currentTarget).node().getBoundingClientRect().y + window.scrollY;

  var tooltip =
    svg
      .append("g")
      .attr("class", "tooltip")
      .attr("transform", `translate(${x}, ${y})`);

  var rect = tooltip.append("rect").style("fill", "white").style("stroke", "#008EFC");

  var text =
    tooltip
      .selectAll("text.tooltip-line")
      .data(lines)
      .enter()
      .append("text")
      .attr("class", "tooltip-line")
      .attr("x", 0)
      .attr("y", (_, i) => i * 20)
      .style("text-anchor", "start")
      .style("dy", ".35em")
      .style("font-family", "Roboto,Arial,sans-serif")
      .style("font-weight", 500)
      .style("font-size", ".875rem")
      .text(d => d);

  var textWidth = d3.max(text.nodes().map(d => d.getBoundingClientRect().width));
  var textHeight = lines.length * 20;
  var textMinY = d3.min(text.nodes().map(d => d.getBoundingClientRect().y));

  rect
    .attr("x", -2)
    .attr("y", (textMinY - y) - 2)
    .attr("width", textWidth + 4)
    .attr("height", textHeight + 2);
}
