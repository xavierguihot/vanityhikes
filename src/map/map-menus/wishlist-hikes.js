
var wishlistHikesLocationsIconsData = [];

function drawWishListHikesDisplayButton(mapContainer, buttonsContainer, mapPageState, constants, projection, width, height) {

  function setOpacityOnWishListHikes(opacity) {
    mapContainer.selectAll("path.hike-line[is-wish='true']").attr("opacity", opacity);
  }

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
      drawWishListHikes5kmMarks(mapContainer, mapPageState.displayWishList, mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom, projection);
      drawWishlistHikesLocationsIcons(mapContainer, mapPageState.displayWishList, mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom, projection);
      transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(mapContainer, mapPageState.previousTransform, projection);
      attachTooltipToButton("wishlist-switch", newTooltipText, -90, 38);
      clearTooltip();
    },
    "sandglass.png",
    width - 27,
    height / 2 - 25,
    false
  );

  attachTooltipToButton("wishlist-switch", "Show hikes I plan on doing", -90, 38);
}

function transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(mapContainer, transform, projection) {

  mapContainer
    .selectAll("g.wishlist-5km-mark")
    .attr("transform", transform)
    .select("text")
    .style("font-size", 12 / transform.k);

  transformMapIconsForZoom(mapContainer, projection, "wishlist-hikes-locations", transform, 20, 20);
}

function drawWishListHikes5kmMarks(mapContainer, displayWishList, isMapZoomedEnough, projection) {

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
            .attr("id", mark => `${mark.hike}-${mark.distance}km-marks`)
            .attr("pointer-events", "none");
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

function drawWishlistHikesLocationsIcons(mapContainer, displayLocations, isMapZoomedEnough, projection) {

  drawIconsOnMap(
    mapContainer,
    projection,
    displayLocations && isMapZoomedEnough ? getWishlistHikesLocationsIconsData() : [],
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

var locationsSort = ["point of view", "point of interest", "train", "boulangerie", "restaurant", "hotel", "shop", "camping", "bivouac", "refuge", "gite"];

function getWishlistHikesLocationsIconsData() {

  if (wishlistHikesLocationsIconsData.length == 0) {
    wishlistHikesLocationsIconsData =
      d3.sort(
        data.wishlistHikesLocations.flatMap(d => d.locations),
        d => locationsSort.indexOf(d.type)
      )
      .map(location => {
        return {
          "name": `${location.type}-${location.latitude}-${location.longitude}`,
          "latitude": location.latitude,
          "longitude": location.longitude,
          "image": locationTypeToImage(location.type),
          "width": 20,
          "height": 20,
          "xOffset": -8,
          "yOffset": -8,
          "location": location
        }
      });
  }

  return wishlistHikesLocationsIconsData;
}
