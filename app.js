// app.js

(function(){


  var DEV = false;


  var app = angular.module('jsonymer', ['ngRoute']);

  app.config(function($routeProvider, $locationProvider){

    $routeProvider
      .when("/:section", {
        templateUrl : function(params){
          return _cfg.baseUrl + "/pages/" + params.section + ".html"
        },
        controller : "ContentController"
      }).otherwise({
        templateUrl : function(params){
          console.log("Otherwise:",params);
        }
      });

      // $locationProvider.html5Mode(true);

  });





  app.controller('NavController', function($scope, $route, $routeParams, $location){
    
    $scope.sections = ["About", "Demo", "Docs", "Download"];

    if($location.$$path === "/" || $location.$$path === ""){
      $scope.active = $scope.sections[0];
      history.pushState({}, null, _cfg.baseUrl + "/#" + $scope.active.toLowerCase());
    }

    $scope.isActive = function(section){
      return $scope.active === section.toLowerCase();
    };

  });  


  app.controller('ContentController', function($scope, $route, $routeParams, $location){
    $scope.$parent.active = $routeParams.section;
  });

  app.controller('PrismController', function($scope, $element){
    var text = $element.text();
    $element.text(text.trim());
    Prism.highlightElement($element[0]);
  });






  app.directive('docItem', function(){
    return {
      restrict: "E",
      scope: {
        methoddata: "@methoddata"
      },
      templateUrl: _cfg.baseUrl + "/pages/doc-item.html",
      controller: "DocItemController"
    };
  });

  app.controller('DocItemController', function($scope, $element){
    $scope.method = {};
    $scope.method = JSON.parse($scope.methoddata);
  });




  app.directive('eventItem', function(){
    return {
      restrict: "E",
      scope: {
        eventdata: "@eventdata"
      },
      templateUrl: _cfg.baseUrl + "/pages/event-item.html",
      controller: "EventItemController"
    };
  });

  app.controller('EventItemController', function($scope, $element){
    $scope.event = {};
    $scope.event = JSON.parse($scope.eventdata);
  });










  app.controller('DocsController', function($scope, $element, $http){

    $scope.overall = {
      label : "Overall",
      sections : [
        { name : "Basic Use" },
        { name : "The jsonymer data structure" },
        { name : "Dealing with falsey values and types" },
        { name : "Dealing with errors" }
      ]
    };

    $scope.methods = {
      label : "Methods & Properties",
      sections : [

      ]
    };

    $scope.events = {
      label : "Events",
      sections : [

      ]
    };


    // $scope.sections = [

    //   // { label : "Overall", head : true },


    //   { label : "Methods & Properties", head : true },
    //   { label : "toJSON()" },
    //   { label : "setError()" },
    //   { label : "getError()" },
    //   { label : "clearError()" },
    //   { label : "hasError()" },
    //   { label : "removeItem()" },
    //   { label : "setKeyValue()" },
    //   { label : "setPropertyValue()" },
    //   { label : "removeValue()" },
    //   { label : "getNextItem()" },
    //   { label : "getNextSibling()" },
    //   { label : "getParent()" },
    //   { label : "createNewItem()" },
    //   { label : "getAvailableKey()" },

    //   { label : "Events", head : true },
    //   { label : "beforeItemAdded" },
    //   { label : "itemAdded" },
    //   { label : "beforeItemRemoved" },
    //   { label : "itemRemoved" },
    //   { label : "keyValueChanged" },
    //   { label : "propertyValueChanged" },
    //   { label : "beforeItemTypeRemoved" },
    //   { label : "itemTypeRemoved" },
    //   { label : "edit" },
    //   { label : "dirty" },
    //   { label : "clean" }

    // ];

    $scope.allSections = [];


    $scope.activeIndex = 0;
    $scope.active = $scope.overall.sections[$scope.activeIndex].name;

    var addToKeyMap = function(sections){
      for(var i=0; i<sections.length; i++){
        var sect = sections[i];
        sect.idx = $scope.allSections.length;
        $scope.allSections.push(sect);
      }
    };



    $scope.init = function(){
      $http.get(_cfg.baseUrl + "/pages/docs.json")
      .success(function(data){

        $scope.allSections = [];
        $scope.methods.sections = data.functions;
        $scope.events.sections = data.events;

        addToKeyMap($scope.overall.sections);
        addToKeyMap($scope.methods.sections);
        addToKeyMap($scope.events.sections);

      });
    };


    $scope.isActive = function(section){
      return $scope.active === section.name;
    };

    $scope.makeActive = function(index, scrollTo){
      var section = $scope.allSections[index];
      if(!section.head){
        $scope.active = section.name;
        $scope.activeIndex = index;
        scrollTo && goToSection($scope.active);        
      }
    };


    var $nav = $element.find('div#doc-items');
    var nav_offset = null;
    var nav_fixed = false;
    var nav_buffer = 20;


    var getNextSection = function(index){

      while(++index < $scope.allSections.length){
        var section = $scope.allSections[index];
        if(section && !section.head){
          return index;
        }
      }

      return null;

    };

    var getPreviousSection = function(index){

      while(--index >= 0){
        var section = $scope.allSections[index];
        if(section && !section.head){
          return index;
        }
      }

      return null;

    };    

    var autoCheck = true;
    var onScrollWindow = function(){
      if(autoCheck){
        var scrollTop = window.scrollY;

        if(scrollTop + nav_buffer > nav_offset && !nav_fixed){
          nav_fixed = true;
          $nav.css({
            "position" : "fixed",
            "top" : "-20px"
          });
        }else if(scrollTop + nav_buffer < nav_offset && nav_fixed){
          nav_fixed = false;
          $nav.css({
            "position" : "absolute",
            "top" : ""
          });        
        }
        
        var activeSection = $element.find('a[target="' + $scope.active + '"]');

        if(activeSection.length){

          if(activeSection.offset().top <= scrollTop){

            var nextIndex = getNextSection($scope.activeIndex);
            if(nextIndex){
              var nextSection = $scope.allSections[nextIndex];
              nextSection = $element.find('a[target="' + nextSection.name + '"]');
              if(nextSection.length && nextSection.offset().top < scrollTop){
                $scope.makeActive(nextIndex, false);
                $scope.$apply();
              }
            }

          }else{
            var previousIndex = getPreviousSection($scope.activeIndex);
            if(previousIndex !== null){
              var prevSection = $scope.allSections[previousIndex];
              prevSection = $element.find('a[target="' + prevSection.name + '"]');
              $scope.makeActive(previousIndex, false);
              $scope.$apply();
            }
          }

        }
      }

    };    


    var onScrollNav = function(e){
      var scrollTop = $nav[0].scrollTop;
      // scroll up
      if(e.originalEvent.wheelDelta >=  0 && scrollTop === 0){
        e.stopPropagation();
        return false;
      }
      // scroll down
      else if(e.originalEvent.wheelDelta < 0 && $nav[0].scrollTop + scrollTop >= $nav[0].clientHeight){
        e.stopPropagation();
        return false;
      }
    }


    var goToSection = function(section){
      var link = $element.find('a[target="' + section + '"]');
      if(link.length){
        autoCheck = false;
        window.scrollTo(0, link.offset().top);
        setTimeout(function(){ autoCheck = true; }, 10);
      }
    };




    $scope.$on('$destroy', function(){
      $(window).unbind('scroll', onScrollWindow);
      $nav.unbind('mousewheel', onScrollNav);

    });

    setTimeout(function(){
      nav_offset = $nav.offset().top;
      $(window).bind('scroll', onScrollWindow);
      $nav.bind('mousewheel', onScrollNav);
    },1000);


    $scope.init();

  });












})();





































