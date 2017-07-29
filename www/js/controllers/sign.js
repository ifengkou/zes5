/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('SignCtrl', function ($scope, $rootScope, $ionicLoading,$ionicPlatform, $log, $cordovaBarcodeScanner, Shipping) {
      $log.debug('Sign ctrl');
      $scope.signNo = "";
      $scope.isScanning = false;
      $scope.callQrScanner = function () {
        $scope.isScanning = true;
        $ionicPlatform.ready(function() {
          $cordovaBarcodeScanner
            .scan()
            .then(function (barcodeData) {
              // Success! Barcode data is here
              $scope.signNo = barcodeData.text;
              $scope.queryShipping($scope.signNo);
              $scope.isScanning = false;
            }, function (error) {
              // An error occurred
              $log.debug(error);
              $ionicLoading.show({
                noBackdrop: true,
                template: error,
                duration: 1000
              });
              $scope.isScanning = false;
            });
        });
        $scope.isScanning = false;
      };

      var initShipping = {
        "id": "",
        "signInCube": 0,
        "exceptionInfo": "",
        "isSigned": 1
      };
      $scope.isSigned = true;
      $scope.shipping = initShipping;

      $scope.queryShipping = function (id) {
        $log.debug("queryShipping:" + id);
        $ionicLoading.show();
        Shipping.queryById(id).$promise.then(function (r) {
          if (r.success) {
            if (r.data.isSigned) {
              $ionicLoading.show({
                noBackdrop: true,
                template: "该单号已被签收",
                duration: 2000
              });
            } else {
              $scope.shipping = r.data;
              $scope.shipping.signInCube = $scope.shipping.shippingCube;
              $scope.shipping.isSigned = 1;
              $ionicLoading.hide();
            }
          } else {
            $scope.shipping = initShipping;
            $ionicLoading.show({
              noBackdrop: true,
              template: r.message,
              duration: 2000
            });
          }

        }, $rootScope.requestErrorHandler());
      };

      $scope.check = function (val) {
        if (val) {
          $scope.shipping.isSigned = 1;
        } else {
          $scope.shipping.isSigned = 0;
        }
      };

      $scope.sign = function () {
        $log.debug($scope.shipping);

        if ($scope.shipping.id.length < 5) {
          return;
        } else {
          Shipping.signIn($scope.shipping, $scope.shipping.id).$promise.then(function (r) {
            $log.debug(r);
            if (r.success) {
              var message = "";
              $log.info(r);
              if (r.data.isSigned == 1) {
                message = "签收成功：" + r.data.projectName + "，共签收<br />[" + r.data.conStrength + "]-[" + r.data.signInCube + "]方";
              } else {
                message = "<span style='color:red'>拒签成功：" + r.data.projectName + "，共拒签收<br />[" + r.data.conStrength + "]-[" + r.data.signInCube + "]方</span>";
              }
              $scope.shipping = initShipping;
              $scope.isSigned = true;
              $ionicLoading.show({
                noBackdrop: true,
                template: message,
                duration: 2000
              });
            } else {
              $ionicLoading.show({
                noBackdrop: true,
                template: r.message,
                duration: 1000
              });
            }
          }, $rootScope.requestErrorHandler());

        }
      };
    });
})();
