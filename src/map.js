
var constants = {
  initialScale: 1 / (2 * Math.PI),
  initialCenter: [3.25, 46.5],
  initialZoom: 24000,
  maxZoom: 16000000,
  photoIconsMinZoom: 300000,
  wishList5kmMarkersMinZoom: 700000
}

var mapPageState;

function drawMapAndTraces(svg, width, height) {

  mapPageState = {
    displayWishList: false,
    displayPhotoIcons: true,
    previousTransform: undefined,
    previousZoom: constants.initialZoom
  }

  var mapContainer = svg.append("g").attr("class", "map-container");
  var raster = mapContainer.append("g");
  var buttonsContainer = svg.append("g").attr("class", "map-buttons-container")

  var projection = d3.geoMercator().scale(constants.initialScale).translate([0, 0]);

  var path = d3.geoPath().projection(projection);

  var tile = d3.tile().size([width, height]);

  var zoom = d3.zoom().scaleExtent([1 << 11, constants.maxZoom]).on("zoom", zoomed);

  var center = projection(constants.initialCenter);

  //navigator.geolocation.getCurrentPosition(position => console.log(position));

  var traceLine = d3.line()
      .x(d => projection([d.fromLongitude, d.fromLatitude])[0])
      .y(d => projection([d.fromLongitude, d.fromLatitude])[1]);

  // Draw hike traces:
  function drawHikes(hikeToSlices) {
    mapContainer
      .selectAll("path.hike-line")
      .data(data.wishlistHikes.concat(data.hikes))
      .join(
        enter =>
          enter
            .append("path")
            .attr("class", "hike-line")
            .attr("id", hike => `hike-trace-${hike.name}`)
            .attr("d", hike => traceLine(hikeToSlices(hike)))
            .style("stroke", hike => hike.isWish ? "#f50ce5" : "black")
            .style("fill", "transparent")
            .style("stroke-width", 2 / constants.initialZoom)
            .attr("is-wish", hike => hike.isWish ? "true" : "false"),
        update =>
          update
            .attr("d", hike => traceLine(hikeToSlices(hike))),
        exit =>
          exit.remove()
      );
  }

  function drawScaleBar(zoomLevel, x, y) {
    mapContainer.selectAll("g.scale").remove();
    mapContainer
      .append("g")
      .attr("class", "scale")
      .call(
        d3.geoScaleBar()
          .zoomClamp(false)
          .projection(d3.geoMercator().translate([x, y]).scale(constants.initialScale * zoomLevel))
          .size([width, height])
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

  // Draw pictures:

  var photoIconsData =
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

  function drawPictures(displayPhotos, isMapZoomedEnough) {

    drawIconsOnMap(
      mapContainer,
      projection,
      displayPhotos && isMapZoomedEnough ? photoIconsData : [],
      "picture",
      d => {
        if (d3.selectAll(".photo-on-map-holder").empty()) {
          displayPhoto(d.photo);
        } else {
          d3.selectAll(".photo-on-map-holder").remove();
        }
      }
    );
  }

  function photoViewingDimensions(photo) {
    var photoDisplayHeight = height;
    var photoDisplayWidth = photo.width * height / photo.height;
    if (photoDisplayWidth > width) {
      photoDisplayWidth = width;
      photoDisplayHeight = photo.height * width / photo.width;
    }
    return { width: photoDisplayWidth, height: photoDisplayHeight };
  }

  function displayPhoto(photo) {

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

    var photoDimensions = photoViewingDimensions(photo);

    photoContainer
      .append("svg:image")
      .attr("class", "photo-view-thumbnail")
      .attr("x", (width - photoDimensions.width) / 2)
      .attr("y", (height - photoDimensions.height) / 2)
      .attr("width", photoDimensions.width)
      .attr("height", photoDimensions.height)
      .style("cursor", "pointer")
      //.attr("xlink:href", `https://drive.google.com/uc?id=${photo.googleDriveId}&export=view`)
      .attr("xlink:href", _ => {
        if (photo.cameraMaker == "Panasonic") {
          return `https://drive.google.com/thumbnail?id=${photo.googleDriveId}&export=download&sz=w${photoDimensions.width}`;
        } else {
          return `https://drive.google.com/thumbnail?id=${photo.googleDriveId}&export=download&sz=h${photoDimensions.height}`;
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
      .attr("xlink:href", `https://drive.google.com/uc?id=${photo.googleDriveId}&export=view`)
      .on("click", _ => mapContainer.select(".photo-on-map-holder").remove());
  }

  drawHikes(d => d.kilometerSlices);
  drawPictures(mapPageState.displayPhotoIcons, false);
  drawWishListHikes5kmMarks(mapPageState.displayWishList, false);

  // Apply a zoom transform equivalent to projection.{scale,translate,center}.
  mapContainer
    .call(zoom)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(constants.initialZoom)
        .translate(-center[0], -center[1])
    );

  function zoomed(event, d) {
    var transform = event.transform;

    // Redraw traces based on smaller or bigger distance slices depending on the level of zoom:
    if (transform.k >= 47000 && mapPageState.previousZoom < 47000) {
      drawHikes(d => d.hundredMeterSlices)
    }
    else if (transform.k >= 600000 && mapPageState.previousZoom < 600000) {
      drawHikes(d => d.tenMeterSlices)
    }
    else if (transform.k < 600000 && mapPageState.previousZoom >= 600000) {
      drawHikes(d => d.hundredMeterSlices)
    }
    else if (transform.k < 47000 && mapPageState.previousZoom >= 47000) {
      drawHikes(d => d.kilometerSlices)
    }

    if (
      transform.k >= constants.photoIconsMinZoom &&
      mapPageState.previousZoom < constants.photoIconsMinZoom
    ) {
      drawPictures(mapPageState.displayPhotoIcons, true);
    }
    else if (
      transform.k < constants.photoIconsMinZoom &&
      mapPageState.previousZoom >= constants.photoIconsMinZoom
    ) {
      drawPictures(mapPageState.displayPhotoIcons, false); // i.e. remove pictures
    }

    if (
      transform.k >= constants.wishList5kmMarkersMinZoom &&
      mapPageState.previousZoom < constants.wishList5kmMarkersMinZoom
    ) {
      drawWishListHikes5kmMarks(mapPageState.displayWishList, true);
    }
    else if (
      transform.k < constants.wishList5kmMarkersMinZoom &&
      mapPageState.previousZoom >= constants.wishList5kmMarkersMinZoom
    ) {
      drawWishListHikes5kmMarks(mapPageState.displayWishList, false); // i.e. remove markers
    }

    mapPageState.previousTransform = transform;
    mapPageState.previousZoom = transform.k;

    var tiles = tile.scale(transform.k).translate([transform.x, transform.y])();

    // Adapt the position and the size of hikes (gpx trace) to the new zoom/position:
    mapContainer
      .selectAll("path.hike-line")
      .attr("transform", transform)
      .style("stroke-width", 2 / transform.k);

    transformPhotoIconsForZoomAndPosition(transform);
    transformWishlistHikeMarkersForZoomAndPosition(transform);

    var image =
      raster
        .attr("transform", stringify(tiles.scale, tiles.translate))
        .selectAll("image")
        .data(tiles, d => d);

    image.exit().remove();

    image.enter().append("image")
      // IGN:
      //.attr("xlink:href", d => "https://igngp.geoapi.fr/tile.php/plan-ignv2/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
      //.attr("xlink:href", d => "https://igngp.geoapi.fr/tile.php/cartes/qh80mpsn21g85yxnd8pv2t4s/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
      // Thunderforest:
      .attr("xlink:href", d => "https://tile.thunderforest.com/outdoors/" + d[2] + "/" + d[0] + "/" + d[1] + ".png?apikey=d21c3cd8bdf04051988c503abac1b038")
      // Others:
      //.attr("xlink:href", d => "https://" + "abc"[d[1] % 3] + ".tile.opentopomap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
      //.attr("xlink:href", d => "https://" + "tile.opentopomap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
      //.attr("xlink:href", d => "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png")
      .attr("x", d => d[0] * 256)
      .attr("y", d => d[1] * 256)
      .attr("width", 256)
      .attr("height", 256);

    drawScaleBar(transform.k, transform.x, transform.y);
  }

  function transformPhotoIconsForZoomAndPosition(transform) {
    mapContainer
      .selectAll("image.picture-icon")
      .attr("transform", transform)
      .attr("width", 16 / transform.k)
      .attr("height", 16 / transform.k)
      .attr("x", photo => projection([photo.longitude, photo.latitude])[0] - 8 / transform.k)
      .attr("y", photo => projection([photo.longitude, photo.latitude])[1] - 8 / transform.k);
  }

  function transformWishlistHikeMarkersForZoomAndPosition(transform) {
    mapContainer
      .selectAll("g.wishlist-5km-mark")
      .attr("transform", transform)
      .select("text")
      .style("font-size", 12 / transform.k);
  }

  // Button to display/hide wish list hikes:
  setOpacityOnWishListHikes(0);
  drawButton(
    buttonsContainer,
    "wishlist-switch",
    _ => {
      if (mapPageState.displayWishList) {
        mapPageState.displayWishList = false;
        setOpacityOnWishListHikes(0);
        drawWishListHikes5kmMarks(mapPageState.displayWishList, mapPageState.previousZoom >= constants.wishList5kmMarkersMinZoom);
        transformWishlistHikeMarkersForZoomAndPosition(mapPageState.previousTransform);
        attachTooltipToButton("wishlist-switch", "Show hikes I plan on doing", -90, 38);
        clearTooltip();
      } else {
        mapPageState.displayWishList = true;
        setOpacityOnWishListHikes(1);
        drawWishListHikes5kmMarks(mapPageState.displayWishList, mapPageState.previousZoom >= constants.wishList5kmMarkersMinZoom);
        transformWishlistHikeMarkersForZoomAndPosition(mapPageState.previousTransform);
        attachTooltipToButton("wishlist-switch", "Hide hikes I plan on doing", -90, 38);
        clearTooltip();
      }
    },
    "sandglass.png",
    width - 27,
    height / 2 - 25,
    false
  );
  attachTooltipToButton("wishlist-switch", "Show hikes I plan on doing", -90, 38);

  function setOpacityOnWishListHikes(opacity) {
    mapContainer.selectAll("path.hike-line[is-wish='true']").attr("opacity", opacity);
  }

  // Button to display/hide photos:
  drawButton(
    buttonsContainer,
    "photo-icons-switch",
    _ => {
      if (mapPageState.displayPhotoIcons) {
        mapPageState.displayPhotoIcons = false;
        drawPictures(mapPageState.displayPhotoIcons, mapPageState.previousZoom >= constants.photoIconsMinZoom);
        transformPhotoIconsForZoomAndPosition(mapPageState.previousTransform);
        attachTooltipToButton("photo-icons-switch", "Show photos", -47, 38);
        clearTooltip();
      } else {
        mapPageState.displayPhotoIcons = true;
        drawPictures(mapPageState.displayPhotoIcons, mapPageState.previousZoom >= constants.photoIconsMinZoom);
        transformPhotoIconsForZoomAndPosition(mapPageState.previousTransform);
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

  function stringify(scale, translate) {
    var k = scale / 256, r = scale % 1 ? Number : Math.round;
    return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
  }

  function drawWishListHikes5kmMarks(displayWishList, isMapZoomedEnough) {

    if (data.wishListHikes5kmMarks.length == 0) {
      discoverWishListHikes5kmMarks();
    }

    mapContainer
      .selectAll("g.wishlist-5km-mark")
      .data(displayWishList && isMapZoomedEnough ? data.wishListHikes5kmMarks : [])
      .join(
        enter => {
          var markerContainer =
            enter
              .append("g")
              .attr("class", "wishlist-5km-mark")
              .attr("id", mark => `${mark.hike}-${mark.distance}km-marks`);
          markerContainer
            .append("text")
            .text(mark => `${mark.distance}km`)
            .attr("x", mark => projection([mark.longitude, mark.latitude])[0])
            .attr("y", mark => projection([mark.longitude, mark.latitude])[1])
            .style("fill", "rgb(60,64,67)")
            .style("font-size", 12)
            .style("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .style("user-select", "none")
            .style("alignment-baseline", "middle");
        },
        update =>
          update,
        exit =>
          exit.remove()
      );
  }

  function discoverWishListHikes5kmMarks() {
    var allMarks = [];
    data.wishlistHikes.map(hike => {
      var marks = [
        {
          distance: 0,
          latitude: hike.hundredMeterSlices[0].fromLatitude,
          longitude: hike.hundredMeterSlices[0].fromLongitude,
          hike: hike.name
        }
      ];
      var distance = 0;
      hike.hundredMeterSlices.forEach(slice => {
        distance += slice.distance;
        var flooredDistance = Math.floor(distance);
        if (flooredDistance % 5 == 0 && flooredDistance == marks[marks.length - 1].distance + 5) {
          marks.push(
            {
              distance: flooredDistance,
              latitude: slice.fromLatitude,
              longitude: slice.fromLongitude,
              hike: hike.name
            }
          )
        }
      });
      allMarks = marks.concat(allMarks);
    });
    data.wishListHikes5kmMarks = allMarks;
  }
}

function cleanMapPage(svg) {
  svg.select(".map-container").remove();
  svg.select(".map-buttons-container").remove();
}
