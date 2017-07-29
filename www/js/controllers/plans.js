/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('PlansCtrl', function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $ionicPopup, $timeout, $state, $ionicTabsDelegate, $location, $ionicListDelegate, $log, User, Plans, Dics, Projects) {
      $log.debug('Plans ctrl');

      //记录 新增和修改后的projectId，方便跳转到project details
      $scope.thePlanId = "";
      var initBeanData = {
        contractID: '',
        constructUnit: '',
        projectName: '',
        projectAddr: '',
        consPos: '',
        conStrength: '',
        planCube: '',
        slump: '',
        castMode: '',
        needDate: '',
        planDate: new Date(),
        tel: '',
        linkMan: ''
      };
      $scope.newData = initBeanData;

      $scope.dictionary = Dics.getDictionary();

      //如果字典为空，则重新加载一次
      if ($scope.dictionary.conStrengths.length === 0 || $scope.dictionary.castMode.length === 0 || $scope.dictionary.slump.length === 0 || $scope.dictionary.consPos.length === 0) {
        Dics.init(true);//强制刷新
        $timeout(function () {
          $scope.dictionary = Dics.getDictionary();
          $log.debug("强制刷新字典：", $scope.dictionary);
        }, 2000);
      }

      $scope.projects = [];
      var loadProjects = function () {
        Projects.refresh().$promise.then(function (response) {
          $scope.projects = response.data;
        }, $rootScope.requestErrorHandler());
      };




      $scope._contractID = "";
      $scope.watchProjectSelect = function (selectedId, isCreate) {
        if (isCreate) {
          angular.forEach($scope.projects, function (obj) {
            $log.debug("id=" + obj.contract.contractID);
            if (selectedId === obj.contract.contractID) {
              $scope.newData.contractID = obj.contract.contractID;
              $scope.newData.projectName = obj.projectName;
              $scope.newData.projectAddr = obj.projectAddr;
              $scope.newData.tel = obj.tel;
              $scope.newData.linkMan = obj.linkMan;
            }
          });
        } else {
          angular.forEach($scope.projects, function (obj) {
            if (selectedId === obj.contract.contractID) {
              $scope.updateData.contractID = obj.contract.contractID;
              $scope.updateData.projectName = obj.projectName;
              $scope.updateData.projectAddr = obj.projectAddr;
              $scope.updateData.tel = obj.tel;
              $scope.updateData.linkMan = obj.linkMan;
            }
          });
        }
      };

      $scope.auditingPlans = [];//Plans.getAuditingPlans()
      $scope.hasNextPageAuditingPlans = Plans.hasNextPageAuditingPlans();
      $scope.loadErrorAuditingPlans = false;
      $log.debug('auditingPlans page load, has next page ?', $scope.hasNextPageAuditingPlans);

      $scope.auditedPlans = [];//Plans.getAuditedPlans()
      $scope.hasNextPageAuditedPlans = Plans.hasNextPageAuditedPlans();
      $scope.loadErrorAuditedPlans = false;
      $log.debug('auditedPlans page load, has next page ?', $scope.hasNextPageAuditedPlans);

      $scope.doRefresh_auditing = function () {
        $log.debug('do refresh');
        Plans.refreshAuditingPlans().$promise.then(function (response) {
          $log.debug('do refreshAuditingPlans complete');
          $scope.auditingPlans = response.data;
          $scope.hasNextPageAuditingPlans = true;
          $scope.loadErrorAuditingPlans = false;
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadErrorAuditingPlans = true;
        })).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $scope.loadMore_auditing = function () {
        $log.debug('load more');
        Plans.paginationAuditingPlans().$promise.then(function (response) {
          $log.debug('load more complet');
          $scope.hasNextPageAuditingPlans = false;
          $scope.loadErrorAuditingPlans = false;
          $timeout(function () {
            $scope.hasNextPageAuditingPlans = Plans.hasNextPageAuditingPlans();
            $log.debug('has next AuditingPlans page ? ', $scope.hasNextPageAuditingPlans);
          }, 100);

          $scope.auditingPlans = $scope.auditingPlans.concat(response.data);
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadErrorAuditingPlans = true;
        })).finally(function () {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      };

      $scope.doRefresh_audited = function () {
        $log.debug('doRefresh_audited');
        Plans.refreshAuditedPlans().$promise.then(function (response) {
          $log.debug('do refreshAuditedPlans complete');
          $scope.auditedPlans = response.data;
          $scope.hasNextPageAuditedPlans = true;
          $scope.loadErrorAuditedPlans = false;
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadErrorAuditedPlans = true;
        })).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $scope.loadMore_audited = function () {
        $log.debug('loadMore_audited');
        Plans.paginationAuditedPlans().$promise.then(function (response) {
          $log.debug('load more complet');
          $scope.hasNextPageAuditedPlans = false;
          $scope.loadErrorAuditedPlans = false;
          $timeout(function () {
            $scope.hasNextPageAuditedPlans = Plans.hasNextPageAuditedPlans();
            $log.debug('has next AuditedPlans page ? ', $scope.hasNextPageAuditedPlans);
          }, 100);

          $scope.auditedPlans = $scope.auditedPlans.concat(response.data);
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadErrorAuditedPlans = true;
        })).finally(function () {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      };

      $scope.removePlan = function (id) {
        $log.debug("removePlan:", id);

        var confirmPopup = $ionicPopup.confirm({
          title: '确认',
          template: '确认删除该计划？',
          cancelText:"取消",
          okText: '确认',
          okType:"button-positive"
        });
        confirmPopup.then(function (res) {
          if (res) {
            Plans.remove(id).$promise.then(function (response) {
              if (response.success) {
                $timeout(function () {
                  $scope.doRefresh_auditing();
                }, 300);
              }
              $ionicLoading.show({
                noBackdrop: true,
                template: response.message,
                duration: 1000
              });
            }, $rootScope.requestErrorHandler({}, null));
          } else {
            console.log('You are not sure');
          }
        });
      };

      var timePickerCallback =function(val) {
        if (typeof (val) === 'undefined') {
        } else {
          var selectedTime = new Date(val * 1000);
          var hour = selectedTime.getUTCHours();
          var minutes = selectedTime.getUTCMinutes();
          var _hour = hour;
          var _minutes = minutes;
          if (hour < 10) {
            _hour = "0" + hour;
          }
          if (minutes < 10) {
            _minutes = "0" + minutes;
          }
          return _hour + ":" + _minutes;
          //$scope.needTime = _hour + ":" + _minutes;
        }
      };
      $scope.timePickerObject = {
        inputEpochTime: ((new Date().getHours()) * 60 * 60),  //Optional
        step: 10,  //Optional
        format: 24,  //Optional
        titleLabel: '选择时间',  //Optional
        setLabel: '确 定',  //Optional
        closeLabel: '关 闭',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
          $scope.newData.needDate = timePickerCallback(val);
        }
      };
      //新增project
      //create the new topic modal that we will use later
      $ionicModal.fromTemplateUrl('templates/planNew.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.newPlanModal = modal;
      });
      $scope.showNewPlan = function () {
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }

        $scope.newData = initBeanData;
        //加载新的工地列表
        loadProjects();

        $log.debug($scope.newData);
        //字典可能发生变动（如设置页，强制刷新字典）
        $scope.dictionary = Dics.getDictionary();

        $scope._contractID = "";
        $scope.newPlanModal.show();
      };
      $scope.saveNewPlan = function () {
        $ionicLoading.show();
        $log.debug("新增的工地计划：", $scope.newData);
        Plans.save($scope.newData).$promise.then(function (response) {
          $ionicLoading.hide();
          if (response.success) {
            $scope.thePlanId = response['data.customerPlanID'];
            $scope.selectTabWithIndex(0);
            $scope.closeNewPlanModal();
            $timeout(function () {
              $scope.doRefresh_auditing();
            }, 400);
          } else {
            $ionicLoading.show({
              noBackdrop: true,
              template: response.message,
              duration: 1000
            });
          }

        }, $rootScope.requestErrorHandler({}, null));
      };

      $scope.closeNewPlanModal = function () {
        if (window.StatusBar) {
          StatusBar.styleLightContent();
        }
        $scope.newData = {};
        $scope.newPlanModal.hide();
      };

      /*$scope.showUpdatePlan = function (id) {
       $log.debug("showUpdatePlan:", id);
       }*/

      $scope.selectTabWithIndex = function (index) {
        $ionicTabsDelegate.select(index);
      };

      //修改plan
      //create the  modify plan modal that we will use later
      $ionicModal.fromTemplateUrl('templates/planUpdate.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.updatePlanModal = modal;
      });

      //save  modify project
      $scope.saveUpdatePlan = function (id) {
        $log.debug('update plan data:', $scope.updatePlanModal);
        $ionicLoading.show();

        Plans.update($scope.updateData, id).$promise.then(function (response) {
          $ionicLoading.hide();
          if (response.success) {
            $scope.thePlanId = response['data.customerPlanID'];
            $scope.selectTabWithIndex(0);
            $scope.closeUpdatePlanModal();
            $timeout(function () {
              $scope.doRefresh_auditing();
            }, 400);
          } else {
            $ionicLoading.show({
              noBackdrop: true,
              template: response.message,
              duration: 1000
            });
          }
        }, $rootScope.requestErrorHandler({}, null));
      };

      $scope.showUpdatePlan = function (id) {
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }

        //加载新的工地列表
        loadProjects();

        //字典可能发生变动（如设置页，强制刷新字典）
        $scope.dictionary = Dics.getDictionary();

        var selectedPlan = Plans.getAuditingPlanById(id);
        $log.debug(selectedPlan);
        if (selectedPlan) {
          $scope.updatePlanId = selectedPlan.customerPlanID;
          $scope._contractID = selectedPlan.contractID;

          $scope.updateData = {
            contractID: selectedPlan.contractID,
            constructUnit: selectedPlan.constructUnit,
            projectName: selectedPlan.projectName,
            projectAddr: selectedPlan.projectAddr,
            consPos: selectedPlan.consPos,
            conStrength: selectedPlan.conStrength,
            slump: selectedPlan.slump,
            castMode: selectedPlan.castMode,
            planCube: selectedPlan.planCube,
            needDate: selectedPlan.needDate,
            planDate: new Date(selectedPlan.planDate),
            tel: selectedPlan.tel,
            linkMan: selectedPlan.linkMan
          };

          var epochTime = new Date().getHours();
          if ($scope.updateData.needDate && $scope.updateData.needDate.length > 2) {
            var xTimes = $scope.updateData.needDate.split(":");
            var xTime = xTimes[0];
            if (xTimes[0].indexOf('0') === 1) {
              xTime = parseInt(xTimes[0].substring(1));
            } else {
              xTime = parseInt(xTimes[0]);
            }
            if (xTime < 24 && xTime>0) {
              epochTime = xTime;
            }
          }
          $scope.timePickerObject = {
            inputEpochTime: (epochTime * 60 * 60),  //Optional
            step: 10,  //Optional
            format: 24,  //Optional
            titleLabel: '选择时间',  //Optional
            setLabel: '确 定',  //Optional
            closeLabel: '关 闭',  //Optional
            setButtonType: 'button-positive',  //Optional
            closeButtonType: 'button-stable',  //Optional
            callback: function (val) {    //Mandatory
              $scope.updateData.needDate = timePickerCallback(val);
            }
          };

          $scope.updatePlanModal.show();
        } else {
          $ionicLoading.show({
            noBackdrop: true,
            template: "选择的工程信息异常",
            duration: 1000
          });
        }
      };
      // close modify project modal
      $scope.closeUpdatePlanModal = function () {
        if (window.StatusBar) {
          StatusBar.styleLightContent();
        }
        $scope.updatePlanModal.hide();
      };
    });
})();
