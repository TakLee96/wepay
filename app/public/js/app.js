/**
 * Created by lijiahang on 14-10-4.
 */

var wepayApp = angular.module('wepayApp', []);

wepayApp.factory('fbData', ['$rootScope', function($rootScope) {
    $rootScope.data = {};

    var setData = function(data, value) {
        $rootScope.data[data] = value;
    };

    var getData = function(data) {
        return $rootScope.data[data];
    };

    return {
        setData: setData,
        getData: getData
    }
}]);

wepayApp.factory('Server', ['$rootScope', '$http', function($rootScope, $http) {

}]);

wepayApp.controller('wepayCtrl', ['$scope', '$interval', 'fbData', function($scope, $interval, fbData) {
    $scope.friends = "";

    $interval(function() {
        $scope.friends = fbData.getData('friends');
    }, 100);


}]);
