
var selectableGraphs = [
  {
    name: "Rolling cumulated distance over previous 365 days",
    type: "classic timeseries",
    dimension: day => day.distance.last365DaysDistance,
    yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km (${(d/365).toFixed(1)} km/day - ${(d/12).toFixed(0)} km/month)`,
    shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
  },
  {
    name: "Rolling cumulated distance over previous 30 days",
    type: "classic timeseries",
    dimension: day => day.distance.last30DaysDistance,
    yAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km (${(d/30).toFixed(1)} km/day)`,
    shortYAxisLabelFormat: d => `${parseInt(d.toFixed(0)).toLocaleString("fr-FR").replaceAll(".", " ")} km`
  },
  {
    name: "Rolling cumulated distance over previous 7 days",
    type: "classic timeseries",
    dimension: day => day.distance.last7DaysDistance ? day.distance.last7DaysDistance : 0,
    yAxisLabelFormat: d => `${parseFloat(d.toFixed(1)).toLocaleString("fr-FR").replaceAll(".", " ")} km (${(d/7).toFixed(1)} km/day)`,
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

function getFormattedDate(date) {

  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : "0" + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : "0" + day;

  return year + "-" + month + "-" + day;
}
