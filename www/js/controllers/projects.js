/**
 * Created by Sloong on 2015/12/20.
 */
(function () {
  'use strict';
  angular.module('gaia.controllers')
    .controller('ProjectsCtrl', function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $ionicPopup, $timeout, $state, $location, $ionicListDelegate, $log, User, Projects) {
      $log.debug('ProjectsCtrl');
      $scope.projects = Projects.getProjects();
      $scope.hasNextPage = Projects.hasNextPage();
      $scope.loadError = false;
      $log.debug('page load, has next page ?', $scope.hasNextPage);

      $scope.doRefresh = function () {
        $log.debug('do refresh');
        Projects.refresh().$promise.then(function (response) {
          $log.debug('do refresh complete');
          $scope.projects = response.data;
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
        Projects.pagination().$promise.then(function (response) {
          $log.debug('load more complet');
          $scope.hasNextPage = false;
          $scope.loadError = false;
          $timeout(function () {
            $scope.hasNextPage = Projects.hasNextPage();
            $log.debug('has next page ? ', $scope.hasNextPage);
          }, 100);

          $scope.projects = $scope.projects.concat(response.data);
        }, $rootScope.requestErrorHandler({
          noBackdrop: true
        }, function () {
          $scope.loadError = true;
        })).finally(function () {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      };

      //删除 project
      $scope.removeProject = function (id) {
        $ionicListDelegate.$getByHandle('test-list').closeOptionButtons();

        var confirmPopup = $ionicPopup.confirm({
          title: '确认',
          template: '确认删除该工地？',
          cancelText:"取消",
          okText: '确认',
          okType:"button-positive"
        });
        confirmPopup.then(function (res) {
          if (res) {
            Projects.remove(id).$promise.then(function (response) {
              if (response.success) {
                $timeout(function () {
                  $scope.doRefresh();
                }, 400);
              } else {
                $ionicLoading.show({
                  noBackdrop: true,
                  template: response.message,
                  duration: 1000
                });
              }
            }, $rootScope.requestErrorHandler({}, null));
          } else {
            $log.debug('You are not sure');
          }
        });
      };

      //记录 新增和修改后的projectId，方便跳转到project details
      $scope.theProjectId = "";

      //关闭modal 页面时，跳转到project详情页面
      /*$scope.$on('modal.hidden', function () {
       if($scope.theProjectId){
       $timeout(function(){
       $location.path('/app/project/'+$scope.theProjectId);
       },300)
       }
       });*/

      //新增project
      $ionicModal.fromTemplateUrl('templates/projectNew.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.newProjectModal = modal;
      });

      $scope.newData = {
        contractName: '',
        projectName: '',
        projectAddr: '',
        linkMan: '',
        tel: ''
      };

      //save new project
      $scope.saveNewProject = function () {
        $log.debug('new project data:', $scope.newProjectModal);

        $ionicLoading.show();

        Projects.save($scope.newData).$promise.then(function (response) {
          $ionicLoading.hide();
          if (response.success) {
            $scope.theProjectId = response['data.projectID'];
            $scope.closeNewProjectModal();
            $timeout(function () {
              $scope.doRefresh();
            }, 400);
          } else {
            $ionicLoading.show({
              noBackdrop: true,
              template: response.message,
              duration: 1000
            });
          }

        }, $rootScope.requestErrorHandler());
      };

      $scope.showNewProjectModal = function () {
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
        $scope.newProjectModal.show();
      };
      $scope.closeNewProjectModal = function () {
        if (window.StatusBar) {
          StatusBar.styleLightContent();
        }
        $scope.newData = {
          contractName: '',
          projectName: '',
          projectAddr: '',
          linkMan: '',
          tel: ''
        };
        $scope.newProjectModal.hide();
      };


      //修改project
      //create the  modify project modal that we will use later
      $ionicModal.fromTemplateUrl('templates/projectUpdate.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.updateProjectModal = modal;
      });

      //save  modify project
      $scope.saveUpdateProject = function (id) {
        $log.debug('update project data:', $scope.updateProjectModal);
        $ionicLoading.show();

        Projects.update($scope.updateData, id).$promise.then(function (response) {
          $ionicLoading.hide();
          $scope.theProjectId = response['data.projectID'];
          $scope.closeUpdateProjectModal();
          $timeout(function () {
            /*$state.go('app.project', {
             id:$scope.theProjectId
             });
             $timeout(function(){
             $scope.doRefresh();
             },300);*/
            $scope.doRefresh();
          }, 400);
        }, $rootScope.requestErrorHandler());
      };

      $scope.showUpdateProjectModal = function (id) {
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
        $ionicListDelegate.$getByHandle('test-list').closeOptionButtons();
        var selectedProject = Projects.getById(id);
        if (selectedProject) {
          $scope.updateProjectId = selectedProject.projectID;
          $scope.updateData = {
            projectName: selectedProject.projectName,
            projectAddr: selectedProject.projectAddr,
            linkMan: selectedProject.linkMan,
            tel: selectedProject.tel
          };
          $scope.updateProjectModal.show();
        } else {
          $ionicLoading.show({
            noBackdrop: true,
            template: "选择的工程信息异常",
            duration: 1000
          });
        }
      };
      // close modify project modal
      $scope.closeUpdateProjectModal = function () {
        if (window.StatusBar) {
          StatusBar.styleLightContent();
        }
        $scope.updateProjectModal.hide();
      };
    });
})();
