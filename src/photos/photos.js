
var photoTags = [];

function drawPhotos(svg, width, height) {
  drawLoader();
  setPageDescription("Vanity Hikes: Photos taken on my hikes - Xavier Guihot");
  loadPhotos().then(_ => {
    displayPhotos(svg, width, height, "All photos");
    removeLoader();
  });
}

function displayPhotos(svg, width, height, photosTagFilter) {

  var topMargin = 50;
  var leftMargin = 40;
  var maxLineWidth = width - 70;
  var minLineHeight = width * 200 / 1200; // Adapted to the width of the screen
  if (minLineHeight > 200) minLineHeight = 200;
  if (minLineHeight < 100) minLineHeight = 100;
  var spaceBetweenPhotos = 4;
  var heightBetweenPhotoDates = 50;

  svg.selectAll("g.photos-container").remove();
  var photosContainer = svg.append("g").attr("class", "photos-container");

  var photosToList;
  if (photosTagFilter == "All photos") {
    photosToList = data.photos;
  } else if (photosTagFilter == "Most beautiful photos") {
    photosToList = data.photos.filter(photo => photo.isBeautiful);
  } else {
    photosToList = data.photos.filter(photo =>
      (photo.tags && photo.tags.includes(photosTagFilter)) || photo.multiDayHike == photosTagFilter
    );
  }

  var orderedPhotos = sortPhotosByDecreasingOrderOfDate(photosToList);

  var photosByDay = organisePhotosByDay(photosToList, minLineHeight, spaceBetweenPhotos, maxLineWidth);

  photosByDay.forEach((group, i) => {

    var date = group.date;
    var datePhotos = group.dayLinesOfPhotos.photoLines.flat();

    var dayY = d3.sum(photosByDay.slice(0, i), d => d.dayLinesOfPhotos.dayHeight) + i * heightBetweenPhotoDates + topMargin;
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
      .on("mouseover", (event, photo) => {
        d3.select(event.currentTarget).attr("opacity", "0.85");
        console.log(photo);
        console.log(photo.name);
        console.log(`gpx: ${photo.latitude}, ${photo.longitude}`);
      })
      .on("mouseout", event => d3.select(event.currentTarget).attr("opacity", "1"))
      .on("click", (event, photo) => drawPhoto(photo, orderedPhotos, width, height));
  });

  drawSelector(
    photosContainer,
    "photo-tags",
    ["All photos", "Most beautiful photos"].concat(getPhotoTags()),
    photosTagFilter,
    selectedTag => {
      cleanPhotosPage(svg);
      displayPhotos(svg, width, height, selectedTag);
    },
    width / 2,
    20,
    true
  );

  d3.select("svg").attr("height", d3.max([photosContainer.node().getBoundingClientRect().height + 50, height]));

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
      window.setTimeout(periodicDisplayOfMiniaturesAtScrollLevel, 750);
    }
  }

  periodicDisplayOfMiniaturesAtScrollLevel();
}

function getPhotoTags() {

  if (photoTags.length == 0) {
    photoTags =
      d3.sort(
        [...new Set(
          data.photos.flatMap(photo => {
            var tags = photo.tags ? photo.tags : [];
            if (photo.multiDayHike) {
              tags = tags.concat(photo.multiDayHike);
            }
            return tags.filter(d => d != "");
          })
        )]
      );
  }

  return photoTags;
}

function cleanPhotosPage(svg) {
  svg.select(".photos-container").remove();
  d3.select("g.photo-viewing-page-container").remove();
  d3.select("svg").attr("height", window.innerHeight);
}
