
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
        newTooltipText = "Hikes wishlist";
      } else {
        mapPageState.displayWishList = true;
        setOpacityOnWishListHikes(1);
        newTooltipText = "Hide hikes wishlist";
      }
      var isMapZoomedEnough = mapPageState.previousZoom >= constants.wishList5kmMarkersAndLocationsMinZoom;
      drawWishListHikes5kmMarks(mapContainer, mapPageState.displayWishList, isMapZoomedEnough, projection);
      drawWishListHikesNames(mapContainer, mapPageState.displayWishList, isMapZoomedEnough, projection);
      drawWishlistHikesLocationsIcons(mapContainer, mapPageState.displayWishList, isMapZoomedEnough, projection);
      transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(mapContainer, mapPageState.previousTransform, projection);
      if (mapPageState.displayWishList) {
        attachTooltipToButton("wishlist-switch", newTooltipText, -67, 38);
      } else {
        attachTooltipToButton("wishlist-switch", newTooltipText, -51, 38);
      }
      clearTooltip();
    },
    "sandglass.png",
    width - 27,
    height / 2 - 25,
    false
  );

  attachTooltipToButton("wishlist-switch", "Hikes wishlist", -51, 38);
}

function transformWishlistHikes5kmMarkersAndLocationsIconsForZoomAndPosition(mapContainer, transform, projection) {

  function adaptToTransform(selection) {
    mapContainer
      .selectAll(selection)
      .attr("transform", transform)
      .select("text")
      .style("font-size", 12 / transform.k);
  }

  adaptToTransform("g.wishlist-5km-mark");
  adaptToTransform("g.wishlist-names");

  transformMapIconsForZoom(mapContainer, projection, "wishlist-hikes-locations", transform, 20, 20);
}

function drawWishListHikesNames(mapContainer, displayWishList, isMapZoomedEnough, projection) {

  var invisibleChar = String.fromCharCode(8287);

  mapContainer
    .selectAll("g.wishlist-names")
    .data(displayWishList && isMapZoomedEnough ? data.wishlistHikes : [])
    .join(
      enter => {
        var markerContainer =
          enter
            .append("g")
            .attr("class", "wishlist-names")
            .attr("id", hike => `hike-name--${hike.name}`)
            .attr("pointer-events", "none");
        markerContainer
          .append("text")
          // The fake white spaces are there to translate the hike name towards the right after the "0km" text:
          .text(hike => `${invisibleChar.repeat(5)}${hike.name.replaceAll("--", "#").replaceAll("-", " ").replaceAll("#", " - ")}`)
          .attr("x", hike => {
            var startCoordinates = hike.tenMeterSlices[0];
            return projection([startCoordinates.fromLongitude, startCoordinates.fromLatitude])[0];
          })
          .attr("y", hike => {
            var startCoordinates = hike.tenMeterSlices[0];
            return projection([startCoordinates.fromLongitude, startCoordinates.fromLatitude])[1];
          })
          .style("fill", "black")
          .style("font-size", 12)
          .style("font-family", "sans-serif")
          .style("font-weight", "bold")
          .style("text-anchor", "start")
          .style("user-select", "none")
          .style("alignment-baseline", "middle");
      },
      update =>
        update,
      exit =>
        exit.remove()
    );
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
