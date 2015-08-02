timeline = null;
var myApp = angular.module("vmTracer", ['ngRoute', 'ngAnimate']);

myApp
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pre.html',
            controller: 'preCtrl'
        })
        .when('/app/intro/:opId', {
            templateUrl: 'app.html',
            controller: 'introCtrl'
        })
        .when('/app/:traceId', {
            templateUrl: 'app.html',
            controller: 'infoCtl'
        });
    //$locationProvider.html5Mode(true);
}])
.filter('unsafe', function ($sce) { return $sce.trustAsHtml; })
.filter('secondsToDateTime', function () {
    return function(seconds) {
        var d = new Date(0,0,0,0,0,0,0);
        d.setSeconds(seconds * 1000);
        return d;
    };
})
.service('initData', function () {
    var self = this;

    self.rawData = null;
    self.opsInfoLen = null;

    self.genContent = function (ops_info) {
        return '<a href="#/app/' + ops_info.vmoptrecordid + '">' + ops_info.vmoptname + '</a>'
    };

    self.getOpsData = function (op_id) {
        for (var i=0; i<self.opsInfoLen; i++) {
            if (self.rawData.ops_info[i].vmoptrecordid == op_id) {
                return self.rawData.ops_info[i];
            }
        }
    };

    self.timelineData = null;
    self.genTimelineData = function () {
        var timelineData = {'data': null, 'group': null};
        if (self.rawData) {
            timelineData.data = new vis.DataSet();
            timelineData.group = new vis.DataSet();

            var rawDataLen = self.opsInfoLen = self.rawData.ops_info.length,
                groups = {};  // using this to remove dup items of vmnames
            for (var i=0; i<rawDataLen; i++) {
                timelineData.data.add({
                    'id': self.rawData.ops_info[i].vmoptrecordid,
                    'start': self.rawData.ops_info[i].starttime * 1000,
                    //'end': self.rawData.ops_info[i].endtime,
                    'content': self.genContent(self.rawData.ops_info[i]),
                    'group': self.rawData.ops_info[i].vmname
                });
                groups[self.rawData.ops_info[i].vmname] = '' 
            };
            
            for (vmname in groups) {
                timelineData.group.add({
                    'id': vmname,
                    'content': vmname
                });
            }
        }
        self.timelineData = timelineData;
    };
})
.run(function ($http, $rootScope, initData) {
    $http.get('/init_pre')
        .success(function (data, status, headers, config) {
            initData.rawData = data;
        });
})
.controller('appRoot', ['$scope', '$http', 'initData', function ($scope, $http, initData) {
    $scope.showTimeline = false;
    $scope.initData = initData;
}])
.controller('preCtrl', ['$scope', 'initData', function ($scope, initData) {
    $scope.$parent.showTimeline = false;
    $scope.initData = initData;
}])
.controller('introCtrl', ['$scope', '$http', '$routeParams', 'initData', function ($scope, $http, $routeParams, initData) {
    //$('#info-container').attr('id', '');
    $scope.params = {'traceId': 'intro'};
    $scope.$parent.showTimeline = true;
    $http.get('/init', {'params': {'trace_id': $routeParams.opId}})
        .success(function (data, status, headers, config) {
            initData.rawData = data;
            initData.genTimelineData();
            //$('#info-container').attr('id', '');
        });
        
}])
.controller('infoCtl', ['$scope', '$http', '$routeParams', 'initData', function ($scope, $http, $routeParams, initData) {
    // show timeline
    $scope.$parent.showTimeline = true;
    $scope.params = $routeParams;
    $scope.initData = initData;
    $scope.curOp = null;
    console.log($scope.params);
    //if ($scope.params.traceId == 'intro') {
    //    $scope.
    //}
    if ($scope.params.traceId != 'intro') {
        $scope.curOp = $scope.initData.getOpsData($scope.params.traceId);

        if ($scope.curOp && typeof $scope.curOp.logs == 'undefined') {
            $http.get('/get_log', {'params': {'op_id': $scope.params.traceId}})
                .success( function (data, status, headers, config) {
                    $scope.curOp.logs = data['logs'];
                });
        }
    }
}])
.controller('timelineCtl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
    //$scope.params = $routeParams;
}])
.directive('timeline', function () {
    return function (scope, element, attrs) {
        scope.$watch('initData.timelineData', function(newValue, oldValue) {
            if (newValue) {
                console.log(newValue);
                if (timeline == null) {
                    timeline = new vis.Timeline(element[0], newValue.data, {'maxHeight': '300px'});
                    timeline.setGroups(newValue.group);
                } else {
                    timeline.setItems(newValue.data);
                    timeline.setGroups(newValue.group);
                }
            }
        });
    }
})
