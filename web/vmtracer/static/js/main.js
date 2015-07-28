var myApp = angular.module("vmTracer", []);

myApp
.service('initData', function () {
    var self = this;

    self.rawData = null;

    self.timelineData = function () {
        var timelineData = new vis.DataSet();
        if (self.rawData.ops_info) {
            var rawDataLen = self.rawData.ops_info.length;
            for (var i=0; i<rawDataLen; i++) {
                timelineData.add({
                    'start': self.rawData.ops_info[i].starttime,
                    'end': self.rawData.ops_info[i].endtime,
                    'content': self.rawData.ops_info[i].vmoptname
                });
            };
        }
        return timelineData;
    };
})
.run(function ($http, initData) {
    // $http.get('/init')
    //     .success(function (data, status, headers, config) {
    //         initData.rawData = data;
    //     });
    initData.rawData = serverData;
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
        var timelineData = scope.initData.timelineData()
        if (timelineData) {
            var timeline = new vis.Timeline(element[0], timelineData, {});
        }
    }
})
