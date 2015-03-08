$(document).ready(function() {
    "use strict";

    String.prototype.squish = function() {
        return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, "").replace(/\s+/g, " ");
    };

    function loadPage(terms) {
        if (terms.length > 0) {
            var baseUrl = window.location.href.split("?")[0];
            var queryString = "?" + $.param({
                "terms": terms
            });
            location.assign(baseUrl + queryString);
        }
    }

    function addPageToHistory(terms) {
        var pageObj = {
            "html": window.location.href,
            "pageTitle": ""
        };
        var url = window.location.href.split("?")[0] + "?" + $.param({
            "terms": terms
        });
        window.history.pushState(pageObj, "", url);
    }

    function getSearchTerms() {
        // get the query string's value for the "terms" key
        var terms = (new QueryData()).terms.squish();
        if (terms === "") {
            terms = "obama, bush, clinton, the president";
            addPageToHistory(terms);
        }
        return terms;
    }

    function drawChart(data, term) {
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
        $("#chart-container").highcharts({
            chart: {
                type: "line"
            },
            title: {
                text: term
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

    function search(terms) {
        var data = [];
        var requests = [];
        var termsArr = terms.split(", ");

        $.each(termsArr, function(i, term) {
            requests.push(
                $.ajax({
                    url: "http://capitolwords.org/api/dates.json",
                    type: "GET",
                    dataType: "jsonp",
                    data: {
                        apikey: "f6ab5f2e4f69444b9f2c0a44d9a5223d",
                        phrase: term,
                        percentages: true,
                        granularity: "year"
                    },
                    success: function(r) {
                        data = data.concat({
                            "results": r.results,
                            "term": term
                        });
                    }
                })
            );
        });

        $.when.apply(undefined, requests).then(function(r) {
            drawChart(data);
        });
    }

    $(":input[name=terms]").keyup(function(e) {
        // "ENTER" key
        if (e.keyCode === 13) {
            console.log("hello");
            loadPage($(":input[name=terms]").val().squish());
        }
    });

    $("#enter").click(function(e) {
        e.preventDefault();
        loadPage($(":input[name=terms]").val().squish());
    });

    ///////////////////////////////////////////////////////////////////////////
    // MAIN
    ///////////////////////////////////////////////////////////////////////////

    // get the search term from the query string
    var searchTerms = getSearchTerms();

    // set the input field's value and placeholder
    $(":input[name=terms]").val(searchTerms);

    // perform the search
    search(searchTerms);
});
