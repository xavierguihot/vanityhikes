
function drawTooltip(text, svg, event, plusX, plusY) {
  var x = d3.select(event.currentTarget).node().getBoundingClientRect().x;
  var y = d3.select(event.currentTarget).node().getBoundingClientRect().y + window.scrollY - 20;
  var plusX = plusX ? plusX : 0;
  var plusY = plusY ? plusY : 0;
  return drawTooltipAtPosition(text, svg, x + plusX, y + plusY);
}

function drawTooltipAtPosition(text, svg, x, y) {

  var tooltip =
    svg
      .append("g")
      .attr("class", "tooltip")
      .attr("transform", `translate(${x}, ${y})`);

  var rect =
    tooltip.append("rect").style("fill", "white").style("stroke", "grey").style("stroke", "#008EFC");

  var text =
    tooltip
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .style("dy", ".35em")
      .style("font-family", "Roboto,Arial,sans-serif")
      .style("font-weight", 500)
      .style("font-size", ".875rem")
      .text(text);

  var textSize = text.node().getBoundingClientRect();
  var textWidth = textSize.width;
  var textHeight = textSize.height;

  rect
    .attr("x", -textWidth / 2 - 2)
    .attr("y", -textHeight / 2 - 5)
    .attr("width", textWidth + 4)
    .attr("height", textHeight);
}

function clearTooltip() {
  d3.selectAll(".tooltip").remove();
}
