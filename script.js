"use strict";

$(document).ready(function() {
  // adding trim() to String objects
  if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
      return String(this).replace(/^\s+|\s+$/g, "");
    };
  }

  $(":input[name=phrase]").keyup(function(e) {
    if(e.keyCode === 13) {
      $("#enter").click();
    }
  });

  $("#enter").click(function(e) {
    e.preventDefault();

    var _phrase = $(":input[name=phrase]").val();
    if (_phrase.trim().length === 0) {
      return;
    }

    $.ajax(
      "http://capitolwords.org/api/dates.json", {
        type: "GET",
        dataType: "jsonp",
        data: {
          apikey: "f6ab5f2e4f69444b9f2c0a44d9a5223d",
          phrase: _phrase,
          percentages: true,
          granularity: "year"
        }
      }
    ).done(function(data) {
      chart(data, _phrase);
    });
  });

  function chart(data, phrase) {
    var lineData = [];
    var xData = [];
    var yData = [];

    $.each(data.results, function(i, item) {
      lineData.push({
        x: item.year,
        y: item.count
      });
    });

    $.each(lineData, function(i, item) {
      xData.push(item.x);
      yData.push(item.y);
    });

    $("#chart-container").highcharts({
      chart: {
        type: "line"
      },
      title: {
        text: phrase
      },
      xAxis: {
        categories: xData
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
      series: [{
        name: phrase,
        data: yData
      }],
      credits: {
        enabled: false
      }
    });
  }

  // show results for "congress"
  $("#enter").click();
});
