// methods.js

var expect = (chai || require('chai')).expect;
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
      expect(element.getItem(item.id)).to.equal(item);
    });
    it('should add an array', function(){
      var item = element.addItem(-1, 'key', ['test']);
      expect(element.getItem(item.id)).to.equal(item);
      expect(element.getItem(2)).to.equal(item.value[0])
    });
    it('should add an object', function(){
      var item = element.addItem(-1, 'key', {'test':'ing'});
      expect(element.getItem(item.id)).to.equal(item);
      expect(element.getItem(2)).to.equal(item.value[0]);
    });
    it('should add a number as a string', function(){
      var item = element.addItem(-1, 'key', 1);
      expect(element.getItem(item.id)).to.equal(item);
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
      expect(item.value).to.equal(undefined);
    });

  });



  describe('removeItem', function(){
    it('should remove a plain string item', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.removeItem(item.id);
      expect(element.getItem(item.id)).to.equal(undefined);
    });

    it('should remove an array items child', function(){
      var item = element.addItem(-1, 'key', ['array']);
      element.removeItem(item.value[0].id);
      expect(item.value.length).to.equal(0);
    });

    it('should remove an object items child', function(){
      var item = element.addItem(-1, 'key', {"hey":"now"});
      element.removeItem(item.value[0].id);
      expect(item.value.length).to.equal(0);
    });

    it('should not remove anything when passing invalid id', function(){
      expect(element.removeItem(200)).to.equal(false);
    }); 

    it('should not remove anything when passing root id', function(){
      expect(element.removeItem(-1)).to.equal(false);
    });     
  });


  describe('setKeyValue', function(){

    it('should set the key value for strings', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setKeyValue(item.id, 'key 2');
      expect(element.getItem(item.id).key).to.equal('key 2');
    });

    it('should set the key value for falsy values', function(){
      var item = element.addItem(-1, 'hey', 'value');

      element.setKeyValue(item.id, false);
      expect(element.getItem(item.id).key).to.equal('false');

      element.setKeyValue(item.id, null);
      expect(element.getItem(item.id).key).to.equal('null');

      element.setKeyValue(item.id, '');
      expect(element.getItem(item.id).key).to.equal('');
    });

    it('should set undefined key as a generated key ("key" or "key (1)")', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setKeyValue(item.id, undefined);
      expect(element.getItem(item.id).key).to.equal('key');
    });


    it('should set a dup key error', function(){
      var first = element.addItem(-1, 'hey', 'value');
      expect(element.hasError(first.id)).to.not.be.ok();

      var second = element.addItem(-1, 'hey 2', 'value');
      expect(element.hasError(second.id)).to.not.be.ok();

      element.setKeyValue(first.id, 'hey 2');

      expect(element.hasError(first.id)).to.be.ok();
      expect(element.hasError(second.id)).to.be.ok();

      element.setKeyValue(second.id,'hey');
      expect(element.hasError(first.id)).to.not.be.ok();
      expect(element.hasError(second.id)).to.not.be.ok();

    });

  });


  describe('setPropertyValue', function(){

    it('should set the property of the same type', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.id, 'value 2');
      expect(element.getItem(item.id).value).to.equal('value 2');
    });

    it('should set the property of a different type', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.id, {'obj':'ect'});
      expect(element.getItem(item.id).value).to.be.instanceof(Array);
      expect(element.getItem(item.id).type).to.equal('object');


      element.setPropertyValue(item.id, ['array']);
      expect(element.getItem(item.id).value).to.be.instanceof(Array);
      expect(element.getItem(item.id).type).to.equal('array');

      element.setPropertyValue(item.id, 'value 2');
      expect(element.getItem(item.id).value).to.equal('value 2');
      expect(element.getItem(item.id).type).to.equal('string');

    });

    it('should add child items if value is not an endpoint', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.id, {"obj":"ect"});
      expect(element.getItem(item.id).value).to.not.be.empty();
      expect(element.getItem(2).type).to.equal('string');
      expect(element.getItem(2).value).to.equal('ect');


      element.setPropertyValue(2, ["array"]);
      expect(element.getItem(item.id).value).to.not.be.empty();
      expect(element.getItem(3).type).to.equal('string');
      expect(element.getItem(3).value).to.equal('array');

    });

    it('should set falsy values and numbers as strings', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.id, null);
      expect(element.getItem(item.id).value).to.equal('null');

      element.setPropertyValue(item.id, false);
      expect(element.getItem(item.id).value).to.equal('false');

      element.setPropertyValue(item.id, true);
      expect(element.getItem(item.id).value).to.equal('true');

      element.setPropertyValue(item.id, 0);
      expect(element.getItem(item.id).value).to.equal('0');

    });


    it('should set undefined as null value', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setPropertyValue(item.id, undefined);
      expect(element.getItem(item.id).value).to.equal(null);
    });

  });


  
  describe('setItemType', function(){

    it('should set fail gracefully when setting the same type', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setItemType(item.id, 'string');
      expect(element.getItem(item.id).value).to.equal('value');
      expect(element.getItem(item.id).type).to.equal('string');
    });


    it('should set type when type is different', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setItemType(item.id, 'array');
      expect(element.getItem(item.id).value).to.be.instanceof(Array);
      expect(element.getItem(item.id).type).to.equal('array');

      element.setItemType(item.id, 'object');
      expect(element.getItem(item.id).value).to.be.instanceof(Array);
      expect(element.getItem(item.id).type).to.equal('object');

      element.setItemType(item.id, 'string');
      expect(element.getItem(item.id).value).to.equal("");
      expect(element.getItem(item.id).type).to.equal('string');
    });

    it('should set type as null when not passed acceptable value', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.setItemType(item.id, false);
      expect(element.getItem(item.id).type).to.equal(null);
      expect(element.getItem(item.id).value).to.equal(null);
    });


  });


  describe('removeValue', function(){

    it('should remove type of string', function(){
      var item = element.addItem(-1, 'hey', 'value');
      element.removeValue(item.id);
      expect(element.getItem(item.id).value).to.equal(null);
      expect(element.getItem(item.id).type).to.equal(null);
    });

    it('should remove type of object, along with children', function(){
      var item = element.addItem(-1, 'hey', {"obj": {"with" : "children"}});
      var totalItems = element.getItemLength();
      element.removeValue(item.id);
      expect(element.getItem(item.id).value).to.equal(null);
      expect(element.getItem(item.id).type).to.equal(null);
      expect(element.getItemLength()).to.equal(totalItems - 2);
    });

    it('should remove type of array, along with children', function(){
      var item = element.addItem(-1, 'hey', ["hey", {"hey": "now"}]);
      var totalItems = element.getItemLength();
      element.removeValue(item.id);
      expect(element.getItem(item.id).value).to.equal(null);
      expect(element.getItem(item.id).type).to.equal(null);
      expect(element.getItemLength()).to.equal(totalItems - 3);
    });

    it('should clear errors of children', function(){
      var item = element.addItem(-1, 'hey', {"key" : "value"});

      var newItem = element.addItem(item.id, 'key', 'value 2');
      expect(element.hasError(newItem.id)).to.be.ok();

      element.removeValue(item.id);
      expect(element.hasError(newItem.id)).to.not.be.ok();

    });

  });


  describe('removeChildren', function(){

    it('should remove children from object', function(){
      var item = element.addItem(-1, 'hey', {"key" : "value"});
      element.removeChildren(item.id);
      expect(element.getItem(item.id).value).to.be.empty();
      expect(element.getItemLength()).to.equal(2);
    });
    it('should remove children from array', function(){
      var item = element.addItem(-1, 'hey', ["array"]);
      element.removeChildren(item.id);
      expect(element.getItem(item.id).value).to.be.empty();
      expect(element.getItemLength()).to.equal(2);
    });
    it('should return false with string item', function(){
      var item = element.addItem(-1, 'hey', 'value');
      var result = element.removeChildren(item.id);
      expect(result).to.equal(false);
    });
  });


  describe('getNextItem', function(){

    it('should get the next immediate sibling', function(){
      var first = element.addItem(-1, 'hey', 'value');
      var second = element.addItem(-1, 'hey 2', 'value');
      var next = element.getNextItem(first.id);
      expect(next).to.equal(second);
    });

    it('should get the first child of array', function(){
      var first = element.addItem(-1, 'hey', ["hey"]);
      var second = element.getItem(first.id).value[0];

      var next = element.getNextItem(first.id);
      expect(next).to.equal(second);
    });

    it('should get the first child of object', function(){
      var first = element.addItem(-1, 'hey', {"hey" : "value"});
      var second = element.getItem(first.id).value[0];

      var next = element.getNextItem(first.id);
      expect(next).to.equal(second);
    });

    it('should return null when at end', function(){
      var first = element.addItem(-1, 'hey', 'value');
      var next = element.getNextItem(first.id);
      expect(next).to.equal(null);
    });

    it('should return parents next sibling when at end of nested array', function(){
      var first = element.addItem(-1, 'hey', ["array"]);
      var second = element.getNextItem(first.id);
      var third = element.addItem(-1, 'hey 2', 'value');

      var next = element.getNextItem(second.id);
      expect(next).to.equal(third);
    });

    it('should return parents next sibling when at end of nested object', function(){
      var first = element.addItem(-1, 'hey', {"obj":"ect"});
      var second = element.getNextItem(first.id);
      var third = element.addItem(-1, 'hey 2', 'value');

      var next = element.getNextItem(second.id);
      expect(next).to.equal(third);
    });

    it('should return null when at end of nested object and parent has no siblings', function(){
      var first = element.addItem(-1, 'hey', {"obj":"ect"});
      var second = element.getNextItem(first.id);
      var next = element.getNextItem(second.id);
      expect(next).to.equal(null);
    });
  });


  describe('getNextSibling', function(){

    it('should return null with no siblings', function(){
      var item = element.addItem(-1, 'hey', {"obj":"ect"});
      expect(element.getNextSibling(item.id)).to.equal(null);
    });

    it('should return sibling with siblings', function(){
      var item = element.addItem(-1, 'hey', {"obj":"ect"});
      var second = element.addItem(-1, 'hey 2', 'value');
      expect(element.getNextSibling(item.id)).to.equal(second);
    });    

  });


  describe('getParent', function(){
    it('should not return parent when using root', function(){
      expect(element.getParent(-1)).to.equal(null);
    });
    it('should return root when on first level', function(){
      var item = element.addItem(-1, 'hey', 'value');
      var root = element.kArr[-1];
      expect(element.getParent(item.id)).to.equal(root);
    });
    it('should return parent when on second level', function(){
      var item = element.addItem(-1, 'hey', {"obj":"ect"});
      var parent = item;
      var child = item.value[0];
      expect(element.getParent(child.id)).to.equal(parent);
    });
  });


  describe('setError', function(){

    it('should set a single error', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, "errID", "this is an error");

      var err = element.getItem(item.id).error;
      expect(err).to.be.ok();
      expect(element.hasError(item.id)).to.equal(err);
      expect(err.errorID).to.equal('errID');

    });

    it('should set multiple errors', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, "errID_1", "this is an error 1");
      element.setError(item.id, "errID_2", "this is an error 2");

      var err1 = element.getError(item.id, "errID_1");
      var err2 = element.getError(item.id, "errID_2");

      expect(err1).to.be.ok();
      expect(err2).to.be.ok();

      expect(element.getItem(item.id).error).to.equal(err2);

    });

    it('should override an existing error with same ID', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, "err", "one");
      element.setError(item.id, "err", "override");

      var err = element.getError(item.id, "err");
      expect(err.error).to.equal("override");

    });

    it('should throw error without error ID', function(){
      var item = element.addItem(-1, 'key', 'value');
      var fn = function(){ return element.setError(item.id); };
      expect(fn).to.throw(Error);
    });


  });
  

  

  describe('getError', function(){

    it('should return specific error', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, 'err', 'this is an error');
      var err = element.getError(item.id, 'err');
      expect(err).to.be.ok();
      expect(err.errorID).to.equal('err');
    });

    it('should return all errors for item', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, 'err', 'this is an error');
      element.setError(item.id, 'err 2', 'this is an error');

      var err = element.getError(item.id);
      expect(err).to.be.ok();
      expect(err['err']).to.be.ok();
      expect(err['err 2']).to.be.ok();

    });

  });






  describe('clearError', function(){

    it('should clear a single error from an item', function(){

      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, 'err', 'this is an error');

      var err = element.getError(item.id, 'err');
      expect(err).to.be.ok();

      element.clearError(item.id, 'err');
      var err = element.getError(item.id, 'err');
      expect(err).to.not.be.ok();
    });


    it('should clear all errors for item', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, 'err', 'this is an error');
      element.setError(item.id, 'err 2', 'this is an error');

      element.clearError(item.id);

      var err = element.getError(item.id, 'err');
      expect(err).to.not.be.ok();

      var err2 = element.getError(item.id, 'err 2');
      expect(err2).to.not.be.ok();
      
    });

    it('should clear one of two errors for item', function(){
      var item = element.addItem(-1, 'key', 'value');
      element.setError(item.id, 'err', 'this is an error');
      element.setError(item.id, 'err 2', 'this is an error');

      element.clearError(item.id, 'err');

      var err = element.getError(item.id);
      expect(err).to.be.ok();

      var err = element.hasError(item.id);
      expect(item.error).to.equal(err);
      
    });

  });





  describe('clearDescendingErrors', function(){

    it('should clear all errors in children but not itself', function(){
      
      var item = element.addItem(-1, 'key', {
        "child 1" : "value",
        "child 2" : [
          "child 3"
        ]
      });

      element.setError(item.id, 'err', 'this is an error');

      element.setError(2, 'err', 'this is an error');
      element.setError(3, 'err', 'this is an error');
      element.setError(4, 'err', 'this is an error');

      expect(element.getError(item.id)).to.be.ok();
      expect(element.getError(2)).to.be.ok();
      expect(element.getError(3)).to.be.ok();
      expect(element.getError(4)).to.be.ok();

      element.clearDescendingErrors(item.id);

      expect(element.getError(item.id)).to.be.ok();
      expect(element.getError(2)).to.equal(undefined);
      expect(element.getError(3)).to.equal(undefined);
      expect(element.getError(4)).to.equal(undefined);

    });

  });





  describe('hasError', function(){

    it('should return error when given an ID', function(){
      var item = element.addItem(-1, 'key', 'value');
      var err = element.setError(item.id, 'err', 'this is an error');      

      expect(element.hasError(item.id)).to.equal(err);
    });

    it('should return all errors when not given an ID', function(){
      var item = element.addItem(-1, 'key', 'value');
      var err = element.setError(item.id, 'err', 'this is an error');
      var errToMatch = element.getError(item.id);
      expect(element.hasError()).to.equal(errToMatch);
    });

    it('should return false when all errors gone', function(){

      var item = element.addItem(-1, 'key', 'value');
      var err = element.setError(item.id, 'err', 'this is an error');      
      element.clearError(item.id);

      expect(element.hasError(item.id)).to.equal(false);
      expect(element.hasError()).to.equal(false);
    });

  });




  describe('addChildItems', function(){


    it('should add child items to object type', function(){
      var item = element.addItem(-1, 'key', {"obj":"ect"});
      var curLength = element.getItemLength();
      element.addChildItems(item.id, {"child" : "ren"});
      expect(element.getItemLength()).to.equal(curLength + 1);
      expect(item.value.length).to.equal(2);
    });
    it('should add child items to array type', function(){
      var item = element.addItem(-1, 'key', ["array"]);
      var curLength = element.getItemLength();
      element.addChildItems(item.id, ["child"]);
      expect(element.getItemLength()).to.equal(curLength + 1);
      expect(item.value.length).to.equal(2);
    });


    it('should overwrite child items to object type with the overwrite param', function(){
      var item = element.addItem(-1, 'key', {"obj":"ect"});
      var curLength = element.getItemLength();
      element.addChildItems(item.id, {"child" : "ren"}, true);
      expect(element.getItemLength()).to.equal(curLength);
      expect(item.value.length).to.equal(1);
    });
    it('should overwrite child items to array type with the overwrite param', function(){
      var item = element.addItem(-1, 'key', ["array"]);
      var curLength = element.getItemLength();
      element.addChildItems(item.id, ["child"], true);
      expect(element.getItemLength()).to.equal(curLength);
      expect(item.value.length).to.equal(1);
    });


    it('should not add child to string type', function(){
      var item = element.addItem(-1, 'key', 'value');
      var result = element.addChildItems(item.id, ["children", "to", "add"]);
      expect(element.getItemLength()).to.equal(2);
      expect(result).to.equal(false);
    });
    it('should not add child to undefined type', function(){
      var item = element.addItem(-1, 'key', undefined);
      var result = element.addChildItems(item.id, ["children", "to", "add"]);
      expect(result).to.equal(false);
      expect(element.getItemLength()).to.equal(2);
    });


    it('should not add array children to object type', function(){
      var item = element.addItem(-1, 'key', {"obj":"ect"});
      var curLength = element.getItemLength();
      var result = element.addChildItems(item.id, ["array"]);
      expect(element.getItemLength()).to.equal(curLength);
      expect(result).to.equal(false);     
    });
    it('should not add object children to array type', function(){
      var item = element.addItem(-1, 'key', ["array"]);
      var curLength = element.getItemLength();
      var result = element.addChildItems(item.id, {"obj" : "ect"});
      expect(element.getItemLength()).to.equal(curLength);
      expect(result).to.equal(false);
    });


  });




  describe('createNewItem', function(){

    it('should create a new string item to the root', function(){
      var item = element.createNewItem(-1, 'key', 'value');
      expect(item).to.be.ok();
      expect(element.getItemLength()).to.equal(2);
    });
    it('should create a new object item to the root', function(){
      var item = element.createNewItem(-1, 'key', {});
      expect(item).to.be.ok();
      expect(element.getItemLength()).to.equal(2);
    });
    it('should create a new array item to the root', function(){
      var item = element.createNewItem(-1, 'key', []);
      expect(item).to.be.ok();
      expect(element.getItemLength()).to.equal(2);
    });


    it('should create a new item to an item object', function(){
      var item = element.createNewItem(-1, 'key', {});
      var child = element.createNewItem(item.id, 'key', 'value');
      expect(child).to.be.ok();
      expect(element.getItemLength()).to.equal(3);
    });

    it('should create a new item to an item array', function(){
      var item = element.createNewItem(-1, 'key', []);
      var child = element.createNewItem(item.id, 'key', 'value');
      expect(child).to.be.ok();
      expect(element.getItemLength()).to.equal(3);
    });

    it('should not create a new item to a string', function(){
      var item = element.createNewItem(-1, 'key', 'value');
      var child = element.createNewItem(item.id, 'key', 'value');
      expect(child).to.not.be.ok();
      expect(element.getItemLength()).to.equal(2);
    });

    it('should not create a new item to a undefined item', function(){
      var item = element.createNewItem(-1, 'key', undefined);
      var child = element.createNewItem(item.id, 'key', 'value');
      expect(child).to.not.be.ok();
      expect(element.getItemLength()).to.equal(2);
    });


    it('should create an undefined item', function(){
      var item = element.createNewItem(-1, 'key', undefined);
      expect(item).to.be.ok();
      expect(element.getItemLength()).to.equal(2);
      expect(item.type).to.equal(null);
    });

    it('should generate an item with a generic key when no key is given', function(){
      var item = element.createNewItem(-1);
      expect(item).to.be.ok();
      expect(element.getItemLength()).to.equal(2);
      expect(item.key).to.equal("key");
    });

    it('should not do anything when given bad ID', function(){
      var item = element.createNewItem(1);
      expect(item).to.equal(false);
      expect(element.getItemLength()).to.equal(1);
    });

  });





  describe('checkDuplicateKeys', function(){

    it('should return false with one item', function(){
      var item = element.addItem(-1, 'key', 'value');
      var dups = element.checkDuplicateKeys(item.id, 'key');
      expect(dups).to.equal(false);
    });

    it('should return false with two items', function(){
      var item = element.addItem(-1, 'key', 'value');
      var item2 = element.addItem(-1, 'key 2', 'value');
      var dups = element.checkDuplicateKeys(item2.id, 'key 2');
      expect(dups).to.equal(false);
    });

    it('should return true with two items', function(){
      var item = element.addItem(-1, 'key', 'value');
      var item2 = element.addItem(-1, 'key 2', 'value');
      var dups = element.checkDuplicateKeys(item2.id, 'key');
      expect(dups).to.equal(item);
    });

    it('should return false when given the root id', function(){
      var item = element.addItem(-1, 'key', 'value');
      var item2 = element.addItem(-1, 'key 2', 'value');
      var dups = element.checkDuplicateKeys(-1, 'key');
      expect(dups).to.equal(false);
    });

    it('should return false after dup is cleared', function(){
      var item = element.addItem(-1, 'key', 'value');
      var item2 = element.addItem(-1, 'key 2', 'value');
      var dups = element.checkDuplicateKeys(item2.id, 'key');
      expect(dups).to.equal(item);

      element.setKeyValue(item.id, 'key 1');

      var dups = element.checkDuplicateKeys(item2.id, 'key');
      expect(dups).to.equal(false);

    });

  });





  describe('getAvailableKey', function(){

    it('should return "key" when no siblings are present', function(){
      var item = element.addItem(-1, 'not key', 'value');
      var key = element.getAvailableKey(item.id);
      expect(key).to.equal('key');
    });


    it('should return "key" when no siblings have "key" as its key', function(){
      var item = element.addItem(-1, 'not key', 'value');
      var item = element.addItem(-1, 'not key 2', 'value');
      var key = element.getAvailableKey(item.id);
      expect(key).to.equal('key');
    });

    it('should return "key (1)" when a sibling has "key" as its key', function(){
      var item = element.addItem(-1, 'not key', 'value');
      var item2 = element.addItem(-1, 'key', 'value');
      var key = element.getAvailableKey(item.id);
      expect(key).to.equal('key (1)');
    });

    it('should return "key (2)" when "key" and "key (1)" are taken', function(){
      var item = element.addItem(-1);
      var item2 = element.addItem(-1);
      var key = element.getAvailableKey(item2.id);
      expect(key).to.equal('key (2)');
    });

    it('should skip "key (1)" when its already taken', function(){
      var item = element.addItem(-1, 'not key');
      var item2 = element.addItem(-1, 'key (1)');
      var item3 = element.addItem(-1, 'hey now');

      var key = element.getAvailableKey(item.id);
      expect(key).to.equal('key');
      element.setKeyValue(item.id, key);

      var key = element.getAvailableKey(item3.id);
      expect(key).to.equal('key (2)');

    });

  });



  describe('isItemChildOfArray', function(){

    it('should return true when item is child of array', function(){
      var item = element.addItem(-1, 'key', []);
      var child = element.addItem(item.id, 'key', 'value');

      var itemOfArray = element.isItemChildOfArray(child.id);
      expect(itemOfArray).to.equal(true);

    });

    it('should return false when item is child of object', function(){
      var item = element.addItem(-1, 'key', {});
      var child = element.addItem(item.id, 'key', 'value');

      var itemOfArray = element.isItemChildOfArray(child.id);
      expect(itemOfArray).to.equal(false);

    });

  });




  describe('toJSON', function(){

    it('should return an empty object', function(){
      var result = element.toJSON();
      expect(result).to.be.an('object');
      expect(result).to.be.empty();
    });

    it('should return an equivalent object', function(done){
      var obj = {"hey" : "now"};
      element.obj = obj;
      setTimeout(function(){
        var result = element.toJSON();
        expect(result).to.be.an('object');
        expect(result).to.contain(obj);
        done();
      },0);
    });


    it('should keep types as they are when possible with the first "true" argument', function(done){
      var obj = {
        "hey" : "now",
        "int" : 1,
        "null" : null,
        "false" : false,
        "true" : true,
        "empty" : ""
      };
      element.obj = obj;
      setTimeout(function(){
        var result = element.toJSON(true);
        expect(result).to.be.an('object');
        expect(result).to.contain(obj);
        done();
      },0);      
    });

    it('should return object properties as strings regardless of type without first "true" argument', function(done){

      var obj = {
        "hey" : "now",
        "int" : 1,
        "null" : null,
        "false" : false,
        "true" : true,
        "empty" : ""
      };

      var returnValue = {
        "hey" : "now",
        "int" : "1",
        "null" : "null",
        "false" : "false",
        "true" : "true",
        "empty" : ""
      };
      element.obj = obj;
      setTimeout(function(){
        var result = element.toJSON();
        expect(result).to.be.an('object');
        expect(result).to.contain(returnValue);
        done();
      },0);      
    });


    it('should return undefined values with the second "true" argument', function(done){
      
      var obj = {
        "hey" : "now",
        "undefinedProp" : undefined
      };

      element.obj = obj;
      setTimeout(function(){
        var result = element.toJSON(true, true);
        expect(result).to.be.an('object');
        expect(result).to.contain.keys('undefinedProp');
        expect(result.undefinedProp).to.be.undefined();
        done();
      },0);
    });


    it('should not return undefined values without the second argument', function(done){
      
      var obj = {
        "hey" : "now",
        "undefinedProp" : undefined
      };

      element.obj = obj;
      setTimeout(function(){
        var result = element.toJSON();
        expect(result).to.be.an('object');
        expect(result).to.contain({"hey" : "now"});
        done();
      },0);
    });


  });




});