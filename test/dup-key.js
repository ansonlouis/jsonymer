// general-tests.js

// var expect = require('chai').expect;

var chai = (chai || require('chai'));
var expect = chai.expect;
var element = document.getElementById('myJsonEditor');



describe('Testing duplicate key error', function(){


  var wrap = document.getElementById('wrap');



  var setup = function(done){

    element = document.createElement('jsonymer-editor');
    element.id = "myJsonEditor";
    wrap.appendChild(element);

    element.obj = {
    };

  

    setTimeout(function(){
      done();
    }, 0);

  };

  var cleanup = function(){
    wrap.removeChild(element);
    wrap.innerHTML = "";
  };



  beforeEach(setup);
  afterEach(cleanup);

  var keyName = "dupKey";
  var parentid = -1;


  it("should not give a duplicate key error", function(){
    var first = element.addItem(parentid, keyName, 'myValue');
    expect(element.hasError(first.id)).to.not.be.ok();
  });


  it("should give a duplicate key error on the top level parent for two items", function(){

    var first = element.addItem(parentid, keyName, 'myValue');
    var second = element.addItem(parentid, keyName, 'myValue');

    expect(element.hasError(first.id)).to.be.ok();
    expect(element.hasError(first.id).errorID).to.equal("_dup");

    expect(element.hasError(second.id)).to.be.ok();
    expect(element.hasError(second.id).errorID).to.equal("_dup");

  });


  it("should give a duplicate key error on the top level parent for three items", function(){

    var first = element.addItem(parentid, keyName, 'myValue');
    var second = element.addItem(parentid, keyName, 'myValue');
    var third = element.addItem(parentid, keyName, 'myValue');

    expect(element.hasError(first.id)).to.be.ok();
    expect(element.hasError(first.id).errorID).to.equal("_dup");
    expect(element.hasError(second.id)).to.be.ok();
    expect(element.hasError(second.id).errorID).to.equal("_dup");
    expect(element.hasError(third.id)).to.be.ok();
    expect(element.hasError(third.id).errorID).to.equal("_dup");

  });


  it("should clear the error for both items", function(){

    var first = element.addItem(parentid, keyName, 'myValue');
    var second = element.addItem(parentid, keyName, 'myValue');

    expect(element.hasError(first.id)).to.be.ok();
    expect(element.hasError(first.id).errorID).to.equal("_dup");
    expect(element.hasError(second.id)).to.be.ok();
    expect(element.hasError(second.id).errorID).to.equal("_dup");

    element.setKeyValue(second.id, keyName + " (1)");

    expect(element.hasError(first.id)).to.not.be.ok();
    expect(element.hasError(second.id)).to.not.be.ok();


  });



  it("should clear the error for one of three items, and then the rest", function(){

    var first = element.addItem(parentid, keyName, 'myValue');
    var second = element.addItem(parentid, keyName, 'myValue');
    var third = element.addItem(parentid, keyName, 'myValue');

    element.setKeyValue(second.id, keyName + " (1)");

    expect(element.hasError(first.id)).to.be.ok();
    expect(element.hasError(first.id).errorID).to.equal("_dup");

    expect(element.hasError(second.id)).to.not.be.ok();
    
    expect(element.hasError(third.id)).to.be.ok();
    expect(element.hasError(third.id).errorID).to.equal("_dup");

    element.setKeyValue(first.id, keyName + " (2)");
    expect(element.hasError(first.id)).to.not.be.ok();
    expect(element.hasError(third.id)).to.not.be.ok();

  });



  it("should clear the error after item removal", function(){

    var first = element.addItem(parentid, keyName, 'myValue', false);
    var second = element.addItem(parentid, keyName, 'myValue', false);

    expect(element.hasError(first.id)).to.be.ok();
    expect(element.hasError(first.id).errorID).to.equal("_dup");    
    expect(element.hasError(second.id)).to.be.ok();
    expect(element.hasError(second.id).errorID).to.equal("_dup");

    element.removeItem(2);
    expect(element.hasError(first.id)).to.not.be.ok();

  });


});


















































