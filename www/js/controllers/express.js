/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('ExpressCtrl', function ($scope, $rootScope, $log, Shipping, $timeout) {
      $log.debug('Express ctrl');
      $scope.shippings = Shipping.getShippings();
      $scope.hasNextPage = Shipping.hasNextPage();
      $scope.loadError = false;
      $log.debug('page load, has next page ?', $scope.hasNextPage);

      $scope.doRefresh = function () {
        $log.debug('do refresh');
        Shipping.refresh().$promise.then(function (response) {
          $log.debug('do refresh complete');
          $scope.shippings = response.data;
          $scope.hasNextPage = true;
          $scope.loadError = false;
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadError = true;
        })).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $scope.loadMore = function () {
        $log.debug('load more');
        Shipping.pagination().$promise.then(function (response) {
          $log.debug('load more complet');
          $scope.hasNextPage = false;
          $scope.loadError = false;
          $timeout(function () {
            $scope.hasNextPage = Shipping.hasNextPage();
            $log.debug('has next page ? ', $scope.hasNextPage);
          }, 100);

          $scope.shippings = $scope.shippings.concat(response.data);
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadError = true;
        })).finally(function () {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      };
    });
})();
