/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.services')
    .factory('Dics', function (Settings, $resource, $log, $timeout, User) {
      $log.debug("Dics service init,the api url :", Settings.getAPI());
      var dics = [];
      var constrengths = [];
      var isInit = false;
      var castMode = [];
      var consPos = [];
      var slump = [];
      var resource = null;
      var _initResource = function (apiUrl) {
        resource = $resource(apiUrl + '/dics', {}, {
          dics: {
            method: 'get',
            params: {},
            timeout: 2000
          },
          constrengths: {
            method: 'get',
            url: (apiUrl + '/dics/constrength'),
            params: {},
            timeout: 2000
          }
        });
      };
      _initResource(Settings.getAPI());

      var DICS = {
        conStrengths: [],
        castMode: [],
        slump: [],
        consPos: []
      };


      var getDics = function (callback) {
        return resource.dics({accesstoken: User.getCurrentUser().token}, function (r) {
          return callback && callback(r);
        }, function (e) {
          $log.debug(e);
        });
      };
      var getConstrengths = function (callback) {
        return resource.constrengths({accesstoken: User.getCurrentUser().token}, function (r) {
          return callback && callback(r);
        }, function (e) {
          $log.debug(e);
        });
      };

      var pullDics = function () {
        return getDics(function (response) {
          dics = response.data;
          angular.forEach(dics, function (obj) {
            if (obj.parentId === 'ConsPos') {
              consPos.push(obj);
            } else if (obj.parentId == "Slump") {
              slump.push(obj);
            } else if (obj.parentId == "CastMode") {
              castMode.push(obj);
            }
          });
        });
      };
      var pullCons = function () {
        return getConstrengths(function (response) {
          constrengths = response.data;
        });
      };

      return {
        initResource: function (url) {
          _initResource(url);
        },
        init: function (isReload) {
          if ((!isInit) || isReload) {
            pullDics().$promise.then(function (response) {
              DICS.castMode = castMode;
              DICS.slump = slump;
              DICS.consPos = consPos;
            }, function (e) {
              $log.debug("加载字典失败:", e);
            });
            $timeout(function () {
              pullCons().$promise.then(function () {
                DICS.conStrengths = constrengths;
              }, function (e) {
                $log.debug("加载砼强度失败:", e);
              });
            }, 200);

            isInit = true;
          }
        },
        getDictionary: function () {
          return DICS;
        },
        resetData: function () {
          dics = [];
          constrengths = [];
          consPos = [];
          slump = [];
          castMode = [];
        },
        getDics: function () {
          return dics;
        },
        getConsPos: function () {
          return consPos;
        },
        getSlump: function () {
          return slump;
        },
        getCastMode: function () {
          return castMode;
        },
        getConstrengths: function () {
          return constrengths;
        }
      };

    });
})();
