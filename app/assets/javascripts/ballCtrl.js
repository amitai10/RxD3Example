/*globals angular, alert, App, Rx */
angular.module('myApp').controller('ballCtrl', function ($scope, $http) {

  'use strict';

  $scope.init = function () {
    $scope.x = 50;
    $scope.y = 50;
    $scope.pauser = new Rx.Subject();
    var counter = Rx.Observable.interval(500)
      .pausable($scope.pauser)
      .flatMap(function () {
        return Rx.Observable.fromPromise($http.get('position.json', {params: {x: $scope.x, y: $scope.y}}));
      });


      counter.subscribe(function (response) {
        $scope.x = response.data.x;
        $scope.y = response.data.y;

        var ballLocation = {
          x: response.data.x,
          y: response.data.y
        }
        update(ballLocation);

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

    var xRange = d3.scale.linear().range([margins.left, width - margins.right])
    .domain([0,100]);

    var yRange = d3.scale.linear().range([height - margins.bottom, margins.top])
    .domain([0, 100]);

    var xAxis = d3.svg.axis()
    .scale(xRange)
    .tickSize(5)
    .tickSubdivide(true)

    var yAxis = d3.svg.axis()
      .scale(yRange)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);

    var xAxisElement = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - margins.bottom) + ")")
      .call(xAxis);

    var yAxisElement = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margins.left + ",0)")
      .call(yAxis);


    var circles = svg.append('circle').attr('cx',200).attr('cy',200).attr('r',20).style('fill','rgb(255,0,255)')

    function convLocation(ballLocation) {
      var x = ballLocation.x * (width - margins.right - margins.left)/100
      var y = ballLocation.y * (height - margins.bottom - margins.top) / 100
      y = (height - margins.bottom) - y - 10;
      x = x + margins.left + 10;
      return {
        x: x,
        y: y
      }
    }

    function update(ballLocation) {
      ballLocation = convLocation(ballLocation);
      circles
      .transition()
      .duration(500)
      .attr('cx',ballLocation.x)
      .attr('cy',ballLocation.y)
    }

});
