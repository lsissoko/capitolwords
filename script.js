var main = function() {
  // global vars
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

    var hello = function(data) {
      console.log(lineData);
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


  function chart(lineData, phrase) {
    // missing points
    for (var k=MIN_YEAR; k<=MAX_YEAR; k++) {
      var found = false;
      for(var j = 0; j < lineData.length; j++) {
        if (lineData[j]["x"] === k) {
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(k + " not found");
        lineData.push({ x: k, y: 0});
      }
    }

    lineData.sort(function(a, b) {
      return a["x"] - b["x"];
    });

    var _labels = [];
    var _data = [];
    $.each(lineData, function(i, item) {
      _labels.push(item["x"]);
      _data.push(item["y"]);
    });

    $("#chart-container").highcharts({
      chart: {
        type: "line"
      },
      title: {
        text: phrase
      },
      xAxis: {
        categories: _labels
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
        data: _data
      }],
      credits: {
        enabled: false
      }
    });
  }

  // show results for "congress"
  $("#enter").click();
};

$(document).ready(main);
