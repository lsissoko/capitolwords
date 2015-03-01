$(document).ready(function() {
    "use strict";

    function getSearchTerm() {
        var term = (new QueryData()).term;
        if (term === undefined) {
            term = "congress";
            var page_obj = {"html": window.location.href, "pageTitle": ""};
            var url = window.location.href.split("?")[0] + "?term=congress";
            window.history.pushState(page_obj, "", url);
        }
        return term;
    }

    function chart(data, term) {
        var lineData = [];
        var xData = [];
        var yData = [];

        // get the year and count data
        $.each(data, function(i, item) {
            lineData.push({
                x: item.year,
                y: item.count
            });
        });

        // deal with any missing data points
        var MIN_YEAR = 1996;
        var MAX_YEAR = new Date().getFullYear();
        for (var k = MIN_YEAR; k <= MAX_YEAR; k++) {
            var found = false;
            for (var j = 0; j < lineData.length; j++) {
                if (lineData[j].x === ("" + k)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                lineData.push({
                    x: k,
                    y: 0
                });
            }
        }

        // sort the data by year
        lineData.sort(function(a, b) {
            return a.x - b.x;
        });

        // put the year and count data into separate arrays
        $.each(lineData, function(i, item) {
            xData.push(item.x);
            yData.push(item.y);
        });

        // draw the chart
        $("#chart-container").highcharts({
            chart: {
                type: "line"
            },
            title: {
                text: term
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
                name: term,
                data: yData
            }],
            credits: {
                enabled: false
            }
        });
    }

    function loadPage(term) {
        if (term.length > 0) {
            var baseUrl = window.location.href.split("?")[0];
            var queryString = "?" + $.param({"term": term});
            location.assign(baseUrl + queryString);
        }
    }

    function search(term) {
        $.ajax(
            "http://capitolwords.org/api/dates.json", {
                type: "GET",
                dataType: "jsonp",
                data: {
                    apikey: "f6ab5f2e4f69444b9f2c0a44d9a5223d",
                    phrase: term,
                    percentages: true,
                    granularity: "year"
                }
            }
        ).done(function(data) {
            chart(data.results, term);
        });
    }

    $(":input[name=term]").keyup(function(e) {
        // "ENTER" key
        if (e.keyCode === 13) {
            console.log("hello");
            loadPage($.trim($(":input[name=term]").val()));
        }
    });

    $("#enter").click(function(e) {
        e.preventDefault();
        loadPage($.trim($(":input[name=term]").val()));
    });

    ///////////////////////////////////////////////////////////////////////////
    // MAIN
    ///////////////////////////////////////////////////////////////////////////
    
    // get the search term from the query string
    var searchTerm = getSearchTerm();
    
    // set the input field's value and placeholder
    $(":input[name=term]")
        .val(searchTerm)
        .attr("placeholder", "Enter a word or phrase");
    
    // perform the search
    search(searchTerm);
});