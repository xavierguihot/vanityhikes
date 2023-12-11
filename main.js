var width = window.innerWidth, height = window.innerHeight;

d3.select("body").style("margin", "0");

var svg = d3.select("svg.content").attr("width", width).attr("height", height);

var content = svg.append("g").attr("class", "page-content");
var bannerContainer = d3.select("svg.banners").style("position", "fixed").style("top", "0").style("left", "0").style("width", "0").style("height", "0").append("g").attr("class", "banners-container");
var menuContainer = d3.select("svg.menu").style("position", "fixed").style("top", "0").style("left", "0").style("width", 30).append("g");

drawMenu(menuContainer);

var data = {
  hikes: [],
  photos: [],
  timeline: [],
  multiDayHikes: [],
  userStats: "",
  wishlistHikes: [],
  wishListHikes5kmMarks: [],
  wishlistHikesLocations: []
}

d3.text("data/light-hikes.csv").then(csv => {
  data.hikes = readHikesCsv(csv, false);
  d3.json("data/photos.json").then(json => {
    data.photos = json;
    d3.text("data/light-wishlist-hikes.csv").then(csv => {
      data.wishlistHikes = readHikesCsv(csv, true);
      d3.json("data/wishlist-hikes-locations.json", /*{ cache: "no-store" }*/).then(json => {
        data.wishlistHikesLocations = json;

        drawMapAndTraces(content, width, height);

        d3.json("data/timeline.json").then(json => {
          data.timeline = json.filter(d => d.daysAgo <= 0);
          // Banner if data hasn't been updated in a while:
          drawOutdatedDataBannerIfNeeded();
        });
        d3.text("data/user-stats.txt").then(text => {
          data.userStats = text;
        });
        d3.json("data/multi-day-hikes.json").then(json => {
          data.multiDayHikes = json.filter(d => !d.hide);
        });
      });
    });
  });
});

// Banner if not using Google Chrome:
var isChrome = window.hasOwnProperty("chrome");
if (!isChrome) {
  drawBanner("This website has been built for Chrome, experience might be degraded on Safari, Firefox, ...", bannerContainer);
}

// Key event listeners:
d3.select("body")
  .on("keydown", event => {
    if (event.key == "Escape") {
      if (!d3.selectAll("g.photo-viewing-page-container").empty()) {
        quitPhotoView()
      }
      if (!d3.selectAll(".photo-on-map-holder").empty()) {
        d3.selectAll(".photo-on-map-holder").remove();
      }
    }
  });

function readHikesCsv(csv, isWish) {

  function parseFloatOrZero(str) {
    return str == "" ? 0.0 : parseFloat(str)
  }

  return csv
    .replaceAll("#", "|-")
    .split("\n")
    .filter(d => d != "")
    .map(line => {
      var parts = line.split("^")

      var startTimestamp = parseInt(parts[1]);
      var startFromLatitude = parseFloat(parts[2])
      var startFromLongitude = parseFloat(parts[3])

      function readSlice(csvSlice) {
        var parts = csvSlice.split("|");
        return {
          startTimestamp: startTimestamp + parseInt(parts[0]),
          distance: parseFloat(parts[1]) / 10000,
          fromLatitude: startFromLatitude + (parseFloatOrZero(parts[2]) / 1000000),
          fromLongitude: startFromLongitude + (parseFloatOrZero(parts[3]) / 1000000)
        }
      }

      return {
        name: parts[0],
        kilometerSlices: parts[6].split("/").map(readSlice),
        hundredMeterSlices: parts[7].split("/").map(readSlice),
        tenMeterSlices: parts[8].split("/").map(readSlice),
        durationInSeconds: parseInt(parts[9]),
        idleTimeIntSeconds: parseInt(parts[10]),
        distance: parseFloat(parts[11]),
        positiveElevation: parseFloat(parts[12]),
        date: parts[13],
        isWish: isWish
      }
    });
}

function drawOutdatedDataBannerIfNeeded() {
  var lastUpdatedDate = data.timeline.find(d => d.daysAgo == 0).date;
  var daysSinceLastUpdate = Math.trunc((new Date() - new Date(lastUpdatedDate)) / (1000 * 60 * 60 * 24));
  if (daysSinceLastUpdate >= 7) { // days
    drawBanner(`The data may be outdated, I've probably been out in the wilderness for a while. Last update: ${lastUpdatedDate}`, bannerContainer);
  }
}
