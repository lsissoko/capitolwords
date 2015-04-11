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

  function getQueryString() {
    var qd = new QueryData();
    return (qd.terms !== undefined) ? qd.terms.squish() : "";
  }

  function getSearchTerms() {
    var terms = getQueryString();
    if (terms === "") {
      terms = "obama, bush, clinton, the president";
      loadPage(terms);
    }
    return terms;
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
      drawChart(data, "#chart-container");
    });
  }

  $(":input[name=terms]").keyup(function(e) {
    // "ENTER" key
    if (e.keyCode === 13) {
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
