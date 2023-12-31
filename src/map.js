
function drawMapAndTraces(svg, width, height) {
  loadHikeTraces().then(_ => {
    loadPhotos().then(_ => {
      loadWishlistHikeTraces().then(_ => {
        loadWishlistHikeLocations().then(_ => {
          loadTimeline().then(_ => {
            displayMapAndTraces(svg, width, height);
          });
        });
      });
    });
  });
}

function displayMapAndTraces(svg, width, height) {

  var constants = {
    initialScale: 1 / (2 * Math.PI),
    initialCenter: [3.25, 46.5],
    initialZoom: 24000,
    maxZoom: 16000000,
    photoIconsMinZoom: 300000,
    wishList5kmMarkersAndLocationsMinZoom: 300000
  }

  var mapPageState = {
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

  var zoom = d3.zoom().scaleExtent([1 << 11, constants.maxZoom]).on("zoom", zoomed);

  var center = projection(constants.initialCenter);

  //navigator.geolocation.getCurrentPosition(position => console.log(position));

  function drawHikes(hikeToSlices) {
    drawHikeGpxTraces(
      mapContainer,
      data.wishlistHikes.concat(data.hikes),
      projection,
      hikeToSlices
    );
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

  drawHikes(d => d.kilometerSlices);

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
      transform.k >= constants.wishList5kmMarkersAndLocationsMinZoom &&
      mapPageState.previousZoom < constants.wishList5kmMarkersAndLocationsMinZoom
    ) {
      drawWishListHikes5kmMarks(mapPageState.displayWishList, true);
      drawWishlistHikesLocationsIcons(mapPageState.displayWishList, true);
    }
    else if (
      transform.k < constants.wishList5kmMarkersAndLocationsMinZoom &&
      mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom
    ) {
      drawWishListHikes5kmMarks(mapPageState.displayWishList, false); // i.e. remove markers
      drawWishlistHikesLocationsIcons(mapPageState.displayWishList, false);
    }

    mapPageState.previousTransform = transform;
    mapPageState.previousZoom = transform.k;

    resizeHikeGpxTracesForZoom(mapContainer, transform)

    transformPhotoIconsForZoomAndPosition(transform);
    transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(transform);

    updateMapTilesForZoom(raster, width, height, transform);

    drawScaleBar(mapContainer, transform.k, transform.x, transform.y, width, height, constants.initialScale);
  }

  function transformPhotoIconsForZoomAndPosition(transform) {
    transformMapIconsForZoom(mapContainer, projection, "picture", transform, 16, 16);
  }

  function transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(transform) {

    mapContainer
      .selectAll("g.wishlist-5km-mark")
      .attr("transform", transform)
      .select("text")
      .style("font-size", 12 / transform.k);

    transformMapIconsForZoom(mapContainer, projection, "wishlist-hikes-locations", transform, 20, 20);
  }

  // Button to display/hide wish list hikes:
  setOpacityOnWishListHikes(0);
  drawButton(
    buttonsContainer,
    "wishlist-switch",
    _ => {
      var newTooltipText;
      if (mapPageState.displayWishList) {
        mapPageState.displayWishList = false;
        setOpacityOnWishListHikes(0);
        newTooltipText = "Show hikes I plan on doing";
      } else {
        mapPageState.displayWishList = true;
        setOpacityOnWishListHikes(1);
        newTooltipText = "Hide hikes I plan on doing";
      }
      drawWishListHikes5kmMarks(mapPageState.displayWishList, mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom);
      drawWishlistHikesLocationsIcons(mapPageState.displayWishList, mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom);
      transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(mapPageState.previousTransform);
      attachTooltipToButton("wishlist-switch", newTooltipText, -90, 38);
      clearTooltip();
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

  // Draw wishlist hikes locations:

  var locationsSort = ["point of view", "point of interest", "train", "boulangerie", "restaurant", "shop", "camping", "bivouac", "hotel", "refuge", "gite"];

  var wishlistHikesLocationsIconsData =
    d3.sort(
      data.wishlistHikesLocations.flatMap(d => d.locations),
      d => locationsSort.indexOf(d.type)
    )
    .map(location => {
      var image;
      if (location.type == "gite")
        image = "gite-de-france.png";
      if (location.type == "hotel")
        image = "hotel.png";
      if (location.type == "refuge")
        image = "refuge.png";
      if (location.type == "bivouac")
        image = "bivouac.png";
      if (location.type == "camping")
        image = "camping.png";
      if (location.type == "restaurant")
        image = "restaurant.png";
      if (location.type == "shop")
        image = "shop.png";
      if (location.type == "boulangerie")
        image = "bread.png";
      if (location.type == "point of interest")
        image = "exclamation.png";
      if (location.type == "point of view")
        image = "pointofview.png";
      if (location.type == "train")
        image = "train.png";
      return {
        "name": `${location.type}-${location.latitude}-${location.longitude}`,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "image": image,
        "width": 20,
        "height": 20,
        "xOffset": -8,
        "yOffset": -8,
        "location": location
      }
    });

  function drawWishlistHikesLocationsIcons(displayLocations, isMapZoomedEnough) {

    drawIconsOnMap(
      mapContainer,
      projection,
      displayLocations && isMapZoomedEnough ? wishlistHikesLocationsIconsData : [],
      "wishlist-hikes-locations",
      undefined,
      (event, d) => {
        var location = d.location;
        var lines = [`${location.name}`];
        if (location.opening) {
          lines.push(`Opening: ${location.opening}`);
        }
        if (location.phone) {
          lines.push(`${location.phone}`);
        }
        if (location.website) {
          lines.push(`${location.website}`);
        }
        if (location.email) {
          lines.push(`${location.email}`);
        }
        if (location.todo) {
          lines.push(`TODO: ${location.todo}`);
        }
        if (location.payment) {
          lines.push(`Payment: ${location.payment}`);
        }
        if (location.miscellaneous) {
          lines.push(`${location.miscellaneous}`);
        }
        if (location.distanceIntoHike) {
          lines.push(`Distance: ${location.distanceIntoHike.toFixed(1)}km`);
        }
        drawMultiLineTooltip(lines, mapContainer, event, 25, 0);
      }
    );
  }
}

function cleanMapPage(svg) {
  svg.select(".map-container").remove();
  svg.select(".map-buttons-container").remove();
}
