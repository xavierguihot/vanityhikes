
function displayPhoto(photo, mapContainer, width, height) {

  var photoContainer = mapContainer.append("g").attr("class", "photo-on-map-holder");

  photoContainer
    .append("g")
    .attr("class", "photo-click-exit-background")
    .append("rect")
    .style("fill", "grey")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0.6)
    .on("click", _ => mapContainer.select(".photo-on-map-holder").remove());

  var photoDimensions = photoViewingDimensions(photo, width, height);

  photoContainer
    .append("svg:image")
    .attr("class", "photo-view-thumbnail")
    .attr("x", (width - photoDimensions.width) / 2)
    .attr("y", (height - photoDimensions.height) / 2)
    .attr("width", photoDimensions.width)
    .attr("height", photoDimensions.height)
    .style("cursor", "pointer")
    .attr("xlink:href", _ => {
      if (photo.cameraMaker == "Panasonic") {
        return thumbnailForWidth(photo.googleDriveId, photoDimensions.width);
      } else {
        return thumbnailForHeight(photo.googleDriveId, photoDimensions.height);
      }
    })
    .on("click", _ => mapContainer.select(".photo-on-map-holder").remove());

  photoContainer
    .append("svg:image")
    .attr("class", "photo-view-high-res")
    .attr("x", (width - photoDimensions.width) / 2)
    .attr("y", (height - photoDimensions.height) / 2)
    .attr("width", photoDimensions.width)
    .attr("height", photoDimensions.height)
    .style("cursor", "pointer")
    .attr("xlink:href", fullPhoto(photo.googleDriveId))
    .on("click", _ => mapContainer.select(".photo-on-map-holder").remove());
}

function photoViewingDimensions(photo, width, height) {
  var photoDisplayHeight = height;
  var photoDisplayWidth = photo.width * height / photo.height;
  if (photoDisplayWidth > width) {
    photoDisplayWidth = width;
    photoDisplayHeight = photo.height * width / photo.width;
  }
  return { width: photoDisplayWidth, height: photoDisplayHeight };
}
