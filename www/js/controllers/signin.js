/**
 * Created by Sloong on 2015/12/21.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('SignInCtrl', function ($scope, $state, $rootScope, $log, $ionicLoading, $timeout, $ionicModal, User, Dics, ENV, Settings, _Sys) {
      $log.info("SignIn Ctrl in");
      //如果已经登陆，直接跳转projects
      /*var settings = Settings.getSettings();
       if (settings.wlan) {
       $log.debug('app start,init ENV.api');
       ENV.api = "http://" + settings.wlan + "/gaia/api";
       //_Sys.changeResource(ENV.api);
       }*/
      $scope.api = Settings.getAPI();
      var currentUser = User.getCurrentUser();
      if (currentUser && currentUser.token && $scope.api) {
        $scope.username = currentUser.username;
        $ionicLoading.show({
          noBackdrop: true,
          template: "正在自动登录",
          duration: 500
        });
        $timeout(function () {
          $state.go('app.projects');
        }, 400);

      }
      $scope.settings = Settings.getSettings() || {
          wifiMode: false,
          wifi: "",
          wlan: "218.75.145.253:8088",
          isOk: false
        };
      $ionicModal.fromTemplateUrl('templates/urlSetting.html', {
        scope: $scope
      }).then(function (modal) {
        $log.debug("init setting modal");
        $scope.settingModal = modal;
        if ((!$scope.api) || ($scope.api.indexOf("http://") === -1)) {
          if (window.StatusBar) {
            StatusBar.styleDefault();
          }
          $scope.settingModal.show();
        }
      });
      $scope.showSettingModal = function () {
        $scope.settingModal.show();
      };

      $scope.showForgetModal = function () {
        $ionicLoading.show({
          noBackdrop: true,
          template: "请联系管理员",
          duration: 1000
        });
      };

      $scope.closeSettingModal = function () {
        if ($scope.api && $scope.api.indexOf("http://") > -1) {
          $scope.settingModal.hide();
        } else {
          $ionicLoading.show({
            noBackdrop: true,
            template: "请先设置好服务器配置",
            duration: 1000
          });
        }
      };


      $scope.testConnection = function () {
        $log.debug('testConnection:', $scope.settings);
        var _wlurl = Settings.addOnAPI($scope.settings.wlan);
        Settings.test(_wlurl).$promise.then(function (response) {
          if (response.success) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "<div><h1><i class='icon ion-checkmark-circled balanced'></i></h1>外网配置测网成功</div>",
              duration: 1000
            });
            //如果打开内网模式，则还需要测试内网是否通畅
            if ($scope.settings.wifiMode) {
              var _wfurl = Settings.addOnAPI($scope.settings.wifi);
              Settings.test(_wfurl).$promise.then(function (response) {
                if (response.success) {
                  $scope.settings.isOk = true;
                  $timeout(function () {
                    $ionicLoading.show({
                      noBackdrop: true,
                      template: "<div><h1><i class='icon ion-checkmark-circled balanced'></i></h1>内网配置测网成功</div>",
                      duration: 1000
                    });
                  }, 400);

                }
              }, function (error) {
                $scope.settings.isOk = false;
                $ionicLoading.show({
                  noBackdrop: true,
                  template: "<div><h1><i class='icon ion-sad energized'></i></h1>内网配置测网失败，请重试</div>",
                  duration: 1000
                });
              });
            } else {
              $scope.settings.isOk = true;
            }
          }

        }, function (e) {
          $scope.settings.isOk = false;
          $ionicLoading.show({
            noBackdrop: true,
            template: "<div><h1><i class='icon ion-sad energized'></i></h1>外网配置测网失败，请检查地址或联系管理员</div>",
            duration: 1000
          });
        });
      };
      $scope.saveSettings = function () {
        //1.save setting 到localstorage
        if (!$scope.settings.wifiMode) {
          $scope.settings.wifi = "";
        }
        Settings.save($scope.settings);
        $ionicLoading.show({
          noBackdrop: true,
          template: "<div><h1><i class='icon ion-checkmark-circled balanced'></i></h1>保存成功</div>",
          duration: 1000
        });
        //2.变更ENV中的API地址
        $scope.api = Settings.getAPI();
        //ENV.api = "http://" + $scope.settings.wlan + "/gaia/api";
        //3.变更所有Service 中的resource
        _Sys.changeResource($scope.api);
        $scope.settingModal.hide();
      };
      //login action callback
      var loginCallback = function (response) {
        $scope.loginData.password = "";
        $ionicLoading.hide();
        $log.debug("$rootScope.loginCallback");
        var currentUser = User.getCurrentUser();
        if (currentUser && currentUser.token) {
          $rootScope.$broadcast("login");
          $state.go('app.projects');
          //登录后初始化字典集合
          $timeout(function () {
            Dics.init(true);
          }, 4000);
        } else {
          $ionicLoading.show({
            noBackdrop: true,
            template: response.message,
            duration: 1000
          });
        }
      };

      $scope.loginData ={username: "", password: ""};

      $scope.signIn = function () {
        if ($scope.loginData.username && $scope.loginData.password) {
          var hash = CryptoJS.SHA1($scope.loginData.password);
          var _password = hash.toString(CryptoJS.enc.Base64);
          $ionicLoading.show();
          User.login($scope.loginData.username, _password.toUpperCase()).$promise.then(loginCallback, $rootScope.requestErrorHandler());
        } else {
          $ionicLoading.show({
            noBackdrop: true,
            template: "用户名和密码不能为空",
            duration: 1000
          });
        }
      };

    });
})();
