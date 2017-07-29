/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.services')
    .factory('Plans', function (Settings, $resource, $log, User) {
      $log.debug("Plans service init,the api url :", Settings.getAPI());
      var auditing_plans = [];
      var audited_plans = [];
      var auditing_nextPage = 1;
      var auditing_hasNextPage = true;
      var audited_nextPage = 1;
      var audited_hasNextPage = true;
      var resource = $resource("");
      var _initResource = function (apiUrl) {
        resource = $resource(apiUrl + '/plans/:id', {id: '@id'}, {
          auditing: {
            method: 'get',
            url: apiUrl + '/plans/auditing',
            params: {
              page: 1,
            },
            timeout: 2000
          },
          audited: {
            method: 'get',
            url: apiUrl + '/plans/audited',
            params: {
              page: 1,
            },
            timeout: 2000
          },
          update: {
            method: 'PUT'
          }
        });
      };
      _initResource(Settings.getAPI());

      var getAuditingPlans = function (page, callback) {
        return resource.auditing({
          accesstoken: User.getCurrentUser().token,
          page: page
        }, function (r) {
          $log.debug('get AuditingPlans page:', page, 'data', r.data);
          return callback && callback(r);
        }, function (e) {
          $log.debug(e);
        });
      };

      var getAuditedPlans = function (page, callback) {
        return resource.audited({
          accesstoken: User.getCurrentUser().token,
          page: page
        }, function (r) {
          $log.debug('get AuditedPlans page:', page, 'data', r.data);
          return callback && callback(r);
        }, function (e) {
          $log.debug(e);
        });
      };

      return {
        initResource: function (url) {
          _initResource(url);
        },
        refreshAuditingPlans: function () {
          return getAuditingPlans(1, function (response) {
            auditing_nextPage = 2;
            auditing_hasNextPage = true;
            auditing_plans = response.data;
          });
        },
        refreshAuditedPlans: function () {
          return getAuditedPlans(1, function (response) {
            audited_nextPage = 2;
            audited_hasNextPage = true;
            audited_plans = response.data;
          });
        },
        paginationAuditingPlans: function () {
          return getAuditingPlans(auditing_nextPage, function (response) {
            if (response.data.length < 10) {
              $log.debug('response data length', response.data.length);
              auditing_hasNextPage = false;
            }
            auditing_nextPage++;
            auditing_plans = auditing_plans.concat(response.data);
          });
        },
        paginationAuditedPlans: function () {
          return getAuditedPlans(audited_nextPage, function (response) {
            if (response.data.length < 10) {
              $log.debug('response data length', response.data.length);
              audited_hasNextPage = false;
            }
            audited_nextPage++;
            audited_plans = audited_plans.concat(response.data);
          });
        },
        hasNextPageAuditingPlans: function (has) {
          if (typeof has !== 'undefined') {
            auditing_hasNextPage = has;
          }
          return auditing_hasNextPage;
        },
        hasNextPageAuditedPlans: function (has) {
          if (typeof has !== 'undefined') {
            audited_hasNextPage = has;
          }
          return audited_hasNextPage;
        },
        resetData: function () {
          auditing_plans = [];
          audited_plans = [];
          auditing_nextPage = 1;
          auditing_hasNextPage = true;
          audited_nextPage = 1;
          audited_hasNextPage = true;
        },
        getAuditingPlans: function () {
          return auditing_plans;
        },
        getAuditingPlanById: function (id) {
          if (!!auditing_plans) {
            for (var i = 0; i < auditing_plans.length; i++) {
              if (auditing_plans[i].customerPlanID == id) {
                return auditing_plans[i];
              }
            }
          } else {
            return null;
          }
        },
        getAuditedPlans: function () {
          return audited_plans;
        },
        getAuditedPlanById: function (id) {
          if (!!audited_plans) {
            for (var i = 0; i < audited_plans.length; i++) {
              if (audited_plans[i].customerPlanID == id) {
                return audited_plans[i];
              }
            }
          } else {
            return null;
          }
        },
        save: function (bean) {
          return resource.save({accesstoken: User.getCurrentUser().token}, bean);
        },
        update: function (bean, id) {
          return resource.update({id: id, accesstoken: User.getCurrentUser().token}, bean);
        },
        remove: function (id) {
          return resource.remove({id: id, accesstoken: User.getCurrentUser().token}, null);
        }
      };
    });
})();
