/*globals angular, alert, App */
angular.module('myApp').controller('positionCtrl', function($scope, $http) {

    'use strict';

    $scope.init = function() {
      $scope.x = 50;
      $scope.y = 50;

        $scope.pauser = new Rx.Subject();
        var counter = Rx.Observable.interval(100)
          .pausable($scope.pauser)
          .flatMap(function (i) {
            return Rx.Observable.fromPromise($http.get('position.json', {params: {x: $scope.x, y: $scope.y}}))
          })


        counter.subscribe(function(response) {
            $scope.x = response.data.x;
            $scope.y = response.data.y;

            updatesOverTime.push({
                    x: new Date(),
                    y: response.data.x,
                    z: response.data.y
                });

            if (updatesOverTime.length > 20)  {
                updatesOverTime.shift();
            }
            update(updatesOverTime);

            $scope.$apply();
        })

          $scope.pauser.onNext(true);
    };

    $scope.start = function () {
      $scope.pauser.onNext(true);
    }

    $scope.stop = function () {
      $scope.pauser.onNext(false);
    }

      var updatesOverTime = [];

        var width = 960,
            height = 600,
            margins = {
                top: 20,
                bottom: 50,
                left: 70,
                right: 20
            };

        var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height + 200);

        var xRange = d3.time.scale().range([margins.left, width - margins.right])
            .domain([new Date(), new Date()]);
        var yRange = d3.scale.linear().range([height - margins.bottom, margins.top])
            .domain([0, 100]);
        var xAxis = d3.svg.axis()
            .scale(xRange)
            .tickSize(5)
            .tickSubdivide(true)
            .tickFormat(d3.time.format("%X"));

        var yAxis = d3.svg.axis()
            .scale(yRange)
            .tickSize(5)
            .orient("left")
            .tickSubdivide(true);

        var xAxisElement = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margins.bottom) + ")")
            .call(xAxis);

            // Add a label to the middle of the x axis
        var xAxisWidth = ((width - margins.right) - margins.left) / 2;
        xAxisElement.append("text")
            .attr("x", margins.left + xAxisWidth)
            .attr("y", 0)
            .attr("dy", "3em")
            .style("text-anchor", "middle")
            .text("Time");

        var yAxisElement = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margins.left + ",0)")
            .call(yAxis);

        // Add a label to the middle of the y axis
        var yAxisHeight = ((height - margins.bottom) - margins.top) / 2;
        yAxisElement.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", -(margins.top + yAxisHeight))
            .attr("dy", "-3.5em")
            .style("text-anchor", "middle")
            .text("Updates per second");

        // Define our line series
        var lineFunc = d3.svg.line()
            .x(function(d) { return xRange(d.x); })
            .y(function(d) { return yRange(d.y); })
            .interpolate("basis");

        var lineFunc2 = d3.svg.line()
            .x(function(d) { return xRange(d.x); })
            .y(function(d) { return yRange(d.z); })
            .interpolate("basis");

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", margins.left)
            .attr("y", margins.top)
            .attr("width", width)
            .attr("height", height);

        var line = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .attr("stroke", "blue")
            .attr("fill", "none");
        var line2 = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .attr("stroke", "red")
            .attr("fill", "none");

        // Add a text element below the chart, which will display the subject of new edits
        svg.append("text")
            .attr("class", "edit-text")
            .attr("transform", "translate(" + margins.left + "," + (height + 20)  + ")")
            .attr("width", width - margins.left);


    function update(updates) {
      // Update the ranges of the chart to reflect the new data
      if (updates.length > 0)   {
          xRange.domain(d3.extent(updates, function(d) { return d.x; }));
          // yRange.domain([d3.min(updates, function(d) { return d.y; }),
          //                d3.max(updates, function(d) { return d.y; })]);
      }

      // Until we have filled up our data window, we just keep adding data
      // points to the end of the chart.
      if (updates.length <20) {
          line.transition()
              .ease("linear")
              .attr("d", lineFunc(updates));
          line2.transition()
              .ease("linear")
              .attr("d", lineFunc2(updates));

          svg.selectAll("g.x.axis")
              .transition()
              .ease("linear")
              .call(xAxis);
      }
      // Once we have filled up the window, we then remove points from the
      // start of the chart, and move the data over so the chart looks
      // like it is scrolling forwards in time
      else    {

        var samplingTime = 20;
          // Calculate the amount of translation on the x axis which equates to the
          // time between two samples
          var xTranslation = xRange(updates[0].x) - xRange(updates[1].x);

          // Transform our line series immediately, then translate it from
          // right to left. This gives the effect of our chart scrolling
          // forwards in time
          line
              .attr("d", lineFunc(updates))
              .attr("transform", null)
              .transition()
              .duration(samplingTime - 20)
              .ease("linear")
              .attr("transform", "translate(" + xTranslation + ", 0)");
          line2
              .attr("d", lineFunc2(updates))
              .attr("transform", null)
              .transition()
              .duration(samplingTime - 20)
              .ease("linear")
              .attr("transform", "translate(" + xTranslation + ", 0)");

          svg.selectAll("g.x.axis")
              .transition()
              .duration(samplingTime - 20)
              .ease("linear")
              .call(xAxis);
      }

      svg.selectAll("g.y.axis")
          .transition()
          .call(yAxis);
  }

});
