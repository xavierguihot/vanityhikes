
function drawButton(buttonContainer, buttonName, action, image, x, y, selected) {

  var container =
    buttonContainer
      .append("g")
      .attr("id", `${buttonName}--button`)
      .attr("x", x)
      .attr("y", y)

  container.append("rect").attr("class", "button-border");

  if (selected)
    selectButton(buttonName);
  else
    unselectButton(buttonName);

  container
    .append("svg:image")
    .attr("xlink:href", `img/${image}`)
    .attr("x", x)
    .attr("y", y)
    .attr("width", buttonSize)
    .attr("height", buttonSize)
    .style("cursor", "pointer")
    .on("click", _ => {
      action();
      if (isSelected(buttonName)) {
        unselectButton(buttonName);
      } else {
        selectButton(buttonName);
      }
    });
}

function selectButton(buttonName) {
  var button = d3.select(`#${buttonName}--button`);
  button
    .select(".button-border")
    .attr("selected", true)
    .attr("x", button.attr("x") - 2)
    .attr("y", button.attr("y") - 2)
    .attr("width", buttonSize + 4)
    .attr("height", buttonSize + 4)
    .style("fill", "#008EFC");
}

function unselectButton(buttonName) {
  var button = d3.select(`#${buttonName}--button`);
  button
    .select(".button-border")
    .attr("selected", false)
    .attr("x", button.attr("x") - 1)
    .attr("y", button.attr("y") - 1)
    .attr("width", buttonSize + 2)
    .attr("height", buttonSize + 2)
    .style("fill", "lightgrey");
}

function isSelected(buttonName) {
  return d3.select(`#${buttonName}--button`).select(".button-border").attr("selected") == "true";
}

function attachTooltipToButton(buttonName, text, x, y) {
  d3.select(`#${buttonName}--button`)
    .on("mouseover", (event, d) => {
      if (x) {
        drawTooltip(text, svg, event, x, y)
      } else {
        drawTooltip(text, svg, event)
      }
    })
    .on("mouseout", _ => clearTooltip());
}
