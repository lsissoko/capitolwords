var main = function() {
  var MIN_YEAR = 1996;
  var MAX_YEAR = new Date().getFullYear();

  // adding trim() to String objects
  if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
      return String(this).replace(/^\s+|\s+$/g, '');
    };
  }

  function search(_phrase, year) {
    return $.ajax(
      "http://capitolwords.org/api/text.json", {
        type: "GET",
        dataType: "jsonp",
        data: {
          apikey: "f6ab5f2e4f69444b9f2c0a44d9a5223d",
          phrase: _phrase,
          start_date: "" + year + "-01-01",
          end_date: "" + year + "-12-31",
          sort: "date asc"
        }
      }
    );
  }


  $(":input[name=phrase]").keyup(function(e){
    if(e.keyCode === 13) {
      $("#enter").click();
    }
  });


  $("#enter").click(function(e) {
    e.preventDefault();

    var phrase = $(":input[name=phrase]").val();
    if (phrase.trim().length === 0) {
      return;
    }

    var lineData = [];

    var process = function(data) {
      lineData.push({
        x: parseInt(data.results[0].date.substring(0,4)),
        y: data.num_found
      });
    };

    var processMax = function(data) {
      lineData.push({
        x: parseInt(data.results[0].date.substring(0,4)),
        y: data.num_found
      });
      
      chart(lineData, phrase);
    };
    
    for (var i=MIN_YEAR; i<=MAX_YEAR; i++) {
      if (i === MAX_YEAR) {
        search(phrase, i).done(processMax);
      } else {
        search(phrase, i).done(process);
      }
    }
  });


  var chartOptions = {
    canvasBorders : true,
    canvasBordersWidth : 1,
    canvasBordersColor : "black",
    legend : true,
    inGraphDataShow : true,
    graphTitleFontSize: 18,
    graphMin : 0,
    yAxisMinimumInterval : 5,
    xAxisLabel : "Year",
    yAxisLabel : "Mentions"
  }


  function emptyChart() {
    var ctx = $("#myChart").get(0).getContext("2d");

    var _labels = [];
    for (var i=MIN_YEAR; i<=MAX_YEAR; i++) {
      _labels.push(i);
    }

    var data = {
      labels : _labels,
      datasets : [
        {
          fillColor : "#fff",
          strokeColor : "#fff",
          pointColor : "#fff",
          pointStrokeColor : "#fff",
          data : [{x: 0, y: 0}]
        }
      ]
    };

    new Chart(ctx).Line(data, chartOptions);
  }


  function chart(lineData, phrase) {
    var ctx = $("#myChart").get(0).getContext("2d");
    
    lineData.sort(function(a, b) {
      return a.x - b.x;
    });

    var _labels = [];
    var _data = [];
    $.each(lineData, function(i, item) {
      _labels.push(item.x);
      _data.push(item.y);
    });

    var data = {
      labels: _labels,
      datasets: [
        {
          fillColor : "rgba(151,187,205,0.5)",
          strokeColor : "rgba(151,187,205,1)",
          pointColor : "rgba(151,187,205,1)",
          pointStrokeColor : "#fff",
          data: _data
        }
      ]
    };

    chartOptions["graphTitle"] = phrase;
    new Chart(ctx).Line(data, chartOptions);
  }

  // init empty chart
  emptyChart();
};

$(document).ready(main);
