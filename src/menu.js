
function drawMenu(menuContainer, initialMenu) {

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
        window.history.pushState({}, document.title, `/?menu=${menuName}`);
      },
      menuIcon,
      buttonDimensions[menuName].x,
      buttonDimensions[menuName].y,
      isSelected
    );
  }

  // In order to reload the previous page when using the browser "back" history button:
  window.addEventListener("popstate", _ => location.reload());

  drawMenuItem("map", "world.jpeg", _ => drawMapAndTraces(content, width, height), initialMenu == "map");
  drawMenuItem("multidayhikes", "hike.jpeg", _ => drawMultiDayHikes(content, width, height), initialMenu == "multidayhikes");
  drawMenuItem("photos", "photo.png", _ => drawPhotos(content, width, height), initialMenu == "photos");
  drawMenuItem("graphs", "graphs.jpeg", _ => drawGraphs(content, width, height), initialMenu == "graphs");
  drawMenuItem("stats", "stats.png", _ => drawUserStats(content, width, height), initialMenu == "stats");

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
    cleanGraphPage();
    cleanUserStatsPage(content);
    cleanMultiDayHikesPage(content);
  }
}
