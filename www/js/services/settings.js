/**
 * Created by Sloong on 2015/10/20.
 */
(function () {
  'use strict';
  angular.module('gaia.services')
    .factory('Settings', function (ENV, $resource, $log, Storage) {
      $log.debug("Settings Service init");
      var storageKey = 'settings';
      var _settings = Storage.get(storageKey) || {};
      var baseUrl = '/api';
      var addOn = "/gaia";
      return {
        getSettings: function () {
          return _settings;
        },
        save: function (settings) {
          $log.debug('save setting to local storage', settings);
          Storage.set(storageKey, settings);
          _settings = settings;
          return settings;
        },
        getAPI: function () {
          if (_settings.wlan) {
            return "http://" + _settings.wlan + addOn + baseUrl;
          }
          return "";
        },
        getWIFIAPI: function () {
          if (_settings.wifiMode && _settings.wifi) {
            return "http://" + _settings.wifi + addOn + baseUrl;
          }
          return "";
        },
        addOnAPI:function(url){
          return "http://" + url + addOn + baseUrl;
        },
        test: function (url) {
          var resource = $resource(url + "/test", {}, {
            query: {
              method: 'get',
              isArray: false,
              timeout: 2000
            }
          });
          return resource.query();
        }
      };
    });
})();
