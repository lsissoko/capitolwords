function drawChart(data, containerId) {
  var years = [];
  var seriesData = [];
  var MIN_YEAR = 1996;
  var MAX_YEAR = new Date().getFullYear();

  var y = MIN_YEAR;
  while (y <= MAX_YEAR) {
    years.push(y++);
  }

  $.each(data, function(i, termData) {
    var curData = [];
    var counts = [];

    // get the current term's year and count data
    $.each(termData.results, function(j, item) {
      curData.push({
        x: item.year,
        y: item.count
      });
    });

    // fill missing data (count = 0 for that year)
    for (var year = MIN_YEAR; year <= MAX_YEAR; year++) {
      var found = false;
      for (var j = 0, l = curData.length; j < l; j++) {
        if (curData[j].x === ("" + year)) {
          found = true;
          break;
        }
      }
      if (!found) {
        curData.push({
          x: year,
          y: 0
        });
      }
    }

    // sort the data by year
    curData.sort(function(a, b) {
      return a.x - b.x;
    });

    // put the count data in its own array
    $.each(curData, function(j, item) {
      counts.push(item.y);
    });

    // add new series object
    seriesData.push({
      name: termData.term,
      data: counts
    });
  });

  // draw the chart
  $(containerId).highcharts({
    chart: {
      type: "line"
    },
    title: {
      text: ""
    },
    xAxis: {
      categories: years
    },
    yAxis: {
      title: {
        text: "Number of Mentions"
      },
      floor: 0
    },
    plotOptions: {
      line: {
        enableMouseTracking: true
      }
    },
    series: seriesData,
    credits: {
      enabled: false
    }
  });
}
