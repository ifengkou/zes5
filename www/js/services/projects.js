/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.services')
    .factory('Projects', function (Settings, $resource, $log, User) {
      $log.debug("Projects service init,the api url :", Settings.getAPI());
      var projects = [];
      var nextPage = 1;
      var hasNextPage = true;
      var resource = null;
      var _initResource = function (apiUrl) {
        resource = $resource(apiUrl + '/projects/:id', {id: '@id'}, {
          query: {
            method: 'get',
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

      var getProjects = function (page, callback) {
        $log.debug("project getProjects:", User.getCurrentUser().token);
        return resource.query({
          accesstoken: User.getCurrentUser().token,
          page: page
        }, function (r) {
          $log.debug('get projects page:', page, 'data', r.data);
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
          return getProjects(1, function (response) {
            nextPage = 2;
            hasNextPage = true;
            projects = response.data;
          });
        },
        pagination: function () {
          return getProjects(nextPage, function (response) {
            if (response.data.length < 10) {
              $log.debug('response data length', response.data.length);
              hasNextPage = false;
            }
            nextPage++;
            projects = projects.concat(response.data);
          });
        },
        hasNextPage: function (has) {
          if (typeof has !== 'undefined') {
            hasNextPage = has;
          }
          return hasNextPage;
        },
        resetData: function () {
          projects = [];
          nextPage = 1;
          hasNextPage = true;
        },
        getProjects: function () {
          return projects;
        },
        getById: function (id) {
          if (!!projects) {
            for (var i = 0; i < projects.length; i++) {
              if (projects[i].projectID == id) {
                return projects[i];
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
