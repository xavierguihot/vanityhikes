
function drawGraphs(svg, width, height) {

  var margin = { top: 50, right: 70, bottom: 50, left: 60 };
  var graphWidth = width - margin.left - margin.right;
  var graphHeight = height - margin.top - margin.bottom;

  var selectableGraphs = [
    {
      name: "Rolling cumulated distance over previous 365 days",
      type: "classic timeseries",
      dimension: day => day.distance.last365DaysDistance,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km (${(d/365).toFixed(1)}km/day)`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
    },
    {
      name: "Rolling cumulated distance over previous 30 days",
      type: "classic timeseries",
      dimension: day => day.distance.last30DaysDistance,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km (${(d/30).toFixed(1)}km/day)`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
    },
    {
      name: "Rolling cumulated distance over previous 7 days",
      type: "classic timeseries",
      dimension: day => day.distance.last7DaysDistance ? day.distance.last7DaysDistance : 0,
      yAxisLabelFormat: d => `${parseFloat(d.toFixed(1)).toLocaleString("fr-FR").replaceAll(".", " ")} km (${(d/7).toFixed(1)}km/day)`,
      shortYAxisLabelFormat: d => `${parseFloat(d.toFixed(1)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
    },
    {
      name: "Total cumulated distance",
      type: "classic timeseries",
      dimension: day => day.distance.totalCumulatedDistance,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
    },
    {
      name: "Distance since start of year",
      type: "year to date timeseries",
      dimension: day => day.distance.yearToDateCumulatedDistance,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
    },
    {
      name: "Distance per day (calendar)",
      type: "calendar",
      dimension: day => day.distance.distance ? day.distance.distance : 0,
      yAxisLabelFormat: d => `${parseFloat(d.toFixed(1))} km`,
      shortYAxisLabelFormat: d => `${parseFloat(d.toFixed(1))} km`
    },
    {
      name: "Distance per day (bar chart)",
      type: "bar chart",
      dimension: day => day.distance.distance ? day.distance.distance : 0,
      yAxisLabelFormat: d => `${parseFloat(d.toFixed(1))} km`,
      shortYAxisLabelFormat: d => `${parseFloat(d.toFixed(1))} km`
    },
    {
      name: "Rolling cumulated positive elevation over previous 365 days",
      type: "classic timeseries",
      dimension: day => day.elevation.last365DaysElevation,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters (${(d/365).toFixed(0)} meters/day)`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Rolling cumulated positive elevation over previous 30 days",
      type: "classic timeseries",
      dimension: day => day.elevation.last30DaysElevation,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters (${(d/30).toFixed(0)} meters/day)`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Rolling cumulated positive elevation over previous 7 days",
      type: "classic timeseries",
      dimension: day => day.elevation.last7DaysElevation ? day.elevation.last7DaysElevation : 0,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters (${(d/7).toFixed(0)} meters/day)`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Total cumulated positive elevation",
      type: "classic timeseries",
      dimension: day => day.elevation.totalCumulatedElevation,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Elevation since start of year",
      type: "year to date timeseries",
      dimension: day => day.elevation.yearToDateCumulatedElevation,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Positive elevation per day (calendar)",
      type: "calendar",
      dimension: day => day.elevation.elevation ? day.elevation.elevation : 0,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Positive elevation per day (bar chart)",
      type: "bar chart",
      dimension: day => day.elevation.elevation ? day.elevation.elevation : 0,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} m`
    },
    {
      name: "Hikes elevations vs distances vs speeds",
      type: "bubble chart",
      xAxisDimension: hike => hike.distance,
      yAxisDimension: hike => hike.positiveElevation,
      bubbleSizeDimension: hike => hike.distance / ((hike.durationInSeconds - hike.idleTimeIntSeconds) / 3600),
      bubbleColorDimension: hike => hike.positiveElevation / ((hike.durationInSeconds - hike.idleTimeIntSeconds) / 3600),
      xAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      bubbleSizeLabelFormat: d => `${parseFloat(d.toFixed(2))} km/h`,
      bubbleColorLabelFormat: d => `${parseInt(d.toFixed(0))} m/h`,
      tooltip: (date, xLabel, yLabel, sizeLabel, colorLabel) => `${date} - ${xLabel} (${sizeLabel}) - ${yLabel} (${colorLabel})`,
      xAxisLegendName: "Distance",
      yAxisLegendName: "Positive Elevation",
      bubbleSizeLegendName: "Speed",
      legendSizes: [3, 6, 10],
      bubbleColorLegendName: "Positive Elevation Speed"
    },
    {
      name: "Hikes elevations vs distances vs dates",
      type: "bubble chart",
      xAxisDimension: hike => hike.distance,
      yAxisDimension: hike => hike.positiveElevation,
      bubbleSizeDimension: hike => hike.distance / ((hike.durationInSeconds - hike.idleTimeIntSeconds) / 3600),
      bubbleColorDimension: hike => new Date(hike.date).getTime() / 1000000,
      xAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`,
      yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      bubbleSizeLabelFormat: d => `${parseFloat(d.toFixed(2))} km/h`,
      bubbleColorLabelFormat: d => getFormattedDate(new Date(d * 1000000)),
      tooltip: (date, xLabel, yLabel, sizeLabel, colorLabel) => `${date} - ${xLabel} (${sizeLabel}) - ${yLabel}`,
      xAxisLegendName: "Distance",
      yAxisLegendName: "Positive Elevation",
      bubbleSizeLegendName: "Speed",
      legendSizes: [3, 6, 10],
      bubbleColorLegendName: "Date"
    },
    {
      name: "Hikes speeds vs distances vs elevations",
      type: "bubble chart",
      xAxisDimension: hike => hike.distance,
      yAxisDimension: hike => hike.distance / ((hike.durationInSeconds - hike.idleTimeIntSeconds) / 3600),
      bubbleSizeDimension: hike => hike.positiveElevation,
      bubbleColorDimension: hike => hike.positiveElevation / ((hike.durationInSeconds - hike.idleTimeIntSeconds) / 3600),
      xAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`,
      yAxisLabelFormat: d => `${parseFloat(d.toFixed(2))} km/h`,
      bubbleSizeLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      bubbleColorLabelFormat: d => `${parseInt(d.toFixed(0))} m/h`,
      tooltip: (date, xLabel, yLabel, sizeLabel, colorLabel) => `${date} - ${xLabel} (${yLabel}) - ${sizeLabel} (${colorLabel})`,
      xAxisLegendName: "Distance",
      yAxisLegendName: "Speed",
      bubbleSizeLegendName: "Positive Elevation",
      legendSizes: [100, 1000, 3000],
      bubbleColorLegendName: "Positive Elevation Speed"
    },
    {
      name: "Max altitude per day",
      type: "classic timeseries",
      dimension: day => day.maxAltitude ? day.maxAltitude : 0,
      yAxisLabelFormat: d => `${d.toLocaleString("fr-FR").replaceAll(".", " ")} meters`,
      shortYAxisLabelFormat: d => `${d.toLocaleString("fr-FR").replaceAll(".", " ")} meters`
    },
    {
      name: "Max heartbeats per day",
      type: "classic timeseries",
      dimension: day => day.maxHeartBeat ? day.maxHeartBeat : 0,
      yAxisLabelFormat: d => `${d} heartbeats`,
      shortYAxisLabelFormat: d => `${d} heartbeats`
    },
  ];
  var selectedGraph = selectableGraphs[0];

  var colors = ["#008EFC", "fuchsia", "chocolate", "maroon", "gold"];

  var graphContainer =
    svg
      .append("g")
      .attr("class", "graphs-container")
      .attr("width", graphWidth + margin.left + margin.right)
      .attr("height", graphHeight + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  drawGraphTitle();
  drawGraph();

  function drawGraph() {

    graphContainer.select("g.graph-holder").remove();
    var graphHolder = graphContainer.append("g").attr("class", "graph-holder");

    if (selectedGraph.type == "calendar") {
      drawCalendarGraph(graphHolder);
    } else if (selectedGraph.type == "bubble chart") {
      drawBubbleChart(graphHolder);
    } else {
      drawTimeseriesGraph(graphHolder);
    }
  }

  function drawTimeseriesGraph(graphHolder) {

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
          closestDataPoints = data.timeline.filter(d => d.date.substring(5, 10) == dateUnderMouse.toISOString().substring(5, 10));
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

  function drawCalendarGraph(graphHolder) {

    graphHolder.attr("transform", "translate(0,30)");

    var leftOfDaysMargin = 75;
    var cellSize = (graphWidth - leftOfDaysMargin) / 55 - 1;
    var yearHeight = cellSize * 7;
    var marginBetweenYears = 70;

    var timeWeek = d3.utcMonday;
    var countDay = i => (i + 6) % 7;
    var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var maxValue = d3.max(data.timeline, selectedGraph.dimension);
    var color = d3.scaleLinear().range(["#e8eaed", "#008EFC", "black"]).domain([0, 2 * maxValue / 3, maxValue]);

    var years = d3.groups(data.timeline, d => d.date.slice(0, 4));

    var yearsContainer =
      graphHolder
        .selectAll("g")
        .data(years)
        .join("g")
        .attr("transform", (_, i) => `translate(${leftOfDaysMargin},${(yearHeight + marginBetweenYears) * i + cellSize * 1.5})`);

    yearsContainer
      .append("text")
      .attr("x", -45)
      .attr("y", yearHeight / 2)
      .style("font-weight", "bold")
      .style("text-anchor", "end")
      .style("fill", "rgb(60,64,67)")
      .style("font-size", 14)
      .style("font-family", "sans-serif")
      .text(([key]) => key);

    yearsContainer
      .append("g")
      .attr("text-anchor", "end")
      .selectAll()
      .data(d3.range(1, 8))
      .join("text")
      .attr("x", -5)
      .attr("y", i => (countDay(i) + 0.5) * cellSize)
      .style("fill", "rgb(60,64,67)")
      .style("font-size", 12)
      .style("font-family", "sans-serif")
      .text(i => days[i-1]);

    yearsContainer
      .append("g")
      .selectAll()
      .data(([, yearValues]) => yearValues)
      .join("rect")
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("x", d => timeWeek.count(d3.utcYear(new Date(d.date)), new Date(d.date)) * cellSize + 0.5)
      .attr("y", d => countDay(new Date(d.date).getUTCDay()) * cellSize + 0.5)
      .style("fill", d => color(selectedGraph.dimension(d)))
      .on("mouseover", (event, d) => {
        var text = `${selectedGraph.yAxisLabelFormat(selectedGraph.dimension(d))} - ${new Date(d.date).toDateString()}`;
        drawTooltip(text, svg, event);
      })
      .on("mouseout", _ => clearTooltip());

    // A function that draws a thin white line to the left of each month.
    function pathMonth(t) {
      var d = Math.max(0, countDay(t.getUTCDay()));
      var w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
          : d === 7 ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${7 * cellSize}`;
    }

    var monthsContainer =
      yearsContainer
        .append("g")
        .selectAll()
        .data(([, values]) => d3.utcMonths(d3.utcMonth(new Date(values.at(-1).date)), new Date(values[0].date)))
        .join("g");

    monthsContainer
      .filter((d, i) => i)
      .append("path")
      .style("fill", "none")
      .style("stroke", "darkgrey")
      .style("stroke-width", 1.5)
      .attr("d", pathMonth);

    monthsContainer
      .append("text")
      .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
      .attr("y", -5)
      .style("fill", "rgb(60,64,67)")
      .style("font-size", 12)
      .style("font-family", "sans-serif")
      .text(d => months[d.getMonth()]);
  }

  function drawBubbleChart(graphHolder) {

    var leftMargin = 35;

    var xDimensionMaxValue = d3.max(data.hikes, selectedGraph.xAxisDimension);
    var yDimensionMaxValue = d3.max(data.hikes, selectedGraph.yAxisDimension);
    var bubbleSizeDimensionMinValue = d3.min(data.hikes, selectedGraph.bubbleSizeDimension);
    var bubbleSizeDimensionMaxValue = d3.max(data.hikes, selectedGraph.bubbleSizeDimension);
    var bubbleColorDimensionMinValue = d3.min(data.hikes, selectedGraph.bubbleColorDimension);
    var bubbleColorDimensionMaxValue = d3.max(data.hikes, selectedGraph.bubbleColorDimension);

    var x = d3.scaleLinear().range([leftMargin, graphWidth]).domain([0, xDimensionMaxValue + 0.05 * xDimensionMaxValue]);
    var y = d3.scaleLinear().range([graphHeight, 0]).domain([0, yDimensionMaxValue + 0.05 * yDimensionMaxValue]);
    var bubbleSize = d3.scaleSqrt().range([0.5, 30]).domain([bubbleSizeDimensionMinValue, bubbleSizeDimensionMaxValue]);
    var bubbleColor =
      d3.scaleLinear()
        .range(["#e8eaed", "#008EFC", "black"])
        .domain([bubbleColorDimensionMinValue, bubbleColorDimensionMinValue + 2 * (bubbleColorDimensionMaxValue - bubbleColorDimensionMinValue) / 3, bubbleColorDimensionMaxValue]);

    graphHolder
      .append("g")
      .attr("transform", `translate(${leftMargin},0)`)
      .call(d3.axisLeft(y).tickFormat(selectedGraph.yAxisLabelFormat).tickSize(3));
    graphHolder
      .append("g")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(x).tickFormat(selectedGraph.xAxisLabelFormat).tickSize(3));

    graphHolder
      .selectAll("bubble")
      .data(d3.reverse(d3.sort(data.hikes, selectedGraph.bubbleSizeDimension)))
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => x(selectedGraph.xAxisDimension(d)))
      .attr("cy", d => y(selectedGraph.yAxisDimension(d)))
      .attr("r", d => bubbleSize(selectedGraph.bubbleSizeDimension(d)))
      .style("fill", d => bubbleColor(selectedGraph.bubbleColorDimension(d)))
      .style("stroke", "lightgrey")
      .on("mouseover", (event, d) => {
        var xLabel = selectedGraph.xAxisLabelFormat(selectedGraph.xAxisDimension(d));
        var yLabel = selectedGraph.yAxisLabelFormat(selectedGraph.yAxisDimension(d));
        var sizeLabel = selectedGraph.bubbleSizeLabelFormat(selectedGraph.bubbleSizeDimension(d));
        var colorLabel = selectedGraph.bubbleColorLabelFormat(selectedGraph.bubbleColorDimension(d));
        var text = selectedGraph.tooltip(d.date, xLabel, yLabel, sizeLabel, colorLabel);
        drawTooltip(text, svg, event);
      })
      .on("mouseout", _ => clearTooltip());

    // Axes legend names:
    graphHolder
      .selectAll("axis-legend")
      .data([
        { text: selectedGraph.xAxisLegendName, x: graphWidth + 3, y: graphHeight, anchor: "start" },
        { text: selectedGraph.yAxisLegendName, x: leftMargin, y: 0 - 8, anchor: "middle" }
      ])
      .join("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text(d => d.text)
      .style("font-size", 12)
      .style("alignment-baseline", "middle")
      .style("font-family", "sans-serif")
      .style("fill", "#303030")
      .style("text-anchor", d => d.anchor);

    // The size scale legend:
    var sizeScaleLegendHolder =
      graphHolder
        .append("g")
        .attr("class", "size-scale")
        .attr("transform", `translate(${width - bubbleSize(bubbleSizeDimensionMaxValue) - 150},50)`);
    sizeScaleLegendHolder
      .selectAll("legend")
      .data(selectedGraph.legendSizes)
      .join("circle")
      .attr("cx", 0)
      .attr("cy", d => bubbleSize(bubbleSizeDimensionMaxValue) - bubbleSize(d))
      .attr("r", d => bubbleSize(d))
      .style("fill", "none")
      .style("stroke", "#303030");
    sizeScaleLegendHolder
      .selectAll("legend")
      .data(selectedGraph.legendSizes)
      .join("line")
      .attr("x1", d => bubbleSize(d))
      .attr("x2", d => 50)
      .attr("y1", d => bubbleSize(bubbleSizeDimensionMaxValue) - bubbleSize(d))
      .attr("y2", d => bubbleSize(bubbleSizeDimensionMaxValue) - bubbleSize(d))
      .style("stroke", "#303030")
      .style("stroke-dasharray", ("2,2"));
    sizeScaleLegendHolder
      .selectAll("legend")
      .data(selectedGraph.legendSizes)
      .join("text")
      .attr("x", 52)
      .attr("y", d => bubbleSize(bubbleSizeDimensionMaxValue) - bubbleSize(d))
      .text(selectedGraph.bubbleSizeLabelFormat)
      .style("font-size", 10)
      .style("text-anchor", "start")
      .style("font-family", "sans-serif")
      .style("fill", "#303030")
      .style("alignment-baseline", "middle");
    sizeScaleLegendHolder
      .append("text")
      .attr("x", 0)
      .attr("y", d => bubbleSize(bubbleSizeDimensionMaxValue) + 15)
      .attr("text-anchor", "middle")
      .style("font-size", 12)
      .style("font-family", "sans-serif")
      .style("fill", "#303030")
      .text(selectedGraph.bubbleSizeLegendName);

    // The color scale legend:
    var colorScaleLegendHolder =
      graphHolder
        .append("g")
        .attr("class", "color-scale")
        .attr("transform", `translate(${width - bubbleSize(bubbleSizeDimensionMaxValue) - 154},135)`);
    var linearGradient = graphHolder.append("linearGradient").attr("id", "linear-gradient");
    linearGradient.attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");
    linearGradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#e8eaed" },
        { offset: "66%", color: "#008EFC" },
        { offset: "100%", color: "black" },
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    var legendWidth = 8, legendHeight = 150;
    colorScaleLegendHolder
      .append("rect")
      .attr("class", "legendRect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)")
      .style("stroke", "#303030")
      .style("stroke-width", "1px");
    var yScale = d3.scaleLinear().range([0, legendHeight]).domain([bubbleColorDimensionMaxValue, bubbleColorDimensionMinValue]);
    colorScaleLegendHolder
      .append("g")
      .call(
        d3.axisRight(yScale)
          .tickFormat(selectedGraph.bubbleColorLabelFormat)
          .tickValues([
            bubbleColorDimensionMinValue,
            bubbleColorDimensionMinValue + 1 * (bubbleColorDimensionMaxValue - bubbleColorDimensionMinValue) / 3,
            bubbleColorDimensionMinValue + 2 * (bubbleColorDimensionMaxValue - bubbleColorDimensionMinValue) / 3,
            bubbleColorDimensionMaxValue
          ])
          .tickSize(3)
        )
      .call(g => g.selectAll(".tick line").style("stroke", "#303030"))
      .call(g => g.selectAll(".tick text").style("fill", "#303030"))
      .attr("class", "color-legend-axis")
      .attr("transform", `translate(${legendWidth},0)`);
    colorScaleLegendHolder
      .append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "middle")
      .style("font-size", 12)
      .style("font-family", "sans-serif")
      .style("fill", "#303030")
      .text(selectedGraph.bubbleColorLegendName);
  }

  function drawGraphTitle() {

    svg.select("g.graph-selector-container").remove();
    var graphTitleContainer = svg.append("g").attr("class", "graph-selector-container");

    var text =
      graphTitleContainer
        .append("text")
        .attr("class", "selected-graph-title-text")
        .attr("x", 10)
        .attr("y", 15)
        .style("dy", ".35em")
        .style("font-size", "15")
        .style("font-family", "sans-serif")
        .text(selectedGraph["name"]);

    var cog =
      graphTitleContainer
        .append("svg:image")
        .attr("id", "graphs-button")
        .attr("xlink:href", "img/cog.jpeg")
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", 2)
        .attr("y", 2);

    var clickArea =
      graphTitleContainer
        .append("rect")
        .attr("class", "select-graph-title-rect")
        .attr("height", 20)
        .style("fill", "transparent")
        .style("cursor", "pointer")
        .on("click", _ => drawGraphTitleSelector());

    var titleTextWidth = text.node().getBoundingClientRect().width;
    graphTitleContainer.attr("transform", `translate(${width / 2 - titleTextWidth / 2 - 10}, 30)`);
    clickArea.attr("width", titleTextWidth + 20 /* margins */ + 22 /* cog img */);
    cog.attr("x", titleTextWidth + 17);
  }

  function drawGraphTitleSelector() {

    function removeSelector() {
      d3.select("g.selector-click-exit-background").remove();
      d3.select("g.graph-title-selector-choices-container").remove();
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

    var graphTitleSelectorContainer =
      svg.append("g").attr("class", "graph-title-selector-choices-container");

    var selectorWhiteBackground =
      graphTitleSelectorContainer
        .append("rect")
        .style("fill", "white")
        .attr("x", -10)
        .attr("y", 35);

    var textChoices =
      graphTitleSelectorContainer
        .selectAll("g")
        .data(selectableGraphs)
        .enter()
        .append("text")
        .attr("class", "graph-title-choice-text")
        .text(graphChoice => graphChoice.name)
        .attr("y", (d, i) => 50 + i * 20)
        .style("dy", ".35em")
        .style("font-size", "15")
        .style("font-family", "sans-serif");

    var textChoicesClickAreas =
      graphTitleSelectorContainer
        .selectAll("g")
        .data(selectableGraphs)
        .enter()
        .append("rect")
        .attr("class", "graph-title-choice-click-area")
        .attr("height", 20)
        .attr("x", -10)
        .attr("y", (d, i) => 35 + i * 20)
        .style("fill", "transparent")
        .style("stroke", "black") // remove me
        .style("cursor", "pointer")
        .on("click", (_, d) => {
          removeSelector();
          selectedGraph = d;
          drawGraph();
          drawGraphTitle()
        });

    var selectedTitleWidth = d3.select(".selected-graph-title-text").node().getBoundingClientRect().width;
    graphTitleSelectorContainer.attr("transform", `translate(${width / 2 - selectedTitleWidth / 2}, 15)`)
    var textChoicesSize = d3.select(".graph-title-selector-choices-container").node().getBoundingClientRect();
    textChoicesClickAreas.attr("width", textChoicesSize.width + 20);
    selectorWhiteBackground.attr("width", textChoicesSize.width + 20).attr("height", textChoicesSize.height);
  }
}

function getFormattedDate(date) {

  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : "0" + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : "0" + day;

  return year + "-" + month + "-" + day;
}

function cleanGraphPage(svg) {
  svg.select("g.graph-selector-container").remove();
  svg.select(".graphs-container").remove();
}
