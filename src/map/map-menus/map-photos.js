
var photoIconsData = [];

function drawPhotoIconsDisplayButton(mapContainer, buttonsContainer, mapPageState, constants, projection, width, height) {

  drawButton(
    buttonsContainer,
    "photo-icons-switch",
    _ => {
      if (mapPageState.displayPhotoIcons) {
        mapPageState.displayPhotoIcons = false;
        drawPhotoIcons(mapContainer, mapPageState.displayPhotoIcons, mapPageState.previousZoom >= constants.photoIconsMinZoom, projection, width, height);
        transformPhotoIconsForZoomAndPosition(mapContainer, mapPageState.previousTransform, projection);
        attachTooltipToButton("photo-icons-switch", "Show photos", -47, 38);
        clearTooltip();
      } else {
        mapPageState.displayPhotoIcons = true;
        drawPhotoIcons(mapContainer, mapPageState.displayPhotoIcons, mapPageState.previousZoom >= constants.photoIconsMinZoom, projection, width, height);
        transformPhotoIconsForZoomAndPosition(mapContainer, mapPageState.previousTransform, projection);
        attachTooltipToButton("photo-icons-switch", "Hide photos", -47, 38);
        clearTooltip();
      }
    },
    "photo.png",
    width - 27,
    height / 2 + 2,
    true
  );

  attachTooltipToButton("photo-icons-switch", "Hide photos", -47, 38);
}

function transformPhotoIconsForZoomAndPosition(mapContainer, transform, projection) {
  transformMapIconsForZoom(mapContainer, projection, "picture", transform, 16, 16);
}

function drawPhotoIcons(mapContainer, displayPhotos, isMapZoomedEnough, projection, width, height) {

  drawIconsOnMap(
    mapContainer,
    projection,
    displayPhotos && isMapZoomedEnough ? getPhotoIconsData() : [],
    "picture",
    d => {
      if (d3.selectAll(".photo-on-map-holder").empty()) {
        displayPhoto(d.photo, mapContainer, width, height);
      } else {
        d3.selectAll(".photo-on-map-holder").remove();
      }
    }
  );
}

function getPhotoIconsData() {

  if (photoIconsData.length == 0) {
    photoIconsData =
      data
        .photos
        .filter(photo => photo.longitude && photo.latitude)
        .map(photo => { return {
          "name": photo.name,
          "latitude": photo.latitude,
          "longitude": photo.longitude,
          "image": "picture.png",
          "width": 16,
          "height": 16,
          "xOffset": -8,
          "yOffset": -8,
          "photo": photo
        }});
  }

  return photoIconsData;
}

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
