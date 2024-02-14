
function drawSelector(container, selectorName, choices, selectedChoice, selectionAction, x, y, centered) {

  container.selectAll(`g.${selectorName}`).remove();
  var selectorContainer = container.append("g").attr("class", selectorName);

  var text =
    selectorContainer
      .append("text")
      .attr("class", "selected-choice-text")
      .attr("x", 10)
      .attr("y", 15)
      .style("color", "rgb(60,64,67)")
      .style("dy", ".35em")
      .style("font-size", "15")
      .style("font-weight", 400)
      .style("font-family", "Roboto,Arial,sans-serif")
      .text(selectedChoice);

  var cog =
    selectorContainer
      .append("svg:image")
      .attr("id", "graphs-button")
      .attr("xlink:href", "img/cog.jpeg")
      .attr("width", 16)
      .attr("height", 16)
      .attr("x", 2)
      .attr("y", 2);

  var clickArea =
    selectorContainer
      .append("rect")
      .attr("height", 20)
      .style("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", _ => drawChoicesToSelect(choices, selectionAction, selectorName, x, y, centered));

  var selectedChoiceTextWidth = text.node().getBBox().width;
  if (centered) {
    selectorContainer.attr("transform", `translate(${x - selectedChoiceTextWidth / 2 - 10}, ${y})`);
    clickArea.attr("width", selectedChoiceTextWidth + 20 /* margins */ + 22 /* cog img */);
    cog.attr("x", selectedChoiceTextWidth + 17);
  } else {
    selectorContainer.attr("transform", `translate(${x - 10}, ${y})`);
    clickArea.attr("width", selectedChoiceTextWidth + 20 /* margins */ + 22 /* cog img */);
    cog.attr("x", selectedChoiceTextWidth + 17);
  }
}

function drawChoicesToSelect(choices, selectionAction, selectorName, x, y, centered) {

  function removeSelector() {
    d3.select("g.selector-click-exit-background").remove();
    d3.select("g.selector-choices-container").remove();
  }

  // A transparent area covering the whole page such that clicking on it removes the selection menu:
  svg
    .append("g")
    .attr("class", "selector-click-exit-background")
    .append("rect")
    .style("fill", "grey")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0.1)
    .on("click", _ => removeSelector());

  var choicesSelectorContainer = svg.append("g").attr("class", "selector-choices-container");

  var selectorWhiteBackground =
    choicesSelectorContainer.append("rect").style("fill", "white").attr("x", -10).attr("y", y + 5);

  var textChoices =
    choicesSelectorContainer
      .selectAll("g")
      .data(choices)
      .enter()
      .append("text")
      .attr("class", "choice-text")
      .text(d => d)
      .attr("y", (_, i) => y + 20 + i * 20)
      .style("color", "rgb(60,64,67)")
      .style("dy", ".35em")
      .style("font-size", "15")
      .style("font-weight", 400)
      .style("font-family", "Roboto,Arial,sans-serif");

  var textChoicesClickAreas =
    choicesSelectorContainer
      .selectAll("g")
      .data(choices)
      .enter()
      .append("rect")
      .attr("class", "choice-click-area")
      .attr("height", 20)
      .attr("x", -10)
      .attr("y", (d, i) => y + 5 + i * 20)
      .style("fill", "transparent")
      .style("stroke", "black") // remove me
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        removeSelector();
        selectionAction(d);
      });

  var selectedChoiceTextWidth = d3.select(".selected-choice-text").node().getBBox().width;

  if (centered) {
    choicesSelectorContainer.attr("transform", `translate(${x - selectedChoiceTextWidth / 2}, 15)`);
  } else {
    choicesSelectorContainer.attr("transform", `translate(${x}, 15)`)
  }

  var textChoicesSize = d3.select(".selector-choices-container").node().getBBox();
  textChoicesClickAreas.attr("width", textChoicesSize.width + 20);
  selectorWhiteBackground.attr("width", textChoicesSize.width + 20).attr("height", textChoicesSize.height + 4);
}
