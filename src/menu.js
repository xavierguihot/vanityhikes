
function drawMenu(menuContainer) {

  var buttonsContainer = menuContainer.append("g");

  var buttonDimensions = {
    map: { x: 3, y: 3 },
    multidayhikes: { x: 3, y: 30 },
    photos: { x: 3, y: 57 },
    graphs: { x: 3, y: 84 },
    stats: { x: 3, y: 111 },
  }

  function drawMenuItem(menuName, menuIcon, drawMenuPage, isSelected) {
    drawButton(
      buttonsContainer,
      menuName,
      _ => {
        cleanPages();
        drawMenuPage();
        unselectAllButtons();
      },
      menuIcon,
      buttonDimensions[menuName].x,
      buttonDimensions[menuName].y,
      isSelected
    );
  }

  drawMenuItem("map", "world.jpeg", _ => drawMapAndTraces(content, width, height), true);
  drawMenuItem("multidayhikes", "hike.jpeg", _ => drawMultiDayHikes(content, width, height), false);
  drawMenuItem("photos", "photo.png", _ => drawPhotos(content, width, height), false);
  drawMenuItem("graphs", "graphs.jpeg", _ => drawGraphs(content, width, height), false);
  drawMenuItem("stats", "stats.png", _ => drawUserStats(content, width, height), false);

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
