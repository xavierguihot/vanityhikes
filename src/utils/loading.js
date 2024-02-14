
function drawLoader() {
  svg
    .append("svg:image")
    .attr("class", "loading-gif")
    .attr("xlink:href", "img/loading.gif")
    .attr("width", 100)
    .attr("height", 100)
    .attr("x", width / 2 - 50)
    .attr("y", height / 2 - 50);
}

function removeLoader() {
  svg.selectAll(".loading-gif").remove();
}
