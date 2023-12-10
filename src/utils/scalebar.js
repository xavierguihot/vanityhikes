
function drawScaleBar(mapContainer, zoomLevel, x, y, mapContainerWidth, mapContainerHeight) {

  mapContainer.selectAll("g.scale-bar").remove();

  mapContainer
    .append("g")
    .attr("class", "scale-bar")
    .call(
      d3.geoScaleBar()
        .zoomClamp(false)
        .projection(d3.geoMercator().translate([x, y]).scale(constants.initialScale * zoomLevel))
        .size([mapContainerWidth, mapContainerHeight])
        .left(.02)
        .top(.96)
        .orient(d3.geoScaleTop)
        .label(null)
        .tickPadding(3)
        .tickSize(0)
        .tickFormat((d, i, e) => i === e.length - 1 ? `${d} km` : "")
    )
    .call(g =>
      // Put the "xxx km" text in the middle:
      g.selectAll("text")
        .attr("transform", `translate(-${g.select("path.domain").node().getBoundingClientRect().width / 2})`)
        .style("font-size", 12)
    )
    .call(g => g.selectAll("path").style("stroke-width", 2));
}
