// // type-checking.js

// var expect = chai.expect;
// var element = document.getElementById('myJsonEditor');



// describe('Testing adding different falsey / truthy values', function(){


//   var wrap = document.getElementById('wrap');

//   var setup = function(done){

//     element = document.createElement('jsonymer-editor');
//     element.id = "myJsonEditor";
//     wrap.appendChild(element);

//     element.obj = {
//     };

  

//     setTimeout(function(){
//       done();
//     }, 0);

//   };

//   var cleanup = function(){
//     wrap.removeChild(element);
//     wrap.innerHTML = "";
//   };



//   beforeEach(setup);
//   afterEach(cleanup);



//   it('should add undefined value as "no type" item', function(){
//     var item = element.addItem(-1, "key", undefined);
//   });

//   it('should add undefined value as "no type" item', function(){
//     var item = element.addItem(-1, "key", null);
//   });

//   it('should add undefined value as "no type" item', function(){
//     var item = element.addItem(-1, "key", false);
//   });

//   it('should add undefined value as "no type" item', function(){
//     var item = element.addItem(-1, "key", undefined);
//   });

// });