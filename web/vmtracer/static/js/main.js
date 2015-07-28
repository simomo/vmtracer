var myApp = angular.module("vmTracer", []);

myApp
.service('initData', function () {
    var self = this;

    self.rawData = null;

    self.timelineData = function () {
        var timelineData = new vis.DataSet();
        if (self.rawData.ops_info) {
            
        }
    };
})
.run(function ($http, initData) {
    $http.get('/init')
        .success(function (data, status, headers, config) {
            initData.rawData = data;
        });
})
.controller('appRoot', ['$scope', '$http', 'initData', function ($scope, $http, initData) {
    $scope.initData = initData;
    console.log(initData);
}])
.controller('infoCtl', ['$scope', function ($scope, $http) {}])
.controller('timelineCtl', ['$scope', function ($scope, $http) {}])
.directive('timeline', function () {
    return function (scope, element, attrs) {
        console.log(scope.initData);
    }
})
