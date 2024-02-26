
function drawTimeseriesGraph(selectedGraph, graphContainer, graphHolder, graphWidth, graphHeight, margin) {

  var colors = ["#008EFC", "fuchsia", "chocolate", "#45e6f5", "#28f711", "gold"];

  var maxValue = d3.max(data.timeline, selectedGraph.dimension);
  var currentValue = selectedGraph.dimension(data.timeline[0]);

  var x;
  if (selectedGraph.type == "classic timeseries" || selectedGraph.type == "bar chart")
    x = d3.scaleTime().range([0, graphWidth]).domain(d3.extent(data.timeline, d => d3.timeParse("%Y-%m-%d")(d.date)));
  if (selectedGraph.type == "year to date timeseries")
    x = d3.scaleTime().range([0, graphWidth]).domain([d3.timeParse("%Y-%m-%d")("2020-01-01"), d3.timeParse("%Y-%m-%d")("2020-12-31")]);

  var y = d3.scaleLinear().range([graphHeight, 0]).domain([0, maxValue + 0.05 * maxValue]);

  var mouseListenerContainer = graphContainer.append("g").attr("class", "tooltip-mouse-listener");

  var line;
  var linesData;
  if (selectedGraph.type == "classic timeseries") {
    line =
      d3.line()
        .x(d => x(d3.timeParse("%Y-%m-%d")(d.date)))
        .y(d => y(selectedGraph.dimension(d)));
    linesData = [data.timeline];
  }
  if (selectedGraph.type == "year to date timeseries") {
    line =
      d3.line()
        .x(d => x(d3.timeParse("%Y-%m-%d")(`2020-${d.date.split("-").slice(1).join("-")}`)))
        .y(d => y(selectedGraph.dimension(d)));
    linesData = d3.groups(data.timeline, d => d.date.split("-")[0]).sort().map(d => d[1]);
  }
  if (selectedGraph.type == "bar chart") {
    linesData = [data.timeline];
  }

  if (selectedGraph.type == "classic timeseries" || selectedGraph.type == "year to date timeseries") {
    linesData.forEach((lineData, i) =>
      graphHolder
        .append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", colors[i])
        .attr("stroke-width", 1.5)
        .attr("d", line)
    )
  }
  if (selectedGraph.type == "bar chart") {
    var discreteX = d3.scaleBand().range([0, graphWidth]).domain(d3.map(data.timeline, d => d.date).sort()).padding(0.2);
    graphHolder
      .selectAll("graph-bar")
      .data(data.timeline)
      .enter()
      .append("rect")
      .attr("id", d => `bar-${d.date}`)
      .attr("class", "graph-bar")
      .attr("x", d => discreteX(d.date))
      .attr("y", d => y(selectedGraph.dimension(d)))
      .attr("width", discreteX.bandwidth())
      .attr("height", d => graphHeight - y(selectedGraph.dimension(d)))
      .attr("fill", "steelblue");
  }

  // x axis:
  graphHolder
    .append("g")
    .attr("transform", "translate(0," + graphHeight + ")")
    .call(d3.axisBottom(x))
    .call(g => selectedGraph.type == "year to date timeseries" ? g.select("text").text("January") : g);
  graphHolder
    .append("g")
    .attr("transform", "translate(0," + graphHeight + ")")
    .call(d3.axisBottom(x).tickSize(-graphHeight).tickFormat(_ => "").ticks(d3.timeYear.every(1)))
    .style("stroke-opacity", 0)
    .call(g =>
      g.selectAll(".tick line")
        .filter(d => d.getUTCMonth() == 11 && d.getUTCDate() == 31)
        .style("stroke-opacity", 0.1)
        .style("stroke-dasharray", "2,2")
    )

  // y axis:
  graphHolder.append("g").call(d3.axisLeft(y).tickFormat("").tickSize(3));
  graphHolder
    .append("g")
    .call(d3.axisLeft(y).tickSize(-graphWidth).tickFormat(selectedGraph.yAxisLabelFormat))
    .style("stroke-opacity", 0)
    .call(g =>
      g.selectAll(".tick:not(:first-of-type) line")
        .style("stroke-opacity", 0.5)
        .style("stroke-dasharray", "2,2")
    )
    .call(g => g.selectAll(".tick text").attr("x", 7).attr("y", -8).style("text-anchor", "start"));

  // horizontal line representing the max:
  graphHolder
    .append("line")
    .attr("x1", 0)
    .attr("y1", y(maxValue))
    .attr("x2", graphWidth)
    .attr("y2", y(maxValue))
    .style("stroke", "green")
    .style("stroke-opacity", 1)
    .style("stroke-dasharray", "2,2");
  graphHolder
    .append("text")
    .attr("x", graphWidth - 3)
    .attr("y", y(maxValue) - 5)
    .style("text-anchor", "end")
    .style("fill", "green")
    .style("font-size", 10)
    .style("font-family", "sans-serif")
    .text(selectedGraph.yAxisLabelFormat(maxValue));

  // current value:
  if (currentValue != 0 && selectedGraph.shortYAxisLabelFormat(currentValue) != selectedGraph.shortYAxisLabelFormat(maxValue)) {

    // The text:
    graphHolder
      .append("text")
      .attr("x", graphWidth + 3)
      .attr("y", y(currentValue) + 3)
      .style("text-anchor", "start")
      .style("fill", selectedGraph.type == "classic timeseries" ? "grey" : colors[linesData.length - 1])
      .style("font-size", 10)
      .style("font-family", "sans-serif")
      .text(selectedGraph.shortYAxisLabelFormat(currentValue));

    if (selectedGraph.type == "year to date timeseries") {
      // An horizontal line between the text and the end of the line (today):
      var currentDate = d3.timeParse("%Y-%m-%d")(`2020-${linesData[linesData.length - 1][0].date.split("-").slice(1).join("-")}`);
      graphHolder
        .append("line")
        .attr("x1", x(currentDate) + 30)
        .attr("y1", y(currentValue))
        .attr("x2", graphWidth)
        .attr("y2", y(currentValue))
        .style("stroke", colors[linesData.length - 1])
        .style("stroke-opacity", 1)
        .style("stroke-dasharray", "2,2");
    }
  }

  // An vertical line between the x-axis and the end of the line (today):
  if (selectedGraph.type == "year to date timeseries") {
    var currentDate = d3.timeParse("%Y-%m-%d")(`2020-${linesData[linesData.length - 1][0].date.split("-").slice(1).join("-")}`);
    graphHolder
      .append("line")
      .attr("x1", x(currentDate))
      .attr("y1", y(currentValue) + 4)
      .attr("x2", x(currentDate))
      .attr("y2", y(0))
      .style("stroke", colors[linesData.length - 1])
      .style("stroke-opacity", 1)
      .style("stroke-dasharray", "2,2");
  }

  // Year label when one line per year:
  if (selectedGraph.type == "year to date timeseries") {
    linesData.forEach((lineData, i) => {
      graphHolder
        .append("text")
        .attr("x", x(d3.timeParse("%Y-%m-%d")(`2020-${lineData[0].date.split("-").slice(1).join("-")}`)) + 3)
        .attr("y", y(selectedGraph.dimension(lineData[0])) + 3)
        .style("text-anchor", "start")
        .style("fill", colors[i])
        .style("font-size", 10)
        .style("font-family", "sans-serif")
        .text(lineData[0].date.split("-")[0])
    })
  }

  // Tooltip on mouse move:
  var years = [...new Set(data.timeline.map(d => d.date.split("-")[0]))].sort();
  mouseListenerContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("opacity", 0)
    .on("mousemove", event => {

      var dateUnderMouse = x.invert(event.offsetX - margin.left);

      var closestDataPoints = [];
      if (selectedGraph.type == "year to date timeseries") {
        closestDataPoints =
          d3.sort(
            data.timeline.filter(d => d.date.substring(5, 10) == dateUnderMouse.toISOString().substring(5, 10)),
            d => d.date
          )
      } else {
        closestDataPoints = [data.timeline.find(d => d.date == dateUnderMouse.toISOString().substring(0, 10))];
      }

      clearTooltip();
      svg.selectAll("circle.mouseover-circle").remove();

      closestDataPoints.forEach(closestDataPoint => {
        var value = selectedGraph.dimension(closestDataPoint);
        var text = `${closestDataPoint.date}: ${selectedGraph.shortYAxisLabelFormat(value)}`;
        var xPosition = 0;
        if (selectedGraph.type == "year to date timeseries") {
          xPosition = x(d3.timeParse("%Y-%m-%d")(`2020-${closestDataPoint.date.substring(5, 10)}`));
        } else {
          xPosition = x(d3.timeParse("%Y-%m-%d")(closestDataPoint.date));
        }
        var yPosition = y(value);
        // The tooltip with the value:
        drawTooltipAtPosition(text, graphHolder, xPosition, yPosition - 20);
        // The circle on the line:
        graphHolder
          .append("circle")
          .attr("class", "mouseover-circle")
          .attr("cx", xPosition)
          .attr("cy", yPosition)
          .attr("r", "3px")
          .style("fill", _ => {
            if (selectedGraph.type == "year to date timeseries") {
              return colors[years.indexOf(closestDataPoint.date.split("-")[0])];
            } else {
              return colors[0];
            }
          });
      })
    })
    .on("mouseout", _ => {
      clearTooltip();
      svg.selectAll("circle.mouseover-circle").remove();
    });
}
