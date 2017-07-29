/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('AppCtrl', function ($scope, $rootScope, $log, $ionicLoading, $ionicPopup, $timeout, $state, $cordovaNetwork, User, Settings, _Sys) {
      //, $ionicPopup, $ionicLoading
      $log.log('app ctrl');
      //enviroment config
      //$scope.ENV = ENV;

      //$state.includes("app.*")
      //get user setting

      $scope.api = Settings.getAPI();

      var currentUser = User.getCurrentUser();
      $scope.username = currentUser.username || null;

      //如果没有登录，或者URL为空 ，则跳转到登陆页进行设置、登录
      if (!currentUser.token || !$scope.api || $scope.api.indexOf("http://") === -1) {
        $log.info("not sign in or not setting wlan");
        $state.go("signin");
      }

      //判断网络状态
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        var type = $cordovaNetwork.getNetwork();
        /*var onlineState = networkState;*/
        $ionicLoading.show({
          noBackdrop: true,
          template: "设备联网中...",
          duration: 1000
        });
        if (type == Connection.WIFI) {
          var wifiApi = Settings.getWIFIAPI();
          if (wifiApi) {
            Settings.test(wifiApi).$promise.then(function (response) {
              if (response.success) {
                $ionicLoading.show({
                  noBackdrop: true,
                  template: "切换内网服务器地址中....",
                  duration: 2000
                });
                _Sys.changeResource(wifiApi);
              }
            }, function (e) {
              $ionicLoading.show({
                noBackdrop: true,
                template: wifiApi+"切换失败，无法连接服务器....",
                duration: 2000
              });
            });
          }
        }
        else if (type == Connection.CELL_4G || type == Connection.CELL_3G) {
          var wlanApi = Settings.getAPI();
          $ionicLoading.show({
            noBackdrop: true,
            template: "切换移动网(3G|4G)服务器地址中....",
            duration: 2000
          });
          _Sys.changeResource(wlanApi);
        }else{
          _Sys.changeResource(Settings.getAPI());
        }
      });

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
        /*var offlineState = networkState;*/
        //提醒用户的网络异常
        $ionicLoading.show({
          template: '网络异常，不能连接到服务器！'
        });
      });

      //ionic platform
      $scope.platform = ionic.Platform;

      // app resume event
      document.addEventListener('resume', function onResume() {
        $log.log('app on resume');
        if ($scope.username !== null) {
          //$rootScope.getMessageCount();
        }
      }, false);

      //logout
      $rootScope.$on('logout', function () {
        $log.debug('logout broadcast handle');
        $scope.username = null;
        //$state.go('sign-in');
      });

      //login
      $rootScope.$on('login', function () {
        $log.debug('login broadcast handle');
        var currentUser = User.getCurrentUser();
        $scope.username = currentUser.username;
      });
    });
})();

