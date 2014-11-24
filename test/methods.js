// methods.js

var expect = chai.expect;
var element = document.getElementById('myJsonEditor');


describe('Testing notable methods that are in the DOCS', function(){

  var wrap = document.getElementById('wrap');

  var setup = function(done){

    element = document.createElement('jsonymer-editor');
    element.id = "myJsonEditor";
    
    element.obj = {
    };

    wrap.appendChild(element);

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




  describe('valueIsEndpoint', function(){
    it('string should be true', function(){
      var item = element.addItem(-1, 'key', 'value');
      expect(element.valueIsEndpoint(item.value)).to.equal(true);
    });
    it('array should be false', function(){
      var item = element.addItem(-1, 'key', ["test"]);
      expect(element.valueIsEndpoint(item.value)).to.equal(false);
    });
    it('object should be false', function(){
      var item = element.addItem(-1, 'key', {"test":"ing"});
      expect(element.valueIsEndpoint(item.value)).to.equal(false);
    });
  });


  describe('addItem', function(){
    it('should add a string', function(){
      var item = element.addItem(-1, 'key', 'value');
      expect(element.getItem(item.idx)).to.equal(item);
    });
    it('should add an array', function(){
      var item = element.addItem(-1, 'key', ['test']);
      expect(element.getItem(item.idx)).to.equal(item);
      expect(element.getItem(2)).to.equal(item.value[0])
    });
    it('should add an object', function(){
      var item = element.addItem(-1, 'key', {'test':'ing'});
      expect(element.getItem(item.idx)).to.equal(item);
      expect(element.getItem(2)).to.equal(item.value[0]);
    });
    it('should add a number as a string', function(){
      var item = element.addItem(-1, 'key', 1);
      expect(element.getItem(item.idx)).to.equal(item);
      expect(item.value).to.equal("1");
    });
    it('should add falsy values as a string', function(){
      var item = element.addItem(-1, 'key', null);
      expect(item.value).to.equal("null");

      var item = element.addItem(-1, 'key 2', true);
      expect(item.value).to.equal("true");

      var item = element.addItem(-1, 'key 3', false);
      expect(item.value).to.equal("false");
    });
    it('should add undefined value as null', function(){
      var item = element.addItem(-1, 'key', undefined);
      expect(item.value).to.equal(null);
    });

  });



  describe('removeItem', function(){
    it('should remove a plain string item', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.removeItem(item.idx);
      expect(element.getItem(item.idx)).to.equal(undefined);
    });

    it('should remove an array items child', function(){
      var item = element.addItem(-1, 'key', ['array']);
      element.removeItem(item.value[0].idx);
      expect(item.value.length).to.equal(0);
    });

    it('should remove an object items child', function(){
      var item = element.addItem(-1, 'key', {"hey":"now"});
      element.removeItem(item.value[0].idx);
      expect(item.value.length).to.equal(0);
    });

    it('should not remove anything when passing invalid idx', function(){
      expect(element.removeItem(200)).to.equal(false);
    }); 

    it('should not remove anything when passing root idx', function(){
      expect(element.removeItem(-1)).to.equal(false);
    });     
  });


  describe('setKeyValue', function(){

    it('should set the key value for strings', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setKeyValue(item.idx, 'key 2');
      expect(element.getItem(item.idx).key).to.equal('key 2');
    });

    it('should set the key value for falsy values', function(){
      var item = element.addItem(-1, 'hey', 'value');

      element.setKeyValue(item.idx, false);
      expect(element.getItem(item.idx).key).to.equal('false');

      element.setKeyValue(item.idx, null);
      expect(element.getItem(item.idx).key).to.equal('null');

      element.setKeyValue(item.idx, undefined);
      expect(element.getItem(item.idx).key).to.equal('undefined');

      element.setKeyValue(item.idx, '');
      expect(element.getItem(item.idx).key).to.equal('');
    });

    it('should set a dup key error', function(){
      var first = element.addItem(-1, 'hey', 'value');
      expect(element.hasError(first.idx)).to.not.be.ok();

      var second = element.addItem(-1, 'hey 2', 'value');
      expect(element.hasError(second.idx)).to.not.be.ok();

      element.setKeyValue(first.idx, 'hey 2');

      expect(element.hasError(first.idx)).to.be.ok();
      expect(element.hasError(second.idx)).to.be.ok();

      element.setKeyValue(second.idx,'hey');
      expect(element.hasError(first.idx)).to.not.be.ok();
      expect(element.hasError(second.idx)).to.not.be.ok();

    });

  });


  describe('setPropertyValue', function(){

    it('should set the property of the same type', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.idx, 'value 2');
      expect(element.getItem(item.idx).value).to.equal('value 2');
    });

    it('should set the property of a different type', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.idx, {'obj':'ect'});
      expect(element.getItem(item.idx).value).to.be.instanceof(Array);
      expect(element.getItem(item.idx).type).to.equal('object');


      element.setPropertyValue(item.idx, ['array']);
      expect(element.getItem(item.idx).value).to.be.instanceof(Array);
      expect(element.getItem(item.idx).type).to.equal('array');

      element.setPropertyValue(item.idx, 'value 2');
      expect(element.getItem(item.idx).value).to.equal('value 2');
      expect(element.getItem(item.idx).type).to.equal('string');

    });

    it('should add child items if value is not an endpoint', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.idx, {"obj":"ect"});
      expect(element.getItem(item.idx).value).to.not.be.empty();
      expect(element.getItem(2).type).to.equal('string');
      expect(element.getItem(2).value).to.equal('ect');


      element.setPropertyValue(2, ["array"]);
      expect(element.getItem(item.idx).value).to.not.be.empty();
      expect(element.getItem(3).type).to.equal('string');
      expect(element.getItem(3).value).to.equal('array');

    });

    it('should set falsy values and numbers as strings', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.idx, null);
      expect(element.getItem(item.idx).value).to.equal('null');

      element.setPropertyValue(item.idx, false);
      expect(element.getItem(item.idx).value).to.equal('false');

      element.setPropertyValue(item.idx, true);
      expect(element.getItem(item.idx).value).to.equal('true');

      element.setPropertyValue(item.idx, 0);
      expect(element.getItem(item.idx).value).to.equal('0');

    });


    it('should set undefined as null value', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.idx, undefined);
      expect(element.getItem(item.idx).value).to.equal(null);
    });

  });


  
  describe('setItemType', function(){

    it('should set fail gracefully when setting the same type', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setItemType(item.idx, 'string');
      expect(element.getItem(item.idx).value).to.equal('value');
      expect(element.getItem(item.idx).type).to.equal('string');
    });


    it('should set type when type is different', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setItemType(item.idx, 'array');
      expect(element.getItem(item.idx).value).to.be.instanceof(Array);
      expect(element.getItem(item.idx).type).to.equal('array');

      element.setItemType(item.idx, 'object');
      expect(element.getItem(item.idx).value).to.be.instanceof(Array);
      expect(element.getItem(item.idx).type).to.equal('object');

      element.setItemType(item.idx, 'string');
      expect(element.getItem(item.idx).value).to.equal("");
      expect(element.getItem(item.idx).type).to.equal('string');
    });

    it('should set type as null when not passed acceptable value', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setItemType(item.idx, false);
      expect(element.getItem(item.idx).type).to.equal(null);
      expect(element.getItem(item.idx).value).to.equal(null);
    });


  });


  describe('removeType', function(){

    it('should remove type of string', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.removeType(item.idx);
      expect(element.getItem(item.idx).value).to.equal(null);
      expect(element.getItem(item.idx).type).to.equal(null);
    });

    it('should remove type of object, along with children', function(){
      var item = element.addItem(-1, 'hey', {"obj": {"with" : "children"}});
      var totalItems = element.getItemLength();
      element.removeType(item.idx);
      expect(element.getItem(item.idx).value).to.equal(null);
      expect(element.getItem(item.idx).type).to.equal(null);
      expect(element.getItemLength()).to.equal(totalItems - 2);
    });

    it('should remove type of array, along with children', function(){
      var item = element.addItem(-1, 'hey', ["hey", {"hey": "now"}]);
      var totalItems = element.getItemLength();
      element.removeType(item.idx);
      expect(element.getItem(item.idx).value).to.equal(null);
      expect(element.getItem(item.idx).type).to.equal(null);
      expect(element.getItemLength()).to.equal(totalItems - 3);
    });

    it('should clear errors of children', function(){
      var item = element.addItem(-1, 'hey', {"key" : "value"});

      var newItem = element.addItem(item.idx, 'key', 'value 2');
      expect(element.hasError(newItem.idx)).to.be.ok();

      element.removeType(item.idx);
      expect(element.hasError(newItem.idx)).to.not.be.ok();

    });

  });


  describe('removeChildren', function(){

    it('should remove children from object', function(){
      var item = element.addItem(-1, 'hey', {"key" : "value"});
      element.removeChildren(item.idx);
      expect(element.getItem(item.idx).value).to.be.empty();
      expect(element.getItemLength()).to.equal(2);
    });
    it('should remove children from array', function(){
      var item = element.addItem(-1, 'hey', ["array"]);
      element.removeChildren(item.idx);
      expect(element.getItem(item.idx).value).to.be.empty();
      expect(element.getItemLength()).to.equal(2);
    });
    it('should return false with string item', function(){
      var item = element.addItem(-1, 'hey', 'value');
      var result = element.removeChildren(item.idx);
      expect(result).to.equal(false);
    });
  });


  describe('getNextItem', function(){

    it('should get the next immediate sibling', function(){
      var first = element.addItem(-1, 'hey', 'value');
      var second = element.addItem(-1, 'hey 2', 'value');
      var next = element.getNextItem(first.idx);
      expect(next).to.equal(second);
    });

    it('should get the first child of array', function(){
      var first = element.addItem(-1, 'hey', ["hey"]);
      var second = element.getItem(first.idx).value[0];

      var next = element.getNextItem(first.idx);
      expect(next).to.equal(second);
    });

    it('should get the first child of object', function(){
      var first = element.addItem(-1, 'hey', {"hey" : "value"});
      var second = element.getItem(first.idx).value[0];

      var next = element.getNextItem(first.idx);
      expect(next).to.equal(second);
    });

    it('should return null when at end', function(){
      var first = element.addItem(-1, 'hey', 'value');
      var next = element.getNextItem(first.idx);
      expect(next).to.equal(null);
    });

    it('should return parents next sibling when at end of nested array', function(){
      var first = element.addItem(-1, 'hey', ["array"]);
      var second = element.getNextItem(first.idx);
      var third = element.addItem(-1, 'hey 2', 'value');

      var next = element.getNextItem(second.idx);
      expect(next).to.equal(third);
    });

    it('should return parents next sibling when at end of nested object', function(){
      var first = element.addItem(-1, 'hey', {"obj":"ect"});
      var second = element.getNextItem(first.idx);
      var third = element.addItem(-1, 'hey 2', 'value');

      var next = element.getNextItem(second.idx);
      expect(next).to.equal(third);
    });

    it('should return null when at end of nested object and parent has no siblings', function(){
      var first = element.addItem(-1, 'hey', {"obj":"ect"});
      var second = element.getNextItem(first.idx);
      var next = element.getNextItem(second.idx);
      expect(next).to.equal(null);
    });
  });


  describe('getNextSibling', function(){

    it('should return null with no siblings', function(){
      var item = element.addItem(-1, 'hey', {"obj":"ect"});
      expect(element.getNextSibling(item.idx)).to.equal(null);
    });

    it('should return sibling with siblings', function(){
      var item = element.addItem(-1, 'hey', {"obj":"ect"});
      var second = element.addItem(-1, 'hey 2', 'value');
      expect(element.getNextSibling(item.idx)).to.equal(second);
    });    

  });


  describe('getParent', function(){
    it('should not return parent when using root', function(){
      expect(element.getParent(-1)).to.equal(null);
    });
    it('should return root when on first level', function(){
      var item = element.addItem(-1, 'hey', 'value');
      var root = element.kArr[-1];
      expect(element.getParent(item.idx)).to.equal(root);
    });
    it('should return parent when on second level', function(){
      var item = element.addItem(-1, 'hey', {"obj":"ect"});
      var parent = item;
      var child = item.value[0];
      expect(element.getParent(child.idx)).to.equal(parent);
    });
  });



  


});