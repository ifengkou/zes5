/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.services')
    .factory('Shipping', function (Settings, $resource, $log, User) {
      $log.debug("Shipping Service init:", Settings.getAPI());
      var shippings = [];
      var nextPage = 1;
      var hasNextPage = true;
      var resource = null;
      var _initResource = function (apiUrl) {
        resource = $resource(apiUrl + '/shipping/:id', {id: '@id'}, {
          query: {
            method: 'get',
            params: {
              page: 1,
            },
            timeout: 2000
          },
          signIn: {
            method: 'PUT',
            url: apiUrl + '/shipping/:id/sign',
          },
          queryById: {
            method: 'get'
          }
        });
      };
      _initResource(Settings.getAPI());

      var getShippings = function (page, callback) {
        $log.debug("getShippings:", User.getCurrentUser().token);
        return resource.query({
          accesstoken: User.getCurrentUser().token,
          page: page
        }, function (r) {
          $log.debug('get shipping page:', page, 'data', r.data);
          return callback && callback(r);
        }, function (e) {
          $log.debug(e);
        });
      };
      return {
        initResource: function (url) {
          _initResource(url);
        },
        refresh: function () {
          return getShippings(1, function (response) {
            nextPage = 2;
            hasNextPage = true;
            shippings = response.data;
          });
        },
        pagination: function () {
          return getShippings(nextPage, function (response) {
            $log.debug('response data length'+response.data.length);
            if (response.data.length < 10) {
              $log.debug('response data length=', response.data.length);
              hasNextPage = false;
            }
            nextPage++;
            shippings = shippings.concat(response.data);
          });
        },
        hasNextPage: function (has) {
          if (typeof has !== 'undefined') {
            hasNextPage = has;
          }
          return hasNextPage;
        },
        resetData: function () {
          shippings = [];
          nextPage = 1;
          hasNextPage = true;
        },
        getShippings: function () {
          return shippings;
        },
        getById: function (id) {
          if (!!shippings) {
            for (var i = 0; i < shippings.length; i++) {
              if (shippings[i].id == id) {
                return shippings[i];
              }
            }
          } else {
            return null;
          }
        },
        queryById: function (id) {
          return resource.queryById({id: id, accesstoken: User.getCurrentUser().token}, null);
        },
        signIn: function (bean, id) {
          return resource.signIn({id: id, accesstoken: User.getCurrentUser().token}, bean);
        }
      };
    });
})();
