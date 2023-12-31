
function loadHikeTraces() {

  if (data.hikes.length == 0) {
    return d3.text("data/light-hikes.csv").then(csv => {
      data.hikes = readHikesCsv(csv, false);
      console.log("Loaded hikes");
    });
  } else {
    return Promise.resolve();
  }
}

function loadPhotos() {

  if (data.photos.length == 0) {
    return d3.json("data/photos.json").then(json => {
       data.photos = json;
       console.log("Loaded photos");
    });
  } else {
    return Promise.resolve();
  }
}

function loadWishlistHikeTraces() {

  if (data.wishlistHikes.length == 0) {
    return d3.text("data/light-wishlist-hikes.csv").then(csv => {
      data.wishlistHikes = readHikesCsv(csv, true);
      console.log("Loaded wishlist hikes");
    });
  } else {
    return Promise.resolve();
  }
}

function loadWishlistHikeLocations() {

  if (data.wishlistHikesLocations.length == 0) {
    return d3.json("data/wishlist-hikes-locations.json").then(json => {
      data.wishlistHikesLocations = json;
      console.log("Loaded wishlist hike locations");
    });
  } else {
    return Promise.resolve();
  }
}

function loadTimeline() {

  if (data.timeline.length == 0) {
    return d3.json("data/timeline.json").then(json => {
       data.timeline = json.filter(d => d.daysAgo <= 0);
       console.log("Loaded timeline");
       // Banner if data hasn't been updated in a while:
       drawOutdatedDataBannerIfNeeded();
    });
  } else {
    return Promise.resolve();
  }
}

function loadUserStats() {

  if (data.userStats == "") {
    return d3.text("data/user-stats.txt").then(text => {
       data.userStats = text;
       console.log("Loaded user stats");
    });
  } else {
    return Promise.resolve();
  }
}

function loadMultiDayHikes() {

  if (data.multiDayHikes.length == 0) {
    return d3.json("data/multi-day-hikes.json").then(json => {
       data.multiDayHikes = json.filter(d => !d.hide);
       console.log("Loaded multi-day hikes");
    });
  } else {
    return Promise.resolve();
  }
}
