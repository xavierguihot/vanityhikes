
function drawPhotos(svg, width, height) {
  loadPhotos().then(_ => displayPhotos(svg, width, height));
}

function displayPhotos(svg, width, height) {

  var topMargin = 50;
  var leftMargin = 40;
  var maxLineWidth = width - 70;
  var minLineHeight = width * 200 / 1200; // Adapted to the width of the screen
  if (minLineHeight > 200) minLineHeight = 200;
  if (minLineHeight < 100) minLineHeight = 100;
  var spaceBetweenPhotos = 4;
  var heightBetweenPhotoDates = 50;

  var photosContainer =
    svg
      .append("g")
      .attr("class", "photos-container")
      .attr("transform", `translate(0, ${topMargin})`);

  // Photos ordered by decreasing date:
  var orderedPhotos = data.photos.sort((photoA, photoB) => d3.descending(photoA.dateTime, photoB.dateTime));

  var photosByDay =
    d3.groups(data.photos, d => d.dateTime.split("T")[0])
      .sort((a, b) => d3.descending(a[0], b[0]))
      .map(group => {
        var date = group[0];
        var groupPhotos = group[1].sort((a, b) => d3.descending(a.dateTime, b.dateTime));
        return {
          date: date,
          dayLinesOfPhotos: organiseDayPhotosInLines(groupPhotos)
        };
      });

  photosByDay.forEach((group, i) => {

    var date = group.date;
    var datePhotos = group.dayLinesOfPhotos.photoLines.flat();

    var dayY = d3.sum(photosByDay.slice(0, i), d => d.dayLinesOfPhotos.dayHeight) + i * heightBetweenPhotoDates;
    datePhotos.forEach(photo => photo.pageY = dayY + photo.y);

    photosContainer
      .append("g")
      .append("text")
      .attr("x", leftMargin + 10)
      .attr("y", dayY - 17)
      .style("fill", "rgb(60,64,67)")
      .style("font-size", ".875rem")
      .style("font-weight", 500)
      .style("font-family", "Roboto,Arial,sans-serif")
      .style("user-select", "none")
      .text(new Date(date).toDateString());

    photosContainer
      .append("g")
      .attr("id", `photos-${date}`)
      .selectAll("g")
      .data(datePhotos)
      .enter()
      .append("svg:image")
      .attr("class", "photo-miniature-thumbnail")
      .attr("x", photo => leftMargin + photo.x)
      .attr("y", photo => photo.pageY)
      .attr("width", photo => photo.miniatureWidth)
      .attr("height", photo => photo.miniatureHeight)
      .style("cursor", "pointer")
      .attr("xlink:href", "img/white.png")
      .on("mouseover", event => d3.select(event.currentTarget).attr("opacity", "0.85"))
      .on("mouseout", event => d3.select(event.currentTarget).attr("opacity", "1"))
      .on("click", (event, photo) => drawPhoto(photo, orderedPhotos));
  });

  d3.select("svg").attr("height", photosContainer.node().getBoundingClientRect().height + 50);

  function displayMiniaturesAtScrollLevel() {
    var viewingYPosition = window.scrollY;
    photosContainer
      .selectAll(".photo-miniature-thumbnail")
      .filter(photo => photo.pageY > viewingYPosition - (height / 2) && photo.pageY < viewingYPosition + height )
      .attr("xlink:href", photo => thumbnailForWidth(photo.googleDriveId, photo.miniatureWidth));
  }

  function periodicDisplayOfMiniaturesAtScrollLevel() {
    if (!d3.selectAll(".photos-container").empty()) {
      displayMiniaturesAtScrollLevel();
      window.setTimeout(periodicDisplayOfMiniaturesAtScrollLevel, 500);
    }
  }

  periodicDisplayOfMiniaturesAtScrollLevel();

  function organiseDayPhotosInLines(dayPhotos) {

    function miniatureWidth(photo, lineHeight) {
      return photo.width * lineHeight / photo.height;
    }

    var [topLines, lastLine] =
      dayPhotos.foldLeft([[], []], function ([lines, currentLine], photo) {
        var newLineLength =
          d3.sum(currentLine, photo => miniatureWidth(photo, minLineHeight)) +
            miniatureWidth(photo, minLineHeight) +
            currentLine.length * spaceBetweenPhotos;
        if (newLineLength <= maxLineWidth) {
          currentLine.push(photo);
          return [lines, currentLine];
        } else {
          lines.push(currentLine);
          return [lines, [photo]];
        }
      });

    var lines = topLines;
    if (lastLine.length != 0) {
      lines.push(lastLine)
    }

    var y = 0;
    lines.forEach((line, i) => {
      var chosenLineHeight = minLineHeight;
      var marginBetweenPhotos = spaceBetweenPhotos;
      // For all lines except the last one (which may not be full of photos), we slightly increase miniatures height
      // such that the line width is the same for all lines:
      if (i != lines.length - 1) {
        chosenLineHeight =
          d3.range(minLineHeight, minLineHeight + 300)
            .find(lineHeight => {
              var lineLength = d3.sum(line, photo => miniatureWidth(photo, lineHeight)) + (line.length - 1) * spaceBetweenPhotos;
              return lineLength > maxLineWidth;
            }) - 1;
        marginBetweenPhotos = (maxLineWidth - d3.sum(line, photo => miniatureWidth(photo, chosenLineHeight))) / (line.length - 1);
      }
      var x = 0;
      line.forEach(photo => {
        photo["miniatureWidth"] = miniatureWidth(photo, chosenLineHeight);
        photo["miniatureHeight"] = chosenLineHeight;
        photo["x"] = x;
        x += photo["miniatureWidth"] + marginBetweenPhotos;
        photo["y"] = y;
      })
      y += chosenLineHeight + spaceBetweenPhotos;
    })

    return {
      photoLines: lines,
      dayHeight: y - spaceBetweenPhotos
    };
  }

  function drawPhoto(photo, orderedPhotos) {

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

function cleanPhotosPage(svg) {
  svg.select(".photos-container").remove();
  d3.select("g.photo-viewing-page-container").remove();
  d3.select("svg").attr("height", window.innerHeight);
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

Array.prototype.foldLeft = function (sum, callback) {
  var head,
      list = Array.prototype.slice.call(this);

  if (list.length) {
    head = list.shift(1);
    return list.foldLeft(callback(sum, head), callback);
  }
  return sum;
};
