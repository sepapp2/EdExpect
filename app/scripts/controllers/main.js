'use strict';

/**
 * @ngdoc function
 * @name edExpectApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the edExpectApp
 */
angular.module('edExpectApp')
  .controller('MainCtrl', function ($scope, $http, $filter, $location) {
    $scope.baseURL = '//'+ $location.host() +'/api/';

    $http.get($scope.baseURL + 'Genders')
      .then(function(response) {
          $scope.genderOptions = response.data.value;
      }, function errorCallback(response) {
        $scope.errors = response;
        alert("Error Fetching Data, please reload page.")
      });
    $http.get($scope.baseURL + 'EDLocations')
      .then(function(response) {
          $scope.locationOptions = response.data.value;
          $http.get($scope.baseURL + 'CareProviders?$filter=TypeCode%20eq%20%27Physician%27')
            .then(function(response) {
                $scope.careProviderOptions = response.data.value;
                $http.get($scope.baseURL + 'ExpectedPatients')
                  .then(function(response) {
                      $scope.expectedPatients = response.data.value;
                    }, function errorCallback(response) {
                      alert("Error Fetching Data, please reload page.")
                  });
                }, function errorCallback(response) {
                  alert("Error Fetching Data, please reload page.")
            });
      });
      $scope.newPatient = function () {
        $scope.editing = false;
        $scope.openPatient = {
              "Name": null,
              "ClientGUID": 0,
              "ChartGUID": 0,
              "VisitGUID": 0
        }
          // $scope.openPatient = {
          //   "Active": true,
          //   "Name": null,
          //   "PCP": null,
          //   "DOB": null,
          //   "Age": 0,
          //   "LocationId": null,
          //   "BedType": null,
          //   "GenderId": null,
          //   "Insurance": null,
          //   "Resuscitation": null,
          //   "ChiefComplaint": null,
          //   "ReportDate": null,
          //   "ReportTime": null,
          //   "HeartRate": null,
          //   "RespiratoryRate": null,
          //   "SystolicPressure": null,
          //   "DiastolicPressure": null,
          //   "TemperatureC": null,
          //   "TemperatureF": null,
          //   "OxygenSaturation": null,
          //   "NurseReport": null,
          //   "Transport": null,
          //   "AcceptingProviderId": null,
          //   "EDLocationId": null,
          //   "ExpectedDate": null,
          //   "ExpectedTime": null,
          //   "ArrivalFrom": null,
          //   "ArrivalDate": null,
          //   "ArrivalTime": null,
          //   "NoShow": false,
          //   "CallStartDate": null,
          //   "CallStartTime": null,
          //   "CallEndDate": null,
          //   "CallEndTime": null,
          //   "Disposition": null,
          //   "TraveledAbroad": false,
          //   "NosocomialInfection": null,
          //   "EKG": null,
          //   "Type": null,
          //   "ConsultType": null,
          //   "Nurse": null,
          //   "Agents": [],
          //   "ReferringName": null,
          //   "ReferringCity": null,
          //   "ReferringPhone": null,
          //   "ReferringHospital": null,
          //   "ReferringExpectations": [],
          //   "Comment": null,
          //   "Summary": null,
          //   "IDCode": null,
          //   "VisitIDCode": null,
          //   "CallStartDtm": null,
          //   "CallEndDtm": null,
          //   "ReportDtm": null,
          //   "ArrivalDtm": null,
          //   "ExpectedDtm": null
          // }

          //Set local scopes
          $scope.localPatient = [];
          $scope.Agents = [];


          // $scope.localPatient.CallStartDate = new Date();
          // $scope.localPatient.CallStartTime = new Date();
          // $scope.localPatient.CallEndDate = new Date();
          // $scope.localPatient.CallEndTime = new Date();
          // $scope.localPatient.DOB = new Date();
      };
      $scope.editPatient = function (patient) {

        //Get the selected patient info and load it into editing modal
        $scope.editing = $scope.expectedPatients.indexOf(patient);
        $scope.openPatient = angular.copy(patient);

        //Set local scopes
        $scope.localPatient = [];
        $scope.Agents = [];
        //Seperate out datetime into date and time objects
        $scope.localPatient.CallStartDate = new Date($scope.openPatient.CallStartDtm);
        $scope.localPatient.CallStartTime = new Date($scope.openPatient.CallStartDtm);
        $scope.localPatient.CallEndDate = new Date($scope.openPatient.CallEndDtm);
        $scope.localPatient.CallEndTime = new Date($scope.openPatient.CallEndDtm);
        $scope.openPatient.ExpectedDtm = new Date($scope.openPatient.ExpectedDtm);
        $scope.openPatient.ArrivalDtm = new Date($scope.openPatient.ArrivalDtm);
        $scope.openPatient.ReportDtm = new Date($scope.openPatient.ReportDtm);
        //Iterate over agents and load into local agent scope tagging box
        angular.forEach($scope.openPatient.Agents, function(value){
          $scope.Agents.push(value);
        });

        //Set Patient DOB to Date objects
        $scope.localPatient.DOB = new Date($scope.openPatient.DOB);

        $http.get($scope.baseURL + 'CareProviders?$filter=GUID%20eq%20' + $scope.openPatient.AcceptingProviderId)
          .then(function(response) {
            $scope.providerSelectedInitial = response.data.value[0].ProviderDisplayName;
          }, function errorCallback(response) {
            alert("Error Fetching Data, please reload page.")
        });

        $scope.providerSelected = function(selected) {
          if (selected) {
            $scope.openPatient.AcceptingProviderId = selected.description.GUID;
          } else {
            $scope.openPatient.AcceptingProviderId = null;
          }
        }
        //$scope.openPatient.CallStartDate = new Date($scope.openPatient.CallStartDate);
        //$scope.openPatient.CallEndDate = new Date($scope.openPatient.CallEndDate);
            // $scope.openPatient.CallStartTime = $scope.openPatient.CallStartTime.split(':');
            // $scope.openPatient.CallStartTime = new Date(1970, 0, 0, $scope.openPatient.CallStartTime[0], $scope.openPatient.CallStartTime[1], $scope.openPatient.CallStartTime[2]);
            // $scope.openPatient.CallEndTime = $scope.openPatient.CallEndTime.split(':');
            // $scope.openPatient.CallEndTime = new Date(1970, 0, 0, $scope.openPatient.CallEndTime[0], $scope.openPatient.CallEndTime[1], $scope.openPatient.CallEndTime[2]);
      };
      $scope.savePatient = function (patient) {
        // $scope.openPatient.CallStartTime = $scope.openPatient.CallStartTime.getHours() +":"+ $scope.openPatient.CallStartTime.getMinutes() +":"+$scope.openPatient.CallStartTime.getSeconds();
        // $scope.openPatient.CallEndTime = $scope.openPatient.CallEndTime.getHours() +":"+ $scope.openPatient.CallEndTime.getMinutes() +":"+$scope.openPatient.CallEndTime.getSeconds();
        //Set Datetime to correct format
        $scope.openPatient.CallStartDtm = $filter('date')($scope.localPatient.CallStartDate, "yyyy-MM-ddT")+$filter('date')($scope.localPatient.CallStartTime, "HH:mm:ss-05:00");
        $scope.openPatient.CallEndDtm = $filter('date')($scope.localPatient.CallEndDate, "yyyy-MM-ddT")+$filter('date')($scope.localPatient.CallEndTime, "HH:mm:ss-05:00");
        $scope.openPatient.ExpectedDtm = $filter('date')($scope.openPatient.ExpectedDtm, "yyyy-MM-ddT")+$filter('date')($scope.openPatient.ExpectedDtm, "HH:mm:ss-05:00");
        $scope.openPatient.ArrivalDtm = $filter('date')($scope.openPatient.ArrivalDtm, "yyyy-MM-ddT")+$filter('date')($scope.openPatient.ArrivalDtm, "HH:mm:ss-05:00");
        $scope.openPatient.ReportDtm = $filter('date')($scope.openPatient.ReportDtm, "yyyy-MM-ddT")+$filter('date')($scope.openPatient.ReportDtm, "HH:mm:ss-05:00");
        $scope.openPatient.DOB = $filter('date')($scope.localPatient.DOB, "yyyy-MM-dd")
        //clear out existing agents array and push local values
        $scope.openPatient.Agents = [];
        angular.forEach($scope.Agents, function(value){
          $scope.openPatient.Agents.push(value.text);
        });
        //$scope.openPatient.CallStartDtm = new Date($scope.openPatient.CallStartDtm);
        //$scope.openPatient.CallStartDate.format('yyyy-mm-dd');
        // $scope.patientID = "";
        // $scope.patientID = $scope.openPatient.Id;
        // delete $scope.openPatient.Id;
        // $scope.openPatient.Agents = $scope.openPatient.Agents.text;
        // console.log($scope.openPatient.Agents);
        if ($scope.editing ===false){
          $http.post($scope.baseURL + 'ExpectedPatients',  $scope.openPatient)
            .then(function(response) {
              $http.get($scope.baseURL + 'ExpectedPatients')
                .then(function(response) {
                    $scope.expectedPatients = response.data.value;
                  }, function errorCallback(response) {
                    alert("Error Posting Data, please try again.")
                });
              }, function errorCallback(response) {
                alert("Error Posting Data, please try again.")
          });
        }
        else {
        //pull in which patient was edited
        $scope.expectedPatients[$scope.editing] = $scope.openPatient;
        //Save updated record
        $http.put($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id,  $scope.openPatient)
          .then(function(response) {
          }, function errorCallback(response) {
            alert("Error Posting Data, please try again.")
        });
       };
     };

     $scope.deletePatient = function(patient){
       $scope.expectedPatients[$scope.editing] = $scope.openPatient;
       $scope.openPatient.Active = false;
       $http.patch($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id, $scope.openPatient)
         .then(function(response) {
           $http.get($scope.baseURL + 'ExpectedPatients')
             .then(function(response) {
                 $scope.expectedPatients = response.data.value;
               }, function errorCallback(response) {
                 alert("Error Posting Data, please try again.")
             });
           }, function errorCallback(response) {
             alert("Error Posting Data, please try again.")
         });
     }
      //set search filter at top of page to blank
      $scope.searchExpected   = '';     // set the default search/filter term

      //Phone Validation
      $scope.phoneValidation = function (value) {
        var PHONE_REGEXP = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;
        if(PHONE_REGEXP.test(value)) {
                  // Valid input
                  $scope.phoneError = "has-success has-feedback";
                  $scope.phoneFeedback="glyphicon glyphicon-ok form-control-feedback";
              } else {
                  // Invalid input
                  $scope.phoneError = "has-error has-feedback";
                  $scope.phoneFeedback="glyphicon glyphicon-remove form-control-feedback";
                }
      };
      //Calculate the patient age from DOB
      $scope.calculateAge = function calculateAge() { // birthday is a date
        var ageDifMs = Date.now() - $scope.localPatient.DOB.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
         $scope.openPatient.Age = (Math.abs(ageDate.getUTCFullYear() - 1970));
      }

      //Function to check visitIDCode and return back matching GUIDs
      $scope.visitID = function visitID() { // birthday is a date
        $http.get($scope.baseURL + "Visits?$filter=VisitIDCode%20eq%20'" + $scope.openPatient.VisitIDCode + "'")
          .then(function(response) {
            if(response.data.value.length < 1){
               alert("No matching visit found.");
               $scope.openPatient.ChartGUID = 0;
               $scope.openPatient.VisitGUID = 0;
               $scope.openPatient.ClientGUID = 0;
            }
            else {
              $scope.openPatient.ChartGUID = response.data.value[0].ChartGUID;
              $scope.openPatient.VisitGUID = response.data.value[0].GUID;
              $scope.openPatient.ClientGUID = response.data.value[0].ClientGUID;
            }
          }, function errorCallback(response) {
            alert("Error Checking Visit Codes, please try again.")
          });
      }

      //Function to send data to SCM
      $scope.sendSCM = function sendSCM(patient) {
          $http.patch($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id, $scope.openPatient)
            .then(function(response) {
                  window.external.WrapUp(JSON.stringify($scope.openPatient));
                }, function errorCallback(response) {
                  alert("Error Sending to SCM, please try again.")
            });
      }
    //   $scope.countrySelected = function(selected) {
    //     if (selected) {
    //       alert("hello");
    //       //window.alert('You have selected ' + selected.title);
    //     } else {
    //       console.log('cleared');
    //     }
    //   };
     });
