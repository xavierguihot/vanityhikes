
function sortPhotosByDecreasingOrderOfDate(photos) {
  return photos.sort((photoA, photoB) => d3.descending(photoA.dateTime, photoB.dateTime));
}

function organisePhotosByDay(photos, minLineHeight, spaceBetweenPhotos, maxLineWidth) {

  return d3.groups(
    photos,
    d => d.dateTime.split("T")[0]
  ).sort((a, b) => d3.descending(a[0], b[0]))
    .map(group => {
      var date = group[0];
      var groupPhotos = sortPhotosByDecreasingOrderOfDate(group[1]);
      return {
        date: date,
        dayLinesOfPhotos: organiseDayPhotosInLines(groupPhotos, minLineHeight, spaceBetweenPhotos, maxLineWidth)
      };
    });
}

function organiseDayPhotosInLines(dayPhotos, minLineHeight, spaceBetweenPhotos, maxLineWidth) {

  function miniatureWidth(photo, lineHeight) {
    return photo.width * lineHeight / photo.height;
  }

  var [topLines, lastLine] =
    dayPhotos.foldLeft([[], []], function ([lines, currentLine], photo) {
      var newLineLength =
        d3.sum(currentLine, photo => miniatureWidth(photo, minLineHeight)) +
          miniatureWidth(photo, minLineHeight) +
          currentLine.length * spaceBetweenPhotos;
      if (newLineLength <= maxLineWidth) {
        currentLine.push(photo);
        return [lines, currentLine];
      } else {
        lines.push(currentLine);
        return [lines, [photo]];
      }
    });

  var lines = topLines;
  if (lastLine.length != 0) {
    lines.push(lastLine)
  }

  var y = 0;
  lines.forEach((line, i) => {
    var chosenLineHeight = minLineHeight;
    var marginBetweenPhotos = spaceBetweenPhotos;
    // For all lines except the last one (which may not be full of photos), we slightly increase miniatures height
    // such that the line width is the same for all lines:
    if (i != lines.length - 1) {
      chosenLineHeight =
        d3.range(minLineHeight, minLineHeight + 300)
          .find(lineHeight => {
            var lineLength = d3.sum(line, photo => miniatureWidth(photo, lineHeight)) + (line.length - 1) * spaceBetweenPhotos;
            return lineLength > maxLineWidth;
          }) - 1;
      marginBetweenPhotos = (maxLineWidth - d3.sum(line, photo => miniatureWidth(photo, chosenLineHeight))) / (line.length - 1);
    }
    var x = 0;
    line.forEach(photo => {
      photo["miniatureWidth"] = miniatureWidth(photo, chosenLineHeight);
      photo["miniatureHeight"] = chosenLineHeight;
      photo["x"] = x;
      x += photo["miniatureWidth"] + marginBetweenPhotos;
      photo["y"] = y;
    })
    y += chosenLineHeight + spaceBetweenPhotos;
  })

  return {
    photoLines: lines,
    dayHeight: y - spaceBetweenPhotos
  };
}

Array.prototype.foldLeft = function (sum, callback) {
  var head,
      list = Array.prototype.slice.call(this);

  if (list.length) {
    head = list.shift(1);
    return list.foldLeft(callback(sum, head), callback);
  }
  return sum;
};
