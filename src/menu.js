
function drawMenu(menuContainer) {

  var buttonsBordersContainer = menuContainer.append("g");
  var buttonsContainer = menuContainer.append("g");

  var buttonDimensions = {
    width: 24,
    height: 24,
    items: {
      map: { x: 3, y: 3 },
      multidayhikes: { x: 3, y: 30 },
      photos: { x: 3, y: 57 },
      graphs: { x: 3, y: 84 },
      stats: { x: 3, y: 111 },
    }
  }

  buttonsContainer
    .append("svg:image")
    .attr("id", "map-button")
    .attr("xlink:href", "img/world.jpeg")
    .attr("x", buttonDimensions.items.map.x)
    .attr("y", buttonDimensions.items.map.y)
    .attr("width", buttonDimensions.width)
    .attr("height", buttonDimensions.height)
    .style("cursor", "pointer")
    .on("click", _ => {
      cleanPages();
      drawMapAndTraces(content, width, height);
      unselectAllButtons();
      selectButton("map");
    });

  buttonsContainer
    .append("svg:image")
    .attr("id", "multidayhikes-button")
    .attr("xlink:href", "img/hike.jpeg")
    .attr("x", buttonDimensions.items.multidayhikes.x)
    .attr("y", buttonDimensions.items.multidayhikes.y)
    .attr("width", buttonDimensions.width)
    .attr("height", buttonDimensions.height)
    .style("cursor", "pointer")
    .on("click", _ => {
      cleanPages();
      drawMultiDayHikes(content, width, height);
      unselectAllButtons();
      selectButton("multidayhikes");
    });

  buttonsContainer
    .append("svg:image")
    .attr("id", "photos-button")
    .attr("xlink:href", "img/photo.png")
    .attr("x", buttonDimensions.items.photos.x)
    .attr("y", buttonDimensions.items.photos.y)
    .attr("width", buttonDimensions.width)
    .attr("height", buttonDimensions.height)
    .style("cursor", "pointer")
    .on("click", _ => {
      cleanPages();
      drawPhotos(content, width, height);
      unselectAllButtons();
      selectButton("photos");
    });

  buttonsContainer
    .append("svg:image")
    .attr("id", "graphs-button")
    .attr("xlink:href", "img/graphs.jpeg")
    .attr("x", buttonDimensions.items.graphs.x)
    .attr("y", buttonDimensions.items.graphs.y)
    .attr("width", buttonDimensions.width)
    .attr("height", buttonDimensions.height)
    .style("cursor", "pointer")
    .on("click", _ => {
      cleanPages();
      drawGraphs(content, width, height);
      unselectAllButtons();
      selectButton("graphs");
    });

  buttonsContainer
    .append("svg:image")
    .attr("id", "stats-button")
    .attr("xlink:href", "img/stats.png")
    .attr("x", buttonDimensions.items.stats.x)
    .attr("y", buttonDimensions.items.stats.y)
    .attr("width", buttonDimensions.width)
    .attr("height", buttonDimensions.height)
    .style("cursor", "pointer")
    .on("click", _ => {
      cleanPages();
      drawUserStats(content, width, height);
      unselectAllButtons();
      selectButton("stats");
    });

  drawButtonBorder("map");
  drawButtonBorder("photos");
  drawButtonBorder("graphs");
  drawButtonBorder("stats");
  drawButtonBorder("multidayhikes");
  unselectAllButtons()
  selectButton("map");

  function drawButtonBorder(item) {
    buttonsBordersContainer
      .append("rect")
      .attr("class", "button-border")
      .attr("id", `button-border-${item}`);
  }

  function selectButton(item) {
    buttonsBordersContainer
      .selectAll(`#button-border-${item}`)
      .attr("x", buttonDimensions.items[item].x - 2)
      .attr("y", buttonDimensions.items[item].y - 2)
      .attr("width", buttonDimensions.width + 4)
      .attr("height", buttonDimensions.height + 4)
      .style("fill", "#008EFC");
  }

  function unselectButton(item) {
    buttonsBordersContainer
      .selectAll(`#button-border-${item}`)
      .attr("x", buttonDimensions.items[item].x - 1)
      .attr("y", buttonDimensions.items[item].y - 1)
      .attr("width", buttonDimensions.width + 2)
      .attr("height", buttonDimensions.height + 2)
      .style("fill", "lightgrey");
  }

  function unselectAllButtons() {
    unselectButton("map");
    unselectButton("photos");
    unselectButton("graphs");
    unselectButton("stats");
    unselectButton("multidayhikes");
  }

  function cleanPages() {
    cleanMapPage(content);
    cleanPhotosPage(content);
    cleanGraphPage(content);
    cleanUserStatsPage(content);
    cleanMultiDayHikesPage(content);
  }
}
