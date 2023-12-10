
function updateMapTilesForZoom(tilesContainer, mapWidth, mapHeight, transform) {

  var tiles = d3.tile().size([mapWidth, mapHeight]).scale(transform.k).translate([transform.x, transform.y])();

  var image =
    tilesContainer
      .attr("transform", stringify(tiles.scale, tiles.translate))
      .selectAll("image")
      .data(tiles, d => d);

  image.exit().remove();

  image.enter().append("image")
    // Thunderforest:
    .attr("xlink:href", d => "https://tile.thunderforest.com/outdoors/" + d[2] + "/" + d[0] + "/" + d[1] + ".png?apikey=d21c3cd8bdf04051988c503abac1b038")
    // IGN:
    //.attr("xlink:href", d => "https://igngp.geoapi.fr/tile.php/plan-ignv2/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    //.attr("xlink:href", d => "https://igngp.geoapi.fr/tile.php/cartes/qh80mpsn21g85yxnd8pv2t4s/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    // Others:
    //.attr("xlink:href", d => "https://" + "abc"[d[1] % 3] + ".tile.opentopomap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    //.attr("xlink:href", d => "https://" + "tile.opentopomap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    //.attr("xlink:href", d => "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
    .attr("x", d => d[0] * 256)
    .attr("y", d => d[1] * 256)
    .attr("width", 256)
    .attr("height", 256);
}

function stringify(scale, translate) {
  var k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}
