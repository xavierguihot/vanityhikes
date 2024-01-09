
function drawBubbleChart(graphHolder, selectedGraph, graphWidth, graphHeight) {

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
