/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('UserCtrl', function ($scope, $log, $state, $rootScope, $location, $ionicLoading, $ionicModal, $timeout, User, Projects, Plans, Shipping) {
      $log.debug('User Ctrl');
      $scope.user = User.getCurrentUser();

      //logout action
      $scope.logout = function () {
        $log.debug("logout button action");

        Projects.resetData();
        Plans.resetData();
        Shipping.resetData();
        User.logout();

        $rootScope.$broadcast("logout");
        //$location.path("sign-in");
        $state.go("signin");

        //track event
        /*if (window.analytics) {
         window.analytics.trackEvent('User', 'logout');
         }*/
      };
      $scope.changePwdData = {oldPassword: "", newPassword: "", repeatPassword: ""};

      $ionicModal.fromTemplateUrl('templates/changePwd.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.changePwdModal = modal;
      });

      $scope.showChangePwdModal = function () {
        $scope.changePwdModal.show();
      };

      $scope.closePwdModal = function () {
        if (window.StatusBar) {
          StatusBar.styleLightContent();
        }
        $scope.changePwdData = {oldPassword: "", newPassword: "", repeatPassword: ""};
        $scope.changePwdModal.hide();
      };
      $scope.changePwd = function () {
        if (!($scope.changePwdData.oldPassword && $scope.changePwdData.newPassword)) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "密码不能为空",
            duration: 1000
          });
        } else {
          var hash1 = CryptoJS.SHA1($scope.changePwdData.oldPassword);
          var hash2 = CryptoJS.SHA1($scope.changePwdData.newPassword);
          var _oldPassword = hash1.toString(CryptoJS.enc.Base64);
          var _newPassword = hash2.toString(CryptoJS.enc.Base64);
          $ionicLoading.show();
          User.changePwd(_oldPassword, _newPassword, User.getCurrentUser().token).$promise.then(function (r) {
            $ionicLoading.hide();
            if (r.success) {
              $scope.changePwdData = {oldPassword: "", newPassword: "", repeatPassword: ""};
              $scope.changePwdModal.hide();
              $ionicLoading.show({
                noBackdrop: true,
                template: r.message + "，两秒后跳转到登录页面重新登陆",
                duration: 2000
              });
              //两秒后跳转到登录页
              $timeout(function () {
                $scope.logout();
              }, 2000);
            } else {
              $ionicLoading.show({
                noBackdrop: true,
                template: r.message,
                duration: 2000
              });
            }
          }, $rootScope.requestErrorHandler());
        }
      };


    });
})();
