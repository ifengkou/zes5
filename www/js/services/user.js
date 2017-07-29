/**
 * Created by Sloong on 2015/10/16.
 */

(function () {
  "use strict";

  angular.module("gaia.services")
    .factory("User", function (Settings, $resource, $log, $q, Storage) {
      $log.debug("User Service init,the api url :",Settings.getAPI());

      var storageKey = "zes5customer";
      var resource = null;
      var _initResource = function(apiUrl){
        resource = $resource(apiUrl + '/customer',{},{
          login:{
            method:'post',
            url:apiUrl + '/customer/login'
          },
          accesstoken:{
            method:'get',
            url:apiUrl + '/customer/accesstoken'
          },
          changePwd:{
            method:'post',
            url:apiUrl + '/customer/password'
          }
        });
      };
      _initResource(Settings.getAPI());

      var user = Storage.get(storageKey) || {};
      return {
        initResource:function(url){
          _initResource(url);
        },
        login:function(loginName,password){
          return resource.login({},{
            name:loginName,
            pass:password
          },function(response){
            if(response && response.success){
              user = response.data;
              if(user.token){
                Storage.set(storageKey,user);
              }else{
                $log.debug("token is null");
              }
            }
          });
        },
        logout:function(){
          user = {};
          Storage.remove(storageKey);
        },
        getCurrentUser:function(){
          $log.debug("getCurrentUser");
          return user;
        },
        accesstoken:function(accesstoken){
          return resource.accesstoken({
            accesstoken:accesstoken
          },function(response){
            $log.debug('verify user accesstoken:',response);
          });
        },
        changePwd:function(oldPwd,newPwd,accesstoken){
          return resource.changePwd({accesstoken:accesstoken},{
            oldPasswordCiphertext:oldPwd,
            newPasswordCiphertext:newPwd
          },function(response){
            $log.debug('verify user accesstoken:',response);
          });
        }
      };
    });
})();
