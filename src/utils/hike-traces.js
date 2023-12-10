
function drawHikeGpxTraces(mapContainer, hikes, projection, hikeToSlices) {

  var traceLine =
    d3.line()
      .x(d => projection([d.fromLongitude, d.fromLatitude])[0])
      .y(d => projection([d.fromLongitude, d.fromLatitude])[1]);

  mapContainer
    .selectAll("path.hike-line")
    .data(hikes)
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "hike-line")
          .attr("id", hike => `hike-trace-${hike.name}`)
          .attr("d", hike => traceLine(hikeToSlices(hike)))
          .style("stroke", hike => hike.isWish ? "#f50ce5" : "black")
          .style("fill", "transparent")
          .attr("is-wish", hike => hike.isWish ? "true" : "false"),
      update =>
        update.attr("d", hike => traceLine(hikeToSlices(hike))),
      exit =>
        exit.remove()
    );
}

// Adapt the position and the size of hikes (gpx traces) to the new zoom/position:
function resizeHikeGpxTracesForZoom(mapContainer, transform) {
  mapContainer
    .selectAll("path.hike-line")
    .attr("transform", transform)
    .style("stroke-width", 2 / transform.k);
}
