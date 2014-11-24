// general-tests.js

// var expect = require('chai').expect;

var expect = chai.expect;
var element = document.getElementById('myJsonEditor');


mocha.setup('bdd');

describe('General Tests', function(){
  it('element exists', function(){
    expect(element).to.not.equal(null);
  });
});




describe('Testing Listenable Events', function(){


  var initalChildLength = null;
  var wrap = document.getElementById('wrap');


  // EVENT NAMES
  var _beforeItemAdded = "beforeItemAdded";
  var _itemAdded = "itemAdded";
  var _beforeItemRemoved = "beforeItemRemoved";
  var _itemRemoved = "itemRemoved";
  var _keyValueChanged = "keyValueChanged";
  var _propertyValueChanged = "propertyValueChanged";
  var _beforeItemTypeRemoved = "beforeItemTypeRemoved";
  var _itemTypeRemoved = "itemTypeRemoved";
  var _itemTypeChanged = "itemTypeChanged";
  var _edit = "edit";
  var _dirty = "dirty";
  var _clean = "clean";


  var setup = function(done){

    element = document.createElement('jsonymer-editor');
    element.id = "myJsonEditor";
    
    element.obj = {
      "hey" : true,
      "nullValue" : null,
      "array" : [],
      "key" : {
        key : [
          "val", "val2", "val3"
        ]
      },
      "last" : "val"
    };

    wrap.appendChild(element);

    setTimeout(function(){
      initalChildLength = element.cObj.value.length;
      done();
    }, 0);    
  };

  var cleanup = function(){
    wrap.removeChild(element);
    wrap.innerHTML = "";
  };


  var expectEditEvent = function(eventName, done){
    element.addEventListener('edit', function(event){
      var detail = event.detail;
      expect(detail.editType).to.equal(eventName);
      done();
    });
  };



  beforeEach(setup);
  afterEach(cleanup);




  it(_beforeItemAdded, function(){

    element.addEventListener(_beforeItemAdded, function(event){
      expect(element.cObj.value.length).to.equal(initalChildLength);
      event.preventDefault();
    }, true);

    element.addItem(-1, 'myKey', 'myValue');
    expect(element.cObj.value.length).to.equal(initalChildLength);

  });





  it(_itemAdded, function(done){

    element.addEventListener(_itemAdded, function(event){
      expect(element.cObj.value.length).to.equal(initalChildLength + 1);
    }, true);

    expectEditEvent(_itemAdded, done);

    element.addItem(-1, 'myKey', 'myValue');

  });



  it(_beforeItemRemoved, function(){
    
    element.addEventListener(_beforeItemRemoved, function(event){
      expect(element.cObj.value.length).to.equal(initalChildLength);
      event.preventDefault();
    }, true);

    element.removeItem(1);
    expect(element.cObj.value.length).to.equal(initalChildLength);

  });



  it(_itemRemoved, function(done){

    element.addEventListener(_itemRemoved, function(){
      expect(element.cObj.value.length).to.equal(initalChildLength - 1);
    }, true);

    expectEditEvent(_itemRemoved, done);


    element.removeItem(1);

  });



  it(_keyValueChanged, function(done){

    var oldKey = element.getItem(1).key;
    var newKey = oldKey + " #2";

    element.addEventListener(_keyValueChanged, function(){
      expect(element.getItem(1).key).to.equal(newKey);
    }, true);

    expectEditEvent(_keyValueChanged, done);

    element.setKeyValue(1, newKey, true);

  });



  it(_propertyValueChanged, function(done){

    var values = [
      ["array"],
      {"obj":"ect"},
      ["array", {"with" : "children"}, ["you know?"]],
      {"object" : { "with" : "subobjects", "and" : ["arrays"]}},
      "string"
    ];
    var i = 0;
    var lastValue = null;

    var execPropertyChange = function(i){
      lastValue = element.getItem(1).value;
      element.setPropertyValue(1, values[i], true);
    }

    element.addEventListener(_propertyValueChanged, function(event){
      var item = event.detail.item;
      expect(item.value).to.not.equal(lastValue);
    }, true);

    var typeRemoveCallback = false;

    element.addEventListener('edit', function(event){
      var detail = event.detail;
      typeRemoveCallback = !typeRemoveCallback;

      if(typeRemoveCallback){
        expect(detail.editType).to.equal(_itemTypeChanged);
      }else{
        expect(detail.editType).to.equal(_propertyValueChanged);
        if(++i < values.length){
          execPropertyChange(i);
        }else{
          done();
        }        
      }
    });

    execPropertyChange(i);


  });



  it(_beforeItemTypeRemoved, function(){

    var item = element.getItem(1);

    element.addEventListener(_beforeItemTypeRemoved, function(event){
      expect(item.type).to.not.equal(null);
      event.preventDefault();
    }, true);

    element.removeType(1);
    expect(item.type).to.not.equal(null);

  });



  it(_itemTypeRemoved, function(done){

    var item = element.getItem(1);

    element.addEventListener(_itemTypeRemoved, function(){
      expect(item.type).to.equal(null);
    }, true);

    expectEditEvent(_itemTypeRemoved, done);


    element.removeType(1, true);

  });



  it(_itemTypeChanged, function(done){

    var types = [
      "array",
      "object",
      "string"
    ];
    var i = 0;

    element.addEventListener(_itemTypeChanged, function(event){
      expect(event.detail.item.type).to.equal(types[i]);
      if(++i < types.length){
        element.setItemType(1, types[i], true);
      }else{
        done();
      }
    }, true);

    element.setItemType(1, types[i], true);

  });



  it(_dirty, function(){
    
    element.addEventListener(_dirty, function(){
      var item = element.getItem(1);
      expect(element.getError(1)).to.be.an('object');
    }, true);

    element.setError(1, "testErr", "this is a test error");

  });



  it(_clean, function(){

    element.addEventListener(_clean, function(){
      expect(element.getError(1)).to.equal(undefined);
    }, true);

    element.setError(1, "testErr", "this is a test error");
    element.clearError(1, "testErr");

  });




});

















































