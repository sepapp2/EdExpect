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
//Set url of api calls
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
                  $scope.getExpectedPatients();
                }, function errorCallback(response) {
                  alert("Error Fetching Data, please reload page.")
            });
      });
      $scope.newPatient = function () {
        $scope.editing = false;
        $scope.openPatient = {
              "Name": null,
              "ReferringExpectations": [],
        }
        $scope.openPatient.CallDtm = new Date();

        //Set local scopes
        $scope.localPatient = [];
      };
      $scope.editPatient = function (patient) {

        //Get the selected patient info and load it into editing modal
        $scope.editing = $scope.expectedPatients.indexOf(patient);
        $scope.openPatient = angular.copy(patient);

        //Set local scopes
        $scope.localPatient = [];
        //Set arrivaldtm
        $scope.ArrivalDtm = new Date();
        $scope.localPatient.MRNMatch = false;
        $scope.localPatient.VisitIDMatch = false;
        //Seperate out datetime into date and time objects
        $scope.openPatient.CallDtm = new Date($scope.openPatient.CallDtm);
        $scope.openPatient.ExpectedDtm = new Date($scope.openPatient.ExpectedDtm);
        $scope.openPatient.ArrivalDtm = new Date($scope.openPatient.ArrivalDtm);
        $scope.openPatient.ReportDtm = new Date($scope.openPatient.ReportDtm);

        //Set Patient DOB to Date objects
        $scope.localPatient.DOB = new Date($scope.openPatient.DOB);

        //check if existing clientId and VisitID
        if ($scope.openPatient.ClientId !== null && $scope.openPatient.VisitId !== null){
          $http.get($scope.baseURL + "Visits?$filter=ClientGUID%20eq%20" + $scope.openPatient.ClientId + " and VisitGUID%20eq%20" + $scope.openPatient.VisitId)
            .then(function(response) {
              if(response.data.value.length > 0){
              $scope.localPatient.MRN = response.data.value[0].IDCode;
              $scope.localPatient.VisitId = response.data.value[0].VisitIDCode;
              $scope.visitID();
            }
            }, function errorCallback(response) {
              alert("Error Checking Visit Codes, please try again.")
            });
        }
        $http.get($scope.baseURL + 'ExpectedPatients?$expand=Visit&filter=Active%20eq%20true%20and%20Id%20eq%20'+ $scope.openPatient.Id)
        .then(function(response) {
        }, function errorCallback(response) {
          alert("Error Fetching Data, please reload page.")
      });
        $http.get($scope.baseURL + 'CareProviders?$filter=GUID%20eq%20' + $scope.openPatient.AcceptingProviderId)
          .then(function(response) {
            if(response.data.value.length > 0){
              $scope.providerSelectedInitial = response.data.value[0].ProviderDisplayName;
            }
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
      };
      $scope.savePatient = function (patient) {
        $scope.openPatient.ReportDtm = $filter('date')($scope.openPatient.ReportDtm, "yyyy-MM-ddT")+$filter('date')($scope.openPatient.ReportDtm, "HH:mm:ss-05:00");
        $scope.openPatient.DOB = $filter('date')($scope.localPatient.DOB, "yyyy-MM-dd")
        if ($scope.editing ===false){
          $http.post($scope.baseURL + 'ExpectedPatients',  $scope.openPatient)
            .then(function(response) {
                $scope.getExpectedPatients();
              }, function errorCallback(response) {
                alert("Error Posting Data, please try again.")
          });
        }
        else {
        //pull in which patient was edited
        $scope.expectedPatients[$scope.editing] = $scope.openPatient;
        console.log($scope.expectedPatients[$scope.editing]);
        delete $scope.openPatient.Location;
        //Save updated record
        $http.put($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id,  $scope.openPatient)
          .then(function(response) {
            $scope.getExpectedPatients();
          }, function errorCallback(response) {
            alert("Error Posting Data, please try again.")
        });
       };
     };

     //Toggle if Patient is Active
     $scope.togglePatient = function(patient){
       $scope.expectedPatients[$scope.editing] = $scope.openPatient;
       delete $scope.openPatient.Location;
       if ($scope.openPatient.Active == true){
         $scope.openPatient.Active = false;
         $http.patch($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id, $scope.openPatient)
           .then(function(response) {
              $scope.getExpectedPatients();
             }, function errorCallback(response) {
               alert("Error Posting Data, please try again.")
           });
       } else {
         $scope.expectedPatients[$scope.editing] = $scope.openPatient;
         $scope.openPatient.Active = true;
         $http.patch($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id, $scope.openPatient)
           .then(function(response) {
              $scope.getExpectedPatients();
             }, function errorCallback(response) {
               alert("Error Posting Data, please try again.")
           });
       }
     }
      //Mark Patient as arrived and save dateTimeFilter
      $scope.arrivedPatient = function(patient){
        $scope.openPatient.ArrivalDtm = $scope.ArrivalDtm;
        $scope.openPatient.Active = false;
        delete $scope.openPatient.Location;
        $http.patch($scope.baseURL + 'ExpectedPatients/' + $scope.openPatient.Id, $scope.openPatient)
          .then(function(response) {
              $scope.getExpectedPatients();
            }, function errorCallback(response) {
              alert("Error Posting Data, please try again.")
          })
      }

      //set search filter at top of page to blank
      $scope.searchExpected   = '';     // set the default search/filter term

      //ReferringExpectations function
      $scope.ReferringExpectations = ['Admission', 'Work-Up', 'UK Physician/Clinic', 'External Referring'];
      // Toggle selection for a given Expectation
      $scope.toggleSelection = function toggleSelection(expectationName) {
        var idx = $scope.openPatient.ReferringExpectations.indexOf(expectationName);

        // Is currently selected
        if (idx > -1) {
          $scope.openPatient.ReferringExpectations.splice(idx, 1);
        }

        // Is newly selected
        else {
          $scope.openPatient.ReferringExpectations.push(expectationName);
        }
      };

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
         $scope.formatDOB();
      }

      //Setting DOB to simple format
      $scope.formatDOB = function formatDOB (){
         $scope.openPatient.DOB = $filter('date')($scope.localPatient.DOB, "yyyy-MM-dd")
      }

      //Function to check visitIDCode, Client ID, name and DOB and return back matching GUIDs
      $scope.visitID = function visitID() {
        //Check if MRN Correct
        $http.get($scope.baseURL + "Visits?$filter=IDCode%20eq%20'" + $scope.localPatient.MRN + "'")
          .then(function(response) {
            if(response.data.value.length > 0){
              $scope.localPatient.MRNMatch = true;
            }
            else {
              $scope.localPatient.MRNMatch = false;
            };
          }, function errorCallback(response) {
            alert("Error Posting Data, please try again.")
        });

        //Check if Visit ID correct
        $http.get($scope.baseURL + "Visits?$filter=VisitIDCode%20eq%20'" + $scope.localPatient.VisitId + "'")
          .then(function(response) {
            if(response.data.value.length > 0){
              $scope.localPatient.VisitIDMatch = true;
            }
            else {
              $scope.localPatient.VisitIDMatch = false;
            };
          }, function errorCallback(response) {
            alert("Error Posting Data, please try again.")
        });

        //Check if MRN and Visit ID are correct
        $http.get($scope.baseURL + "Visits?$filter=IDCode%20eq%20'" + $scope.localPatient.MRN + "' and VisitIDCode%20eq%20'" + $scope.localPatient.VisitId + "'")
          .then(function(response) {
            if(response.data.value.length < 1){
               $scope.openPatient.ClientId = 0;
               $scope.openPatient.VisitId = 0;
            }
            else {
              $http.get($scope.baseURL + "ExpectedPatients?$filter=ClientId%20eq%20" + $scope.openPatient.VisitId + " and VisitId%20eq%20" + $scope.openPatient.VisitId)
                .then(function(responseExisting) {
                  alert("A record has already been sent to SCM.  Choosing to send this record to SCM will overwrite any existing data.")
                  $scope.openPatient.ClientId = response.data.value[0].ClientGUID;
                  $scope.openPatient.VisitId = response.data.value[0].VisitGUID;
                }, function errorCallback(response) {
                  alert("Error Checking Visit Codes, please try again.")
                });
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

      //Refresh Expected Patients
      $scope.getExpectedPatients = function(searchInactive){
        if ($scope.searchInactive === true){
          $http.get($scope.baseURL + 'ExpectedPatients?$expand=Location&$filter=Active%20eq%20false%20and%20ExpectedDtm%20gt%20' + moment().subtract(6, 'hours').format())
            .then(function(response) {
                $scope.expectedPatients = response.data.value;
              }, function errorCallback(response) {
                alert("Error Fetching Data, please reload page.")
            });
        } else {
        $http.get($scope.baseURL + 'ExpectedPatients?$expand=Location&$filter=Active%20eq%20true')
          .then(function(response) {
              $scope.expectedPatients = response.data.value;
            }, function errorCallback(response) {
              alert("Error Posting Data, please try again.")
          });
        }
      }
     });
