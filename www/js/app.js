// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
(function () {
  "use strict";
  angular.module('gaia', ['ionic', 'angularMoment', 'ngCordova', 'gaia.directives', 'gaia.controllers', 'gaia.config', 'gaia.services'])
    .run(function ($ionicPlatform, $log, $timeout, $state, $rootScope, $cordovaDialogs, $cordovaToast, $ionicHistory, $ionicLoading) {
      $ionicPlatform.ready(function () {//, ENV, Settings
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }

        if (navigator.splashscreen) {
          $timeout(function () {
            navigator.splashscreen.hide();
          }, 100);
        } else {
          $log.debug('no splash screen plugin');
        }

        //双击退出
        $ionicPlatform.registerBackButtonAction(function (e) {
          if ($rootScope.backButtonPressedOnceToExit) {
            ionic.Platform.exitApp();
          } else {
            $rootScope.backButtonPressedOnceToExit = true;
            $cordovaToast.showShortTop('再按一次退出系统');
            $timeout(function () {
              $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
          }
          /*//判断处于哪个页面时双击退出
           if ($location.path() == '/app/projects'||$location.path() == '/app/plans'||$location.path() == '/app/express'||$location.path() == '/app/sign') {
           if ($rootScope.backButtonPressedOnceToExit) {
           ionic.Platform.exitApp();
           } else {
           $rootScope.backButtonPressedOnceToExit = true;
           $cordovaToast.showShortTop('再按一次退出系统');
           setTimeout(function () {
           $rootScope.backButtonPressedOnceToExit = false;
           }, 2000);
           }
           }
           else if ($ionicHistory.backView()) {
           $ionicHistory.goBack();
           } else {
           $rootScope.backButtonPressedOnceToExit = true;
           $cordovaToast.showShortTop('再按一次退出系统');
           setTimeout(function () {
           $rootScope.backButtonPressedOnceToExit = false;
           }, 2000);
           }*/
          e.preventDefault();
          return false;
        }, 101);
      }, false);

      var errorMsg = {
        0: '网络出错了，请再试一下',
        1: '登录授权已过期，需要重新登陆',
        'wrong accessToken': '授权失败'
      };
      $rootScope.requestErrorHandler = function (options, callback) {
        return function (response) {
          $log.error(response);
          $ionicLoading.hide();
          var error = "请求出错了！";
          if (response.message) {
            error = response.message;
          } else if (response.data && response.data.error_msg) {
            error = errorMsg[response.data.error_msg];
          } else if (response.status) {
            error = errorMsg[response.status] || 'Error' + response.status + ' ' + response.statusText;
          }
          var o = options || {};
          angular.extend(o, {
            template: error,
            duration: 1000
          });
          $ionicLoading.show(o);
          return callback && callback();
        };
      };


    })

    .config(function (ENV, $stateProvider, $urlRouterProvider, $logProvider, $ionicConfigProvider) {
      $logProvider.debugEnabled(ENV.debug);

      $stateProvider
        .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/menu.html',
          controller: 'AppCtrl'
        })

        .state('app.user', {
          url: '/user/:username',
          views: {
            'menuContent': {
              templateUrl: 'templates/user.html',
              controller: 'UserCtrl'
            }
          }
        })
        .state('signin', {
          url: '/sign-in',
          templateUrl: 'templates/sign-in.html',
          controller: 'SignInCtrl'
        })

        .state('app.projects', {
          url: '/projects',
          views: {
            'menuContent': {
              templateUrl: 'templates/projects.html',
              controller: 'ProjectsCtrl'
            }
          }
        })
        .state('app.plans', {
          url: '/plans',
          views: {
            'menuContent': {
              templateUrl: 'templates/plans.html',
              controller: 'PlansCtrl'
            }
          }
        })
        .state('app.express', {
          url: '/express',
          views: {
            'menuContent': {
              templateUrl: 'templates/express.html',
              controller: 'ExpressCtrl'
            }
          }
        })
        .state('app.sign', {
          url: '/sign',
          views: {
            'menuContent': {
              templateUrl: 'templates/sign.html',
              controller: 'SignCtrl'
            }
          }
        })
        .state('app.settings', {
          url: '/settings',
          views: {
            'menuContent': {
              templateUrl: 'templates/settings.html',
              controller: 'SettingsCtrl'
            }
          }
        });
      // if none of the above states ar e matched, use this as the fallback
      $urlRouterProvider.otherwise('/sign-in');

      //Animation style when transitioning between views. Default platform.
      $ionicConfigProvider.views.transition("ios");
      // Which side of the navBar to align the title. Default center.
      $ionicConfigProvider.navBar.alignTitle('center');
      //Tab style. Android defaults to striped and iOS defaults to standard.
      $ionicConfigProvider.tabs.style("standard");

      //Toggle item style. Android defaults to small and iOS defaults to large.
      $ionicConfigProvider.form.toggle("large");
      //Checkbox style. Android defaults to square and iOS defaults to circle.
      $ionicConfigProvider.form.checkbox("circle");
    });

//setter custom's module

  angular.module('gaia.controllers', ['gaia.services', 'ionic-timepicker']);

  angular.module('gaia.services', ['ngResource', 'gaia.config']);

  angular.module('gaia.directives', ['ionic']);
})();
