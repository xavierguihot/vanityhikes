
function drawMapAndTraces(svg, width, height) {
  drawLoader();
  loadHikeTraces().then(_ => {
    loadPhotos().then(_ => {
      loadWishlistHikeTraces().then(_ => {
        loadWishlistHikeLocations().then(_ => {
          loadTimeline().then(_ => {
            displayMapAndTraces(svg, width, height);
            removeLoader();
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
      drawPhotoIcons(mapContainer, mapPageState.displayPhotoIcons, true, projection, width, height);
    }
    else if (
      transform.k < constants.photoIconsMinZoom &&
      mapPageState.previousZoom >= constants.photoIconsMinZoom
    ) {
      drawPhotoIcons(mapContainer, mapPageState.displayPhotoIcons, false, projection, width, height); // i.e. remove pictures
    }

    if (
      transform.k >= constants.wishList5kmMarkersAndLocationsMinZoom &&
      mapPageState.previousZoom < constants.wishList5kmMarkersAndLocationsMinZoom
    ) {
      drawWishListHikes5kmMarks(mapContainer, mapPageState.displayWishList, true, projection);
      drawWishlistHikesLocationsIcons(mapContainer, mapPageState.displayWishList, true, projection);
    }
    else if (
      transform.k < constants.wishList5kmMarkersAndLocationsMinZoom &&
      mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom
    ) {
      drawWishListHikes5kmMarks(mapContainer, mapPageState.displayWishList, false, projection); // i.e. remove markers
      drawWishlistHikesLocationsIcons(mapContainer, mapPageState.displayWishList, false, projection);
    }

    mapPageState.previousTransform = transform;
    mapPageState.previousZoom = transform.k;

    resizeHikeGpxTracesForZoom(mapContainer, transform)

    transformPhotoIconsForZoomAndPosition(mapContainer, transform, projection);
    transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(mapContainer, transform, projection);

    updateMapTilesForZoom(raster, width, height, transform);

    drawScaleBar(mapContainer, transform.k, transform.x, transform.y, width, height, constants.initialScale);
  }

  drawWishListHikesDisplayButton(mapContainer, buttonsContainer, mapPageState, constants, projection, width, height);
  drawPhotoIconsDisplayButton(mapContainer, buttonsContainer, mapPageState, constants, projection, width, height);
}

function cleanMapPage(svg) {
  svg.select(".map-container").remove();
  svg.select(".map-buttons-container").remove();
}
