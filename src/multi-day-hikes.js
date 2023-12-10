
function drawMultiDayHikes(svg, width, height) {

  var constants = {
    topMargin: 30,
    bottomMargin: 50,
    leftMargin: 50,
    rightMargin: 40,
    spaceBetweenHikes: 25,
    initialScale: 1 / (2 * Math.PI),
    maxZoom: 16000000,
    photoIconsMinZoom: 100000
  }

  // Adapt a dimension to the width of the screen:
  function scaleToWidth(value) {
    return value * width / 1745;
  }

  var multiDayHikeHeight = scaleToWidth(400);
  var mapWidth = multiDayHikeHeight;
  var mapHeight = multiDayHikeHeight;

  var multiDayHikesContainer =
    svg
      .append("g")
      .attr("class", "multi-day-hikes-container")
      .attr("transform", `translate(${constants.leftMargin}, ${constants.topMargin})`);

  data.multiDayHikes.forEach((multiDayHike, i) => drawMultiDayHike(multiDayHike, i));

  // Adjust the vertical position of each multi day hike on the page based on previous multi day hikes' heights:
  data.multiDayHikes.forEach((multiDayHike, i) => {
    var previousHikesIndexes = Array.from({ length: i }, (v, k) => k + 1);
    var previousHikesHeightSum =
      d3.sum(
        previousHikesIndexes,
        j => multiDayHikesContainer.select(`#multi-day-hike-${j} .multi-day-hike-rectangle`).node().getBoundingClientRect().height
      );
    var hikeY = previousHikesHeightSum + previousHikesIndexes.length * constants.spaceBetweenHikes;
    multiDayHikesContainer.select(`#multi-day-hike-${i}`).attr("transform", `translate(0, ${hikeY})`)
  });

  d3.select("svg")
    .attr(
      "height",
      multiDayHikesContainer.node().getBoundingClientRect().height + constants.topMargin + constants.bottomMargin
    );

  periodicDisplayOfPhotosAtScrollLevel();

  function drawMultiDayHike(multiDayHike, i) {

    var multiDayHikeContainer =
      multiDayHikesContainer.append("g").attr("id", `multi-day-hike-${i}`);

    multiDayHikeContainer
      .append("rect")
      .attr("class", "multi-day-hike-rectangle")
      .style("fill", "white")
      .style("stroke", "grey")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width - constants.leftMargin - constants.rightMargin)
      .attr("height", multiDayHikeHeight);

    var texts =
      [
        { text: multiDayHike.name, x: scaleToWidth(20), y: scaleToWidth(30), fontSize: `${scaleToWidth(1.05)}rem` },
        { text: "Distance / Elevation:", x: scaleToWidth(20), y: scaleToWidth(60), fontSize: `${scaleToWidth(0.875)}rem` },
        { text: `${parseInt(multiDayHike.distance)} km / +${multiDayHike.elevation} m`, x: scaleToWidth(160), y: scaleToWidth(60), fontSize: `${scaleToWidth(0.875)}rem` },
        { text: "Duration:", x: scaleToWidth(20), y: scaleToWidth(80), fontSize: `${scaleToWidth(0.875)}rem` },
        { text: multiDayHike.days == multiDayHike.walkingDays ? `${multiDayHike.days} days` : `${multiDayHike.days} days (${multiDayHike.walkingDays} walking)`, x: scaleToWidth(160), y: scaleToWidth(80), fontSize: `${scaleToWidth(0.875)}rem` },
        { text: "Dates:", x: scaleToWidth(20), y: scaleToWidth(100), fontSize: `${scaleToWidth(0.875)}rem` },
        { text: `${multiDayHike.start.split("T")[0]} to ${multiDayHike.end.split("T")[0]}`, x: scaleToWidth(160), y: scaleToWidth(100), fontSize: `${scaleToWidth(0.875)}rem` },
      ];

    var y = 120;

    if (multiDayHike.type) {
      texts.push({ text: "Type:", x: scaleToWidth(20), y: scaleToWidth(y), fontSize: `${scaleToWidth(0.875)}rem` });
      texts.push({ text: multiDayHike.type, x: scaleToWidth(160), y: scaleToWidth(y), fontSize: `${scaleToWidth(0.875)}rem` });
      y += 20;
    }

    if (multiDayHike.lighterPack) {
      texts.push({ text: "Gear:", x: scaleToWidth(20), y: scaleToWidth(y), fontSize: `${scaleToWidth(0.875)}rem` });
      texts.push({ text: "lighterpack.com", x: scaleToWidth(180), y: scaleToWidth(y), fontSize: `${scaleToWidth(0.875)}rem` });
      multiDayHikeContainer
        .append("svg:image")
        .attr("x", scaleToWidth(160))
        .attr("y", scaleToWidth(y - 15))
        .attr("width", scaleToWidth(18))
        .attr("height", scaleToWidth(18))
        .style("cursor", "pointer")
        .attr("xlink:href", "img/lighterpack.png")
        .on("click", _ => window.open(multiDayHike.lighterPack, "_blank"));
      y += 20;
    }

    multiDayHikeContainer
      .selectAll("g")
      .data(texts)
      .enter()
      .append("text")
      .text(d => d.text)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .style("fill", "rgb(60,64,67)")
      .style("font-size", d => d.fontSize)
      .style("font-weight", 500)
      .style("font-family", "Roboto,Arial,sans-serif")
      .style("cursor", d => d.text == "lighterpack.com" ? "pointer" : "text")
      .style("text-decoration", d => d.text == "lighterpack.com" ? "underline" : undefined)
      .on("click", (_, d) => { if (d.text == "lighterpack.com") window.open(multiDayHike.lighterPack, "_blank"); });

    drawBarCharts(multiDayHike, multiDayHikeContainer);

    var titleAndStatsWidth = scaleToWidth(430);

    var photoWidth = 0;
    if (multiDayHike.photo) {
      var photo = data.photos.find(photo => photo.name == multiDayHike.photo);
      photoWidth = photo.width * mapHeight / photo.height;
    }

    if (multiDayHike.photo) {
      var photo = data.photos.find(photo => photo.name == multiDayHike.photo);
      multiDayHikeContainer
        .append("svg:image")
        .attr("class", "multi-day-hike-photo")
        .attr("id", `photos-${photo.name}`)
        .attr("x", titleAndStatsWidth)
        .attr("y", 0)
        .attr("width", photoWidth)
        .attr("height", mapHeight)
        .attr("googleDriveId", photo.googleDriveId)
        .attr("xlink:href", "img/white.png");
    }

    // Description:
    if (multiDayHike.descriptionFR) {
      var textContainerWidth =
        width - constants.rightMargin - constants.leftMargin - mapWidth - titleAndStatsWidth - photoWidth - 10;
      multiDayHikeContainer
        .append("foreignObject")
        .attr("class", "description")
        .attr("x", titleAndStatsWidth + photoWidth + 5)
        .attr("y", 10)
        .attr("width", textContainerWidth)
        .attr("height", multiDayHikeHeight - 20)
        .append("xhtml:body")
        .style("color", "rgb(60,64,67)")
        .style("font-size", `${scaleToWidth(0.88)}rem`)
        .style("font-weight", 400)
        .style("font-family", "Roboto,Arial,sans-serif")
        .html(`<div style="overflow-y: auto; height: ${multiDayHikeHeight - 40}px">${multiDayHike.descriptionFR}<br></div>`);
    }

    var hikeNames = multiDayHike.overridenHikes ? multiDayHike.overridenHikes : multiDayHike.contiguousHikes;
    var hikes = data.hikes.filter(hike => hikeNames.includes(hike.name));
    drawMap(multiDayHike, hikes, multiDayHikeContainer, i);

    if (multiDayHike.hasGpxFile) {
      multiDayHikeContainer
        .append("svg:image")
        .attr("x", width - constants.rightMargin - constants.leftMargin - scaleToWidth(20))
        .attr("y", scaleToWidth(10))
        .attr("width", scaleToWidth(18))
        .attr("height", scaleToWidth(18))
        .style("cursor", "pointer")
        .attr("xlink:href", "img/gpx.png")
        .on("click", _ => {
          var link = document.createElement("a");
          link.href = `data/gpx/${multiDayHike.name}.gpx`;
          link.download = `${multiDayHike.name}.gpx`;
          link.click();
          drawBanner("Use this gpx file at your own risk! You are responsible for your own safety. Assess feasibility in regards to your technical and physical abilities.", bannerContainer);
        })
        .on("mouseover", (event, d) => drawTooltip("Download GPX file", svg, event, scaleToWidth(-35), scaleToWidth(-5)))
        .on("mouseout", _ => clearTooltip());
    }
  }

  function drawMap(multiDayHike, hikes, multiDayHikeContainer, i) {

    // In order to restrict the map's images and trace within a rectangle:
    multiDayHikeContainer
      .append("clipPath")
      .attr("id", "clip-path")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", mapWidth)
      .attr("height", mapHeight);

    var mapContainer =
      multiDayHikeContainer
        .append("g")
        .attr("class", "multi-day-hike-map-container")
        .attr("transform", `translate(${width - constants.rightMargin - mapWidth - constants.leftMargin}, 0)`)
        .attr("clip-path", "url(#clip-path)");
    var raster = mapContainer.append("g");

    var projection = d3.geoMercator().scale(constants.initialScale).translate([0, 0]);

    var path = d3.geoPath().projection(projection);

    var zoom = d3.zoom().scaleExtent([1 << 11, constants.maxZoom]).on("zoom", zoomed);
    var initialZoom = 50000;
    var maxDimensionInKm = d3.max([multiDayHike.coordinates.widthInKm, multiDayHike.coordinates.heightInKm]);
    if (maxDimensionInKm <= 12) {
      initialZoom = 200000;
    } else if (12 <= maxDimensionInKm && maxDimensionInKm <= 25) {
      initialZoom = 80000;
    } else if (25 <= maxDimensionInKm && maxDimensionInKm <= 50) {
      initialZoom = 62000;
    } else if (50 <= maxDimensionInKm && maxDimensionInKm <= 75) {
      initialZoom = 50000;
    } else if (75 <= maxDimensionInKm && maxDimensionInKm <= 120) {
      initialZoom = 30000;
    } else if (75 <= maxDimensionInKm && maxDimensionInKm <= 120) {
      initialZoom = 20000;
    } else if (120 <= maxDimensionInKm && maxDimensionInKm <= 250) {
      initialZoom = 10000;
    } else {
      initialZoom = 5000;
    }

    // Initial center:
    var center = projection([multiDayHike.coordinates.centerLongitude, multiDayHike.coordinates.centerLatitude]);

    function drawHikes(hikeToSlices) {
      drawHikeGpxTraces(mapContainer, hikes, projection, d => d.tenMeterSlices);
    }

    drawHikes(hikes);

    // Draw locations:

    var locations =
      (multiDayHike.locations ? multiDayHike.locations : [])
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

    function drawLocations(activate) {
      drawIconsOnMap(
        mapContainer,
        projection,
        activate ? locations : [],
        "location",
        undefined,
        (event, d) => {
          if (d.location.name) {
            var x = d3.select(event.currentTarget).node().getBoundingClientRect().x;
            var y = d3.select(event.currentTarget).node().getBoundingClientRect().y + window.scrollY - 20;
            drawTooltipAtPosition(d.location.name, svg, x, y);
          }
        }
      );
    }

    drawLocations(false);

    // Apply a zoom transform equivalent to projection.{scale,translate,center}.
    mapContainer
      .call(zoom)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(mapWidth / 2, mapHeight / 2)
          .scale(initialZoom)
          .translate(-center[0], -center[1])
      );

    function zoomed(event, d) {
      var transform = event.transform;

      drawHikes(hikes);

      drawLocations(transform.k >= constants.photoIconsMinZoom);

      resizeHikeGpxTracesForZoom(mapContainer, transform);

      // Adapt the position and the size of locations to the new zoom/position:
      mapContainer
        .selectAll("image.location-icon")
        .attr("transform", transform)
        .attr("width", 20 / transform.k)
        .attr("height", 20 / transform.k)
        .attr("x", photo => projection([photo.longitude, photo.latitude])[0] - 10 / transform.k)
        .attr("y", photo => projection([photo.longitude, photo.latitude])[1] - 10 / transform.k);

      updateMapTilesForZoom(raster, mapWidth, mapHeight, transform);

      drawScaleBar(mapContainer, transform.k, transform.x, transform.y, mapWidth, mapHeight, constants.initialScale);
    }
  }

  function displayPhotosAtScrollLevel() {
    multiDayHikesContainer
      .selectAll('image.multi-day-hike-photo')
      .nodes()
      .filter(d => {
        var imageYOnPage = d3.select(d).node().getBoundingClientRect().top;
        return imageYOnPage > -height && imageYOnPage < 2 * height;
      })
      .forEach(d => {
        var googleDriveId = d3.select(d).attr("googleDriveId");
        d3.select(d).attr("xlink:href", thumbnailForHeight(googleDriveId, 800));
      });
  }

  function periodicDisplayOfPhotosAtScrollLevel() {
    if (!d3.selectAll(".multi-day-hikes-container").empty()) {
      displayPhotosAtScrollLevel();
      window.setTimeout(periodicDisplayOfPhotosAtScrollLevel, 500);
    }
  }

  function drawBarCharts(multiDayHike, multiDayHikeContainer) {

    var hikeNames = multiDayHike.overridenHikes ? multiDayHike.overridenHikes : multiDayHike.contiguousHikes;

    drawBarChart(multiDayHike.timeline, "distance", multiDayHikeContainer, 167, "km", hikeNames);
    drawBarChart(multiDayHike.timeline, "elevation", multiDayHikeContainer, 280, "m", hikeNames);
  }

  function drawBarChart(timeline, dimensionName, multiDayHikeContainer, positionY, unit, hikeNames) {

    var dimension;
    if (dimensionName == "distance") {
      dimension = d => d.distance;
    } else {
      dimension = d => d.elevation;
    }

    var graphWidth = scaleToWidth(380);
    var graphHeight = scaleToWidth(90);
    var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var graphContainer =
      multiDayHikeContainer
        .append("g")
        .attr("class", "bar-chart-container")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", `translate(${scaleToWidth(40)},${scaleToWidth(positionY)})`);

    var maxValue = d3.max(timeline, d => dimension(d));

    var x = d3.scaleBand().range([0, graphWidth]).domain(d3.map(timeline, d => d.date)).padding(0.2);
    var y = d3.scaleLinear().range([graphHeight, 0]).domain([0, maxValue + 0.05 * maxValue]);

    // x axis:
    graphContainer
      .append("line")
      .attr("x1", 0)
      .attr("y1", graphHeight)
      .attr("x2", graphWidth)
      .attr("y2", graphHeight)
      .style("stroke", "grey")
      .style("stroke-opacity", 1);
    graphContainer
      .selectAll("graph-bar-label")
      .data(timeline.map(d => d.date))
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x(d) + x.bandwidth() / 2},${graphHeight + scaleToWidth(13)})rotate(-45)`)
      .append("text")
      .attr("class", "graph-bar-label")
      .attr("x", 0)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .style("fill", "rgb(60,64,67)")
      .style("font-size", scaleToWidth(9))
      .style("font-family", "sans-serif")
      .text(d => dayNames[d3.timeParse("%Y-%m-%d")(d).getDay()])

    // y axis:
    graphContainer
      .append("g").call(d3.axisLeft(y).tickSize(0).ticks(5).tickFormat("")).style("stroke-opacity", 0.5);
    graphContainer
      .append("g")
      .call(d3.axisLeft(y).tickSize(-graphWidth).ticks(5).tickFormat(d => `${d}${unit}`))
      .style("stroke-opacity", 0)
      .call(g =>
        g.selectAll(".tick:not(:first-of-type) line")
          .style("stroke-opacity", 0.5)
          .style("stroke-dasharray", "2,2")
      )
      .call(g =>
        g.selectAll(".tick text")
          .style("font-size", scaleToWidth(9))
          .style("font-family", "sans-serif")
          .style("fill", "rgb(60,64,67)")
      );

    // Bars:
    graphContainer
      .selectAll("graph-bar")
      .data(timeline)
      .enter()
      .append("rect")
      .attr("id", d => `bar-${dimensionName}-${d.date}`)
      .attr("class", "graph-bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(dimension(d)))
      .attr("width", x.bandwidth())
      .attr("height", d => graphHeight - y(dimension(d)))
      .attr("fill", "steelblue")
      .on("mouseover", (event, dayBar) => {
        // Highlight the hovered bar (different color):
        multiDayHikeContainer.select(`#bar-distance-${dayBar.date}`).attr("fill", "#008EFC");
        multiDayHikeContainer.select(`#bar-elevation-${dayBar.date}`).attr("fill", "#008EFC");
        // Tooltip with distance and elevation:
        var distanceBarSize = multiDayHikeContainer.select(`#bar-distance-${dayBar.date}`).node().getBoundingClientRect();
        var elevationBarSize = multiDayHikeContainer.select(`#bar-elevation-${dayBar.date}`).node().getBoundingClientRect();
        drawTooltipAtPosition(`Distance: ${dayBar.distance.toFixed(2)} km`, svg, distanceBarSize.left + x.bandwidth() / 2, distanceBarSize.y + window.scrollY - 20);
        drawTooltipAtPosition(`Positive elevation: ${dayBar.elevation} m`, svg, distanceBarSize.left + x.bandwidth() / 2, elevationBarSize.y + window.scrollY - 20);
        // Highlight hikes for that day in the map:
        hikeNames
          .filter(hikeName => hikeName.startsWith(dayBar.date))
          .map(cssAcceptedId)
          .forEach(hikeName => d3.select(`#hike-trace-${hikeName}`).style("stroke", "#008EFC"));
      })
      .on("mouseout", event => {
        multiDayHikeContainer.selectAll(".graph-bar").attr("fill", "steelblue");
        d3.selectAll("path.hike-line").style("stroke", "black");
        clearTooltip();
      });
  }
}

function cleanMultiDayHikesPage(svg) {
  svg.select(".multi-day-hikes-container").remove();
  d3.select("svg").attr("height", window.innerHeight);
}
