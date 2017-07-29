/**
 * Created by Sloong on 2015/10/20.
 */
(function () {
  'use strict';
  angular.module('gaia.services')
    .factory('_Sys', function (ENV, User, Projects, Plans, Dics, Shipping) {
      return {
        changeResource: function (url) {
          User.initResource(url);
          Projects.initResource(url);
          Plans.initResource(url);
          Dics.initResource(url);
          Shipping.initResource(url);
        }
      };
    });
})();
