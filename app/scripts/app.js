'use strict';

/**
 * @ngdoc overview
 * @name edExpectApp
 * @description
 * # edExpectApp
 *
 * Main module of the application.
 */
angular
  .module('edExpectApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngTagsInput',
    'angucomplete-alt',
    'ui.bootstrap.datetimepicker'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
