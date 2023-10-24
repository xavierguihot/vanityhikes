
var bannerHeight = 28;

function drawBanner(text, svg) {

  var previousNumberOfDisplayedBanners = svg.selectAll("g.banner").nodes().length;
  var newNumberOfDisplayedBanners = previousNumberOfDisplayedBanners + 1;

  setSvgContainerSize(newNumberOfDisplayedBanners);

  var banner =
    svg
      .append("g")
      .attr("class", "banner")
      .attr("transform", `translate(0, ${previousNumberOfDisplayedBanners * bannerHeight})`);

  banner
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", window.innerWidth)
    .attr("height", bannerHeight)
    .style("fill", "yellow")
    .style("stroke", "#008EFC");

  banner
    .append("text")
    .text(text)
    .attr("x", window.innerWidth / 2)
    .attr("y", 20)
    .style("fill", "rgb(60,64,67)")
    .style("font-size", 14)
    .style("font-weight", 500)
    .style("font-family", "Roboto,Arial,sans-serif")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .style("user-select", "none");

  banner
    .append("svg:image")
    .attr("x", window.innerWidth - 30)
    .attr("y", 5)
    .attr("width", 20)
    .attr("height", 20)
    .style("cursor", "pointer")
    .attr("xlink:href", "img/close.png")
    .on("click", _ => {
      // Remove the banner:
      banner.remove();
      // Move other banners (if any) closer to the top of the page to fill the gap:
      svg
        .selectAll("g.banner")
        .nodes()
        .forEach((d, i) => {
          d3.select(d).attr("transform", `translate(0, ${i * bannerHeight})`);
        });
      // Decrease height of the svg container:
      setSvgContainerSize(svg.selectAll("g.banner").nodes().length);
    });
}

function setSvgContainerSize(numberOfBanners) {
  d3.select("svg.banners")
    .style("height", numberOfBanners * bannerHeight)
    .style("width", numberOfBanners == 0 ? 0: window.innerWidth);
}
