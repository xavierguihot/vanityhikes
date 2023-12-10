
// Draw icons.
// Expected object format in data:
// { name: ???, latitude: ???, longitude: ???, image: ???, width: ???, height: ???, xOffset: ???, yOffset: ??? }
// Format to which you can also add other fields in order to access them in the `actionOnClick`
function drawIconsOnMap(mapContainer, projection, data, iconType, actionOnClick, onMouseover) {

  mapContainer
    .selectAll(`image.${iconType}-icon`)
    .data(data)
    .join(
      enter => {

        var icon =
          enter
            .append("svg:image")
            .attr("class", `${iconType}-icon`)
            .attr("id", icon => icon.name)
            .attr("x", icon => projection([icon.longitude, icon.latitude])[0] + icon.xOffset)
            .attr("y", icon => projection([icon.longitude, icon.latitude])[1] + icon.yOffset)
            .attr("width", icon => icon.width)
            .attr("height", icon => icon.height)
            .style("cursor", actionOnClick ? "pointer" : "default")
            .attr("xlink:href", icon => `img/${icon.image}`)
            .on("mouseout", _ => clearTooltip());

        if (actionOnClick) {
          icon.on("click", (_, icon) => actionOnClick(icon));
        }

        if (onMouseover) {
          icon.on("mouseover", (event, icon) => onMouseover(event, icon));
        }

      },
      update =>
        update,
      exit =>
        exit.remove()
    );
}

function transformMapIconsForZoom(mapContainer, projection, iconType, transform, width, height) {
  mapContainer
    .selectAll(`image.${iconType}-icon`)
    .attr("transform", transform)
    .attr("width", width / transform.k)
    .attr("height", height / transform.k)
    .attr("x", icon => projection([icon.longitude, icon.latitude])[0] - (width / 2) / transform.k)
    .attr("y", icon => projection([icon.longitude, icon.latitude])[1] - (height / 2) / transform.k);
}
