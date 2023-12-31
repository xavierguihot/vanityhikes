
function drawPhoto(photo, orderedPhotos, width, height) {

  // Set the height to the window viewing size:
  d3.select("svg").attr("height", height);

  var photoViewContainer = d3.select("svg").append("g").attr("class", "photo-viewing-page-container");

  // A black area covering the whole page as a background to the photo:
  photoViewContainer
    .append("g")
    .append("rect")
    .style("fill", "black")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

  var photoContainer = photoViewContainer.append("g").attr("class", "photo-holder");

  function photoViewingDimensions(photoToDisplay) {
    var photoDisplayHeight = height;
    var photoDisplayWidth = photoToDisplay.width * height / photoToDisplay.height;
    if (photoDisplayWidth > width) {
      photoDisplayWidth = width;
      photoDisplayHeight = photoToDisplay.height * width / photoToDisplay.width;
    }
    return { width: photoDisplayWidth, height: photoDisplayHeight };
  }

  function attachHighResPhoto(photoToDisplay, opacity) {

    if (photoContainer.selectAll(`#photo-${photoToDisplay.googleDriveId}`).empty()) {

      var photoDimensions = photoViewingDimensions(photoToDisplay);

      photoContainer
        .append("svg:image")
        .attr("class", "photo-view-high-res")
        .attr("id", `photo-${photoToDisplay.googleDriveId}`)
        .attr("x", (width - photoDimensions.width) / 2)
        .attr("y", (height - photoDimensions.height) / 2)
        .attr("width", photoDimensions.width)
        .attr("height", photoDimensions.height)
        .attr("opacity", opacity)
        .attr("scrollPosition", photoToDisplay.pageY)
        .attr("xlink:href", fullPhoto(photoToDisplay.googleDriveId));
    }
  }

  function displayPhoto(photoToDisplay) {
    photo = photoToDisplay;

    photoContainer.selectAll(".photo-view-thumbnail").remove();
    photoContainer.selectAll(".photo-view-high-res").attr("opacity", 0);

    var photoDimensions = photoViewingDimensions(photo);

    // Display the miniature in big (for the user to wait until the full quality image is downloaded):
    photoContainer
      .append("svg:image")
      .attr("class", "photo-view-thumbnail")
      .attr("x", (width - photoDimensions.width) / 2)
      .attr("y", (height - photoDimensions.height) / 2)
      .attr("width", photoDimensions.width)
      .attr("height", photoDimensions.height)
      .attr("xlink:href", thumbnailForWidth(photo.googleDriveId, photo.miniatureWidth));

    // If we've never seen this photo in high res before, we download it:
    if (photoContainer.selectAll(`#photo-${photo.googleDriveId}`).empty()) {
      attachHighResPhoto(photoToDisplay, opacity = 1);
    }
    // Otherwise we make it visible again (this way we don't have to wait for it to download again):
    else {
      photoContainer.selectAll(`#photo-${photo.googleDriveId}`).attr("opacity", 1).raise();
    }

    // And prepare displaying (downloading high resolution photos takes time):
    var photoOnTheLeft = leftPhoto(photo.googleDriveId, orderedPhotos);
    if (photoOnTheLeft) {
      attachHighResPhoto(photoOnTheLeft, opacity = 0);
    }
    var photoOnTheRight = rightPhoto(photo.googleDriveId, orderedPhotos);
    if (photoOnTheRight) {
      attachHighResPhoto(photoOnTheRight, opacity = 0);
    }

    photoViewContainer
      .select(".download-button")
      .on("click", _ => downloadPhoto(fullPhotoForDownload(photo.googleDriveId), photo.name));
  }

  displayPhoto(photo);

  var chevronsContainer = photoViewContainer.append("g");

  // The areas allowing to switch to the previous/next photo:
  photoViewContainer
    .append("g")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width / 4)
    .attr("height", height)
    .style("opacity", 0)
    .style("cursor", "pointer")
    .on("mouseover", event => showChevron("left", width / 16))
    .on("mouseout", event => removeChevron())
    .on("click", _ => switchToLeftPhoto(photo.googleDriveId, orderedPhotos));
  photoViewContainer
    .append("g")
    .append("rect")
    .attr("x", width - width / 4)
    .attr("y", 0)
    .attr("width", width / 4)
    .attr("height", height)
    .style("opacity", 0)
    .style("cursor", "pointer")
    .on("mouseover", event => showChevron("right", width - width / 16))
    .on("mouseout", event => removeChevron())
    .on("click", _ => switchToRightPhoto(photo.googleDriveId, orderedPhotos));

  function showChevron(direction, x) {
    chevronsContainer
      .append("svg:image")
      .attr("class", "switch-left-right-chevron")
      .attr("x", x)
      .attr("y", height / 2)
      .attr("width", 20)
      .attr("height", 20)
      .style("cursor", "pointer")
      .attr("xlink:href", `img/${direction}-chevron.png`);
  }
  function removeChevron() {
    chevronsContainer.selectAll(".switch-left-right-chevron").remove();
  }
  function switchToLeftPhoto(currentGoogleId, orderedPhotos) {
    var photoToSwitchTo = leftPhoto(currentGoogleId, orderedPhotos);
    if (photoToSwitchTo) {
      displayPhoto(photoToSwitchTo);
    }
  }
  function switchToRightPhoto(currentGoogleId, orderedPhotos) {
    var photoToSwitchTo = rightPhoto(currentGoogleId, orderedPhotos);
    if (photoToSwitchTo) {
      displayPhoto(photoToSwitchTo);
    }
  }

  // The button to exit the photo viewer:
  photoViewContainer
    .append("circle")
    .attr("cx", 60)
    .attr("cy", 30)
    .attr("r", 18)
    .style("fill", "grey")
    .style("cursor", "pointer")
    .on("click", _ => quitPhotoView());
  photoViewContainer
    .append("svg:image")
    .attr("x", 49)
    .attr("y", 20)
    .attr("width", 20)
    .attr("height", 20)
    .style("cursor", "pointer")
    .attr("xlink:href", "img/left-arrow.png")
    .on("mouseover", (event, d) => drawTooltip("Back to all photos", photoViewContainer, event, 95, 36))
    .on("mouseout", _ => clearTooltip())
    .on("click", _ => quitPhotoView());
  photoViewContainer
    .append("svg:image")
    .attr("class", "download-button")
    .attr("x", 88)
    .attr("y", 13)
    .attr("width", 35)
    .attr("height", 35)
    .style("cursor", "pointer")
    .attr("xlink:href", "img/download.png")
    .on("mouseover", (event, d) => drawTooltip("Download photo", photoViewContainer, event, 97, 43))
    .on("mouseout", _ => clearTooltip())
    .on("click", _ => downloadPhoto(fullPhotoForDownload(photo.googleDriveId), photo.name));
}

function leftPhoto(currentGoogleId, orderedPhotos) {
  var currentIndex = orderedPhotos.findIndex(arrayPhoto => arrayPhoto.googleDriveId == currentGoogleId);
  if (currentIndex != 0) {
    return orderedPhotos[currentIndex - 1];
  }
}
function rightPhoto(currentGoogleId, orderedPhotos) {
  var currentIndex = orderedPhotos.findIndex(arrayPhoto => arrayPhoto.googleDriveId == currentGoogleId);
  if (currentIndex + 1 != orderedPhotos.length) {
    return orderedPhotos[currentIndex + 1];
  }
}

function quitPhotoView() {
  var scrollPositionToGetBackTo = d3.select(".photo-view-high-res[opacity='1']").attr("scrollPosition");
  d3.select("svg").attr("height", svg.select(".photos-container").node().getBoundingClientRect().height + 50);
  d3.select("g.photo-viewing-page-container").remove();
  window.scrollTo(0, scrollPositionToGetBackTo);
}

function downloadPhoto(photoLink, photoName) {
  var link = document.createElement("a");
  link.href = photoLink;
  link.download = photoName;
  link.click();
}
