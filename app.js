// app.js

(function(){


  var DEV = false;


  var app = angular.module('jsonymer', ['ngRoute']);

  app.config(function($routeProvider, $locationProvider){

    $routeProvider
      .when("/:section", {
        templateUrl : function(params){
          return "pages/" + params.section + ".html"
        },
        controller : "ContentController"
      }).otherwise({
        templateUrl : function(params){
          console.log("Otherwise:",params);
        }
      });

      // $locationProvider.html5Mode(true);

  });


  app.controller("MainController", function($scope){

    if(DEV){
      $scope.basePath = "/anson/jsonymer/gh-pages/";
      $scope.baseUrl = "";
    }
    else{
      $scope.basePath = "/jsonymer/";
      $scope.baseUrl = "http://ansonlouis.github.io/jsonymer";
    }
    console.log("MAIN:",$scope);

  });



  app.controller('NavController', function($scope, $route, $routeParams, $location){
    
    $scope.sections = ["About", "Demo", "Docs", "Download"];
    console.log($location.$$path);
    if($location.$$path === "/" || $location.$$path === "/jsonymer"){
      $scope.active = $scope.sections[0];
      history.pushState({}, null, "http://ansonlouis.github.io/jsonymer/#" + $scope.active.toLowerCase());
    }

    $scope.isActive = function(section){
      return $scope.active === section;
    }

  });  


  app.controller('ContentController', function($scope, $route, $routeParams, $location){
    $scope.$parent.active = $routeParams.section;
  });

  app.controller('PrismController', function($scope, $element){
    var text = $element.text();
    $element.text(text.trim());
    Prism.highlightElement($element[0]);
  });



  app.controller('DocsController', function($scope, $element){
    console.log($scope);

    $scope.sections = [

      { label : "Overall", head : true },
      { label : "Basic Use" },
      { label : "The jsonymer data structure" },
      { label : "Dealing with falsey values and types" },
      { label : "Dealing with errors" },

      { label : "Methods & Properties", head : true },
      { label : "toJSON()" },
      { label : "setError()" },
      { label : "getError()" },
      { label : "clearError()" },
      { label : "hasError()" },
      { label : "checkDuplicateKeys()" },

      { label : "Events", head : true },
      { label : "beforeItemAdded" },
      { label : "itemAdded" },
      { label : "beforeItemRemoved" },
      { label : "itemRemoved" },
      { label : "keyValueChanged" },
      { label : "propertyValueChanged" },
      { label : "beforeItemTypeRemoved" },
      { label : "itemTypeRemoved" },
      { label : "edit" },
      { label : "dirty" },
      { label : "clean" }

    ];


    $scope.activeIndex = 1;
    $scope.active = $scope.sections[$scope.activeIndex].label;


    $scope.isActive = function(section){
      return $scope.active === section.label;
    };

    $scope.makeActive = function(index, scrollTo){
      var section = $scope.sections[index];
      if(!section.head){
        $scope.active = section.label;
        $scope.activeIndex = index;
        scrollTo && goToSection($scope.active);        
      }
    };


    var $nav = $element.find('ul#doc-items');
    var nav_offset = null;
    var nav_fixed = false;
    var nav_buffer = 20;


    var getNextSection = function(index){

      while(++index < $scope.sections.length){
        var section = $scope.sections[index];
        if(section && !section.head){
          return index;
        }
      }

      return null;

    };

    var getPreviousSection = function(index){

      while(--index >= 0){
        var section = $scope.sections[index];
        if(section && !section.head){
          return index;
        }
      }

      return null;

    };    

    var autoCheck = true;
    var onScroll = function(){
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
        if(activeSection.offset().top <= scrollTop){

          // console.log("ITS UNDER!");

          var nextIndex = getNextSection($scope.activeIndex);
          if(nextIndex){
            var nextSection = $scope.sections[nextIndex];
            nextSection = $element.find('a[target="' + nextSection.label + '"]');
            if(nextSection.offset().top < scrollTop){
              $scope.makeActive(nextIndex, false);
              $scope.$apply();
            }
          }

        }else{

          var previousIndex = getPreviousSection($scope.activeIndex);
          if(previousIndex){
            var prevSection = $scope.sections[previousIndex];
            prevSection = $element.find('a[target="' + prevSection.label + '"]');
            $scope.makeActive(previousIndex, false);
            $scope.$apply();
          }        

        }
      }

    };    


    var goToSection = function(section){
      var link = $element.find('a[target="' + section + '"]');
      if(link.length){
        autoCheck = false;
        window.scrollTo(0, link.offset().top);
        setTimeout(function(){ autoCheck = true; }, 10);
      }
    };




    $scope.$on('$destroy', function(){
      console.log("docs destroyed");
      $(window).unbind('scroll', onScroll);
    });

    setTimeout(function(){
      nav_offset = $nav.offset().top;
      $(window).bind('scroll', onScroll);
    },1000);


    // $scope.nav = [];

    // var parseToc = function(str){

    //   var reg = /(-\s(.*))|(###(.*))/gi;
    //   var parts = str.match(reg);

    //   for(var i=0; i<parts.length; i++){
    //     var p = parts[i];
    //     if(p[0] === "-"){
    //       $scope.nav.push(p.substr(2));
    //     }else{
    //       $scope.nav.push(p.substr(3));
    //     }
    //   }
    //   console.log($scope.nav);
    //   $scope.$apply();

    // };

    // var parseContent = function(str){

    // };


    // $.get('README.md').done(function(response){

    //   var reg = /<!--parseStart-->([\S\s]*?)<!--parseEnd-->/gi;
    //   var pieces = reg.exec(response);
    //   var i = 0;

    //   while(pieces != null && pieces.length > 1){

    //     var piece = pieces[1];
    //     // console.log(piece);

    //     if(i === 0){
    //       parseToc(piece);
    //       i++;
    //     }else{
    //       parseContent(piece);
    //       return;
    //     }

    //     pieces = reg.exec(response);

    //   }




    // });

  });



})();





































