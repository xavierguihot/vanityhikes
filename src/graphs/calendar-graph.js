
function drawCalendarGraph(graphContainer, graphHolder, selectedGraph, graphWidth) {

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

  d3.select("svg").attr("height", graphContainer.node().getBoundingClientRect().height + 120);
}
