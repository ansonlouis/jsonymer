
(function(){

  // unique id tracker
  var idx = 0;

  Polymer('jsonymer-editor', {


    // the actual object passed in, in original format
    obj : false,

    // the special compiled object...
    // this is the original object passed in, but in a special
    // format to keep track of changes and meta data...
    cObj : false,

    // key-map array to associate deep children with their corresponding
    // unique ID...this is also used to acquire a specific deep object
    // to modify it, instead of having to travel an arbitrary set of
    // deep object properties (since its in memory and the same object at its core)
    kArr : false,

    // an error string for the user/dev if there is an error with the object
    objError : "Error",

    // reference to the internal data object for the current
    // item in edit mode, if any
    current_edit_item : null,

    // reference to the DOM element of the currently focused item 
    focusedItem : null,

    // cache of current errors that exist in the JSON document
    errors : {},

    // whether the error functionality should be run or not, turn this to false
    // if you don't care about showing the user errors they may make
    // (only automatic internal error is the duplicate-key error)
    errorsOn : true,


    /*
    *
    * POLYMER INTERNAL METHODS
    *
    */
    created : function(){
      this.obj = {};
      this.resetVariables();
    },

    domReady : function(){
      this.fire("domReady");
    },

    /** END POLYMER INTERNAL METHODS **/


    resetVariables : function(){
      this.cObj = {
        "idx" : -1,
        "value" : [],
        "parent" : false,
        "childKeyIdx" : 0,
        "type" : "object"
      };
      this.kArr = {};
      this.errors = {};
      this.kArr[this.cObj.idx] = this.cObj;
    },

    valToString : function(str){

      var type = typeof(str);

      if(type === "string" || type === "boolean" || type === "number"){
        return (str).toString();
      }

      if(str === null){
        return "null";
      }

      if(str === undefined){
        return "undefined";
      }

      return str;

    },

    convertType : function(str){

      if(str === 'null' || str === null){
        return null;
      }

      if(str === 'undefined' || str === undefined){
        return undefined;
      }

      if(str === 'false' || str === false){
        return false;
      }

      if(str === 'true' || str === true){
        return true;
      }

      var test = (str.trim && str.trim()) || str;
      if(test.length === 0 || isNaN(test)){
        return str;
      }

      if(!isNaN(str)){
        return parseFloat(str);
      }

      return str;

    },

    isEvent : function(maybeEvent){
      return maybeEvent instanceof Event;
    },

    isCalledFromDom : function(args){
      return this.isEvent(args[0]);
    },

    forEachChild : function(collection, fn){
      if(collection instanceof Array){
        for(var i=0; i<collection.length; i++){
          fn(collection[i], i);
        }
      }
      else{
        for(var i in collection){
          fn(collection[i], i);
        }
      }
    },

    getItem : function(idx){
      return this.kArr[idx];
    },

    getSiblings : function(idx){
      var item = this.getItem(idx);
      return item.parent && item.parent.value;
    },

    valueIsEndpoint : function(val){
      if(!val || typeof(val) !== "object"){
        return true;
      }
      return false;
    },
    typeOfValue : function(val){
      if(val === undefined){
        return undefined;
      }
      if(this.valueIsEndpoint(val)){
        return "string";
      }
      else if(val instanceof Array){
        return "array";
      }
      return "object";
    },

    itemIsRoot : function(item){
      return item.idx === -1;
    },


    /*
    *
    * POLYMER TEMPLATE FILTER FUNCTIONS
    *
    * The following are functions used in the template HTML
    * to allow looping of objects, since polymer templates
    * do not support native object iteration yet
    *
    */
    isArray : function(v){
      return v instanceof Array;
    },

    isNotArray : function(v){
      return !(v instanceof Array);
    },
    /** END POLYMER TEMPLATE FILTER FUNCTIONS **/








    /*
    *
    * POLYMER CHANGED EVENT METHODS
    *
    */

    // everytime the obj property changes, we'll need to
    // compile the new object into our special format and reset
    // some variables
    objChanged : function(){
      if(typeof(this.obj) === "object"){
        return this.compileObject();
      }
    },
    /** END POLYMER CHANGED EVENT METHODS **/


    







    /*
    *
    * POLYMER TEMPLATE EVENT HOOKS
    *
    */

    fireEditEvent : function(eventDetail, eventType, async){

      var method = async ? "asyncFire" : "fire";

      this[method](eventType, eventDetail);

      eventDetail.editType = eventType;
      this[method]('edit', eventDetail);

    },


    // adds an item to an object/array in the JSON
    addItem : function(parentIdx, passedKey, passedValue, editMode){
      

      if(this.isCalledFromDom(arguments)){
        var el = arguments[2];
        var parentIdx = el.getAttribute('data-idx');
        return this.addItem(parentIdx, undefined, undefined, true);
      }


      var _this = this;

      // get the parent object
      var targetParent = this.kArr[parentIdx] || this.cObj;

      var eventObj = this.fire('beforeItemAdded', {
        "parent" : targetParent,
        "key" : passedKey,
        "value" : passedValue
      });

      // if the user used preventDefault in their callback for
      // "beforeItemAdded" lets not actually add the item!
      if(eventObj.defaultPrevented){
        return null;
      }

      var item = this.createNewItem(parentIdx, passedKey, passedValue);

      // automatically enter edit mode into the new items "key" edit box
      if(editMode && targetParent.type !== "array"){
        this.enterEditModeAsync(item.idx);
      }


      var detail = {
        "item" : item
      };

      this.fireEditEvent(detail, 'itemAdded', true);

      return item;
      
    },




    removeItem : function(itemIdx){

      if(this.isCalledFromDom(arguments)){
        var el = arguments[2];
        var idx = el.getAttribute('data-idx');
        return this.removeItem(idx);
      }


      var obj = this.getItem(itemIdx);
      
      if(obj && !this.itemIsRoot(obj)){

        var parent = (obj.parent && obj.parent.value) || this.cObj.value;
        var itemChildOfArray = this.isItemChildOfArray(itemIdx);

        if(parent){

          for(var i=0; i<parent.length; i++){
            
            var tObj = parent[i];

            if(tObj.idx === obj.idx){

              var eventObj = this.fire('beforeItemRemoved', {
                "item" : obj,
              });

              // if the user used preventDefault in their callback for
              // "beforeItemRemoved" lets not actually remove the item!
              if(eventObj.defaultPrevented){
                return null;
              }

              // clear all errors from this item and its children
              this.clearError(itemIdx);
              this.clearDescendingErrors(itemIdx);

              // remove item from parent and key map array
              parent.splice(i, 1);
              this.removeItemFromKeyMap(itemIdx);


              // if the item was an array item, reset its siblings
              // ids so they are in proper incrementing order
              if(itemChildOfArray){
                this.resetChildKeys(parent);
              }
              // if the item is not an array item, lets make sure
              // that any duplicate key errors are resolved
              else{
                this.resetDuplicateKeys(parent, obj.key);
              }

              var eventDetail = {
                "idx" : itemIdx,
                "parent" : obj.parent
              };
              this.fireEditEvent(eventDetail, 'itemRemoved', true);


              return true;

            }
          }
        }
      }
      return false;
    },



    // on focus of item key OR value, enter edit mode for the key/value
    doFocus : function(e, data, el){

      if(!this.isCalledFromDom(arguments)){
        var itemIdx = arguments[0] || null;
        var which = arguments[1] || null;
        if(which !== 'key' && which !== 'value'){
          which = 'key';
        }
        var domItem = this.getDomItem(itemIdx, which);
        return domItem.focus();
      }

      var idx = el.getAttribute('data-idx');

      var obj = this.kArr[idx];

      // if we're trying to focus on a key, and the item is a direct child of
      // an array type, cancel out, because array keys should not be editable
      if(el.classList.contains('key-value') && this.isItemChildOfArray(idx)){
        return;
      }

      this.focusedItem = el;
      this.enterEditMode(idx, el);

      // defer the selection of the items text so it works right
      this.async(function(){
        this.selectElementContents(el);
      }, null);

    },


    // on key down, we check for the enter key to be pressed, as that
    // will trigger the acceptance of the changes
    checkEnterKey : function(e, data, el){

      if(e.which === 13){
        // this prevents a new row for key/value boxes
        e.preventDefault();
        // only accept changes it we're on a value box
        if(el.classList.contains('value')){
          var idx = el.getAttribute('data-idx');
          el.blur();
          // on enter, focus next value (like tab)
          var nextFocusable = this.getNextFocusableItem(idx);
          if(nextFocusable){
            nextFocusable.focus();
          }
        }
      }
    },

    // RUN ON KEY BOXES ONLY
    // on key up, lets auto check if the key is valid and doesn't collide
    // with other sibling keys, show an error if it does
    doKeyUp : function(e, data, el){
      var idx = el.getAttribute('data-idx');
      var v = el.innerText;
      var dup = this.checkDuplicateKeys(idx, v);
      if(dup){
        this.setError(dup.idx, "_dup", "You cannot have duplicate keys in the same level.");
        this.setError(idx, "_dup", "You cannot have duplicate keys in the same level.");
      }else{
        this.clearError(idx, "_dup");
      }
    },


    doInput : function(e, data, el){

      var key = el.classList.contains('key-value');
      var idx = el.getAttribute('data-idx');
      var obj = this.kArr[idx];
      var val = el.textContent || el.innerText;

      var eventName = "propertyValueChanged";
      if(key){
        eventName = "keyValueChanged";
      }

      var eventDetail = {
        "value" : val,
        "element" : el,
        "item" : obj      
      };

      this.fireEditEvent(eventDetail, eventName, true);

    },



    setKeyValue : function(idx, newKey, fireEvents){


      if(this.isCalledFromDom(arguments)){
        var el = arguments[2] || null;
        var itemIdx = el.getAttribute('data-idx');
        var val = el.textContent || el.innerText;
        return this.setKeyValue(itemIdx, val, true);
      }


      if(this.isItemChildOfArray(idx)){
        return false;
      }

      var item = this.kArr[idx];

      var oldKey = item.key;
      item.key = this.valToString(newKey);

      this.resetDuplicateKeys(this.getSiblings(idx), oldKey);
      this.setDuplicateKeys(idx, newKey);

      if(fireEvents){
        var eventDetail = {
          "value" : newKey,
          "oldValue" : oldKey,
          "element" : this.getDomItem(idx, 'key'),
          "item" : this.getItem(idx)            
        };
        this.fireEditEvent(eventDetail, 'keyValueChanged', true);
      }

      return true;

    },


    setPropertyValue : function(idx, newValue, fireEvents){

      if(this.isCalledFromDom(arguments)){
        var el = arguments[2] || null;
        var itemIdx = el.getAttribute('data-idx');
        var val = el.textContent || el.innerText;
        return this.setPropertyValue(itemIdx, val, true);
      }


      var item = this.getItem(idx);
      var oldValue = item.value;


      var valType = this.typeOfValue(newValue);
      if(valType !== item.type){
        this.removeType(item.idx, false);
        this.setItemType(item.idx, valType, fireEvents);
      }

      if(valType !== undefined){
        if(valType === "string"){
          item.value = this.valToString(newValue);
        }
        else{
          this.addChildItems(item.idx, newValue, true);
        }
      }
        

      if(fireEvents){
        var eventDetail = {
          "value" : newValue,
          "oldValue" : oldValue,
          "element" : this.getDomItem(idx, 'value'),
          "item" : item           
        };
        this.fireEditEvent(eventDetail, 'propertyValueChanged', true);
      }

    },


    // on blur of key-value box, exit edit mode and accept the new
    // changes for the item
    doBlur : function(e, data, el){
      var idx = el.getAttribute('data-idx');
      var obj = this.kArr[idx];
      this.clearElementSelection();
      this.exitEditMode();
      this.acceptChanges(idx);
    },


    setItemType : function(itemIdx, type, fireEvent){

      var item = this.kArr[itemIdx];
      var currentType = item.type;

      if(item.type === type){
        return true;
      }

      switch(type){
        case 'array':
          item.type = type;
          item.value = [];
          break;

        case 'object':
          item.type = type;
          item.value = [];
          break;

        case 'string':
          item.type = "string";
          item.value = "";
          break;

        default:
          item.type = null;
          item.value = null;
          break;
      }

      if(fireEvent && currentType !== item.type){
        var eventDetail = {
          "item" : item,
          "type" : item.type            
        };
        this.fireEditEvent(eventDetail, 'itemTypeChanged', false);
      }

      return item;

    },


    makeItemText : function(e, data, el){
      var idx = el.getAttribute('data-idx');
      this.setItemType(idx, 'string', true);
      this.enterEditModeAsync(idx, 'value');
    },


    makeItemObject : function(e, data, el){
      var idx = el.getAttribute('data-idx');
      this.setItemType(idx, 'object', true);

      this.async(function(){
        var itemEl = this.getDomItem(idx);
        itemEl.querySelector("a.add-item[data-idx='"+idx+"']").focus();
      });

    },

    makeItemArray : function(e, data, el){
      var idx = el.getAttribute('data-idx');
      this.setItemType(idx, 'array', true);

      this.async(function(){
        var itemEl = this.getDomItem(idx);
        itemEl.querySelector("a.add-item[data-idx='"+idx+"']").focus();
      });

    },


    onEnterDoClick : function(e, data, el){
      if(e.which === 13){
        e.preventDefault();
        el.click();
      }
    },


    removeType : function(itemIdx, fireEvent){


      if(this.isCalledFromDom(arguments)){
        var el = arguments[2];
        var itemIdx = el.getAttribute('data-idx');
        return this.removeType(itemIdx, true);
      }

      var obj = this.kArr[itemIdx];

      var eventResp = this.fire('beforeItemTypeRemoved', {
        "item" : obj
      });

      if(eventResp.defaultPrevented){
        return;
      }

      this.removeChildren(obj.idx);
      obj.value = null;
      obj.type = null;


      if(fireEvent){
        var eventDetail = {
          item : obj
        };
        this.fireEditEvent(eventDetail, 'itemTypeRemoved', false);
      }

    },

    /** END POLYMER TEMPLATE EVENT HOOKS **/



    removeChildren : function(parentIdx){
      var parent = this.getItem(parentIdx);
      if(parent && !this.valueIsEndpoint(parent.value)){
        this.clearDescendingErrors(parentIdx);
        this.removeChildrenFromKeyMap(parentIdx);
        parent.value = [];
        return this;
      }
      return false;
    },



    // resets an array of array items indexes to be in order
    resetChildKeys : function(children){
      for(var i=0; i<children.length; i++){
        children[i].key = i;
      }
    },


    // takes an array of item children (object items) and a target
    // key and makes sure there is only one of them. this is similar to
    // check duplicate keys but is meant to keep any existing errors if a 
    // duplicate is found and remove any error if only one is found, this
    // is meant for when you don't know anything about the items, but only have
    // a set of children and a single key
    //
    // this fixes a bug where if you had a duplicate key between two items,
    // and you remove the item that DID NOT have the error attached, the item
    // that DID have the error attached will not be resolved of that error
    resetDuplicateKeys : function(children, targetKey){
      var foundItem = false;
      for(var i=0; i<children.length; i++){
        var item = children[i];
        if(item.key === targetKey){
          if(foundItem){
            return;
          }
          foundItem = item;
        }
      }
      this.clearError(foundItem.idx, "_dup");
    },


    setDuplicateKeys : function(idx, targetKey){
      var dup = this.checkDuplicateKeys(idx, targetKey);
      if(dup){
        this.setError(dup.idx, "_dup", "You cannot have duplicate keys in the same level.", {key:targetKey});
        this.setError(idx, "_dup", "You cannot have duplicate keys in the same level.", {key:targetKey});
      }else{
        this.clearError(idx, "_dup");
      }
    },


    // more browser complient method of selecting the contents
    // of a element that using document.execCommand('selectAll')
    selectElementContents : function(el){
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    },


    clearElementSelection : function(){
      if(window.getSelection){
        if(window.getSelection().empty){
          window.getSelection().empty();
        }
        else if(window.getSelection().removeAllRanges){
          window.getSelection().removeAllRanges();
        }
      }
      else if(document.selection){
        document.selection.empty();
      }
    },


    getNextItem : function(idx){

      var obj = this.kArr[idx];

      // if item has children, return first child
      if(this.isArray(obj.value) && obj.value.length){
        return obj.value[0];
      }

      var safety = this.getItemLength();

      while(safety-- > 0){
        var sibling = this.getNextSibling(obj.idx);
        if(!sibling && obj.parent){
          obj = obj.parent;
        }else{
          return sibling;
        }
      }
      
      return null;

    },



    getNextSibling : function(idx){
      var obj = this.getItem(idx);
      if(obj){
        // else, go to parent and loop through siblings
        var siblings = obj.parent && obj.parent.value;
        if(siblings){
          for(var i=0; i<siblings.length; i++){
            // if we encounter the target and it has a sibling after it, return that
            if(siblings[i] === obj && siblings[i+1]){
              return siblings[i+1];
            }
          }
        }      
      }
      return null;
    },



    getParent : function(idx){
      var obj = this.getItem(idx);
      return obj.parent || null;
    },


    getNextFocusableItem : function(idx){
      var nextItem = this.getNextItem(idx);
      if(nextItem){
        var item = this.getDomItem(nextItem.idx);
        var focusable = item.querySelector('[tabIndex="1"]');
        if(focusable){
          return focusable;
        }
      }else{
        return this.$['add-item-end'];
      }
    },


    getItemLength : function(){
      return Object.keys(this.kArr).length;
    },



    removeItemFromKeyMap : function(idx){
      
      // this recurses through all descending children
      this.removeChildrenFromKeyMap(idx);
      delete this.kArr[idx];

    },

    removeChildrenFromKeyMap : function(idx){

      var item = this.kArr[idx];
      
      // if item has children, go through each child and remove them first
      // in a recursive many (if child has children has children has children, etc)
      if(item.value instanceof Array){
        for(var i=0; i<item.value.length; i++){
          this.removeItemFromKeyMap(item.value[i].idx);
        }
      }
    },



    setError : function(idx, errorID, str, data){
      
      if(!this.errorsOn){ return; }

      var item = this.getItem(idx);

      if(item){

        if(!this.errors[idx]){
          this.errors[idx] = {};
        }

        var errObj = {
          "idx" : idx,
          "errorID" : errorID,
          "error" : str,
          "data" : data
        };

        this.errors[idx][errorID] = errObj;

        item.error = errObj;

        // this.async(function(){
        //   var $item = this.getDomItem(idx);
        //   $item.setAttribute('error', true);
        //   $item.setAttribute('title', str);          
        // }, 0);


        this.fire('dirty', {
          error : errObj,
          item : this.kArr[idx]
        });        
      }


    },

    getError : function(idx, errorID){
      return errorID ? this.errors[idx][errorID] : this.errors[idx];
    },


    clearError : function(idx, errorID){

      if(!this.errorsOn){ return; }

      var item = this.getItem(idx);

      if(this.errors[idx]){

        if(errorID !== undefined){
          delete this.errors[idx][errorID];
        }
        else{
          delete this.errors[idx];
        }

        if(!this.hasError(idx)){

          // this.async(function(){
          //   var $item = this.getDomItem(idx);
          //   $item.removeAttribute('error');
          //   $item.removeAttribute('title');
          // }, 0);

          delete this.errors[idx];
          item.error = false;

          if(!this.hasError()){
            this.fire('clean');
          }

        }

      }

    },

    // clear all errors existing on any descending child
    // if the item is not of array/object type, it will clear
    // errors from the item itself...if the item IS of array/object
    // type, no errors will be cleared from the passed item itself
    clearDescendingErrors : function(idx){

      if(!this.errorsOn){ return; }

      var obj = this.kArr[idx];

      if(obj.value instanceof Array){
        for(var i=0; i<obj.value.length; i++){
          this.clearDescendingErrors(obj.value[i].idx);
        }
      }else{
        this.clearError(idx);
      }

    },


    hasError : function(idx){
      var toSearch = idx ? this.errors[idx] : this.errors;
      for(var k in toSearch){
        return toSearch[k];
      }
      return false;
    },






    // enters edit mode for a given item, allowing user to edit the value through the keyboard
    // @param: idx - the id of the item to be put into edit mode
    // @param: elToFocus - the element to focus to, which could be either the key element box or value element box
    enterEditMode : function(idx, elToFocus){

      var item = false;

      // set the item to either the elToFocus param or query the key box
      if(elToFocus){
        switch(elToFocus){
          case 'key' :
            item = this.$.master.querySelector('#item-'+idx+' .key-value');
            break;
          case 'value' :
            item = this.$.master.querySelector('#item-'+idx+' .value');
            break;
          default :
            item = elToFocus;
        }
      }else{
        item = this.$.master.querySelector('#item-'+idx+' .key-value');
      }

      // get the item obj to focus
      var obj = this.kArr[idx];

      if(item.classList.contains('key-value') && obj.parent && obj.parent.type === "array"){
        return;
      }

      // if the currently focused item is not the "item-to-focus", focus it
      // which will also blur the current item
      // RETURN
      if(this.focusedItem !== item){
        item.focus();
        return;
      }

      // if the current editor exists, modify its editmode
      // prop to false before we overwrite the current edit item
      // variable entirely
      //
      // TIP: current_edit_item is just a reference to the currently
      // editing items internal object
      if(this.current_edit_item){
        this.current_edit_item.editmode = 0;
      }

      // overwrite the new edit object
      this.current_edit_item = obj;

      item.setAttribute('contenteditable', true);

    },







    // same as enterEditMode, but does it asyncronously
    // to allow the DOM elements to render and everything
    enterEditModeAsync : function(idx, elToFocus){
      return this.async(function(){
        this.enterEditMode(idx, elToFocus);
      }, null, 80);
    },



    // exits the given item from edit mode, this will work whether either key, or value
    // is currently in edit mode
    exitEditMode : function(){

      // if we don't have an edit item, return
      if(!this.current_edit_item){
        return;
      }

      this.current_edit_item.editmode = 0;
      this.current_edit_item = false;
      this.focusedItem.removeAttribute('contenteditable');
      this.focusedItem = false;

    },




    // accept the changes made to a given items key/value value
    // @param: idx - the unique id of the item we want to accept changes for
    acceptChanges : function(idx){

      // get the dom element and also the key/value elements
      var item = this.getDomItem(idx);
      var keyEl = item.querySelector('.key-value[data-idx="'+idx+'"]');
      var valueEl = item.querySelector('.value[data-idx="'+idx+'"]');

      // the item data object
      var obj = this.kArr[idx];

      // get the items "key" value
      if(keyEl){

        var key = keyEl.textContent;// || keyEl.innerText;
        obj.key = key;
        keyEl.innerHTML = key;
        // // if the user entered a key with length, then we can use it
        // if(key.length){
        //   obj.key = key;
        // }
        // // otherwise, its a blank key, so lets not save it and simply
        // // replace the on-screen value with the original key (before edits)
        // else{
        //   if(keyEl.textContent !== undefined){
        //     keyEl.textContent = obj.key;
        //   }else if(keyEl.innerText !== undefined){
        //     keyEl.innerText = obj.key;
        //   }
        // }
      }

      // get the items "value" value, same as the above
      if(valueEl){
        var value = valueEl.textContent;// || valueEl.innerText;
        obj.value = value;
        valueEl.innerHTML = value;
        // if(value.length){
        //   console.log("1");
        //   obj.value = value; 
        // }else{
        //   console.log("2");
        //   valueEl.innerHTML = obj.value;
        // }           
      }

      this.exitEditMode();

      this.fire('edit', {
        "editType" : "changesAccepted"
      });

    },


    addChildItems : function(parentIdx, children, overwrite){
      var parent = this.getItem(parentIdx);
      var _this = this;
      if(parent){

        if(overwrite){
          this.removeChildren(parent.idx);
        }

        this.forEachChild(children, function(child, key){
          _this.createNewItem(parent.idx, key, child);
        });
      }
    },


    createNewItem : function(parentIdx, key, value){

      var parent = this.getItem(parentIdx);
      var _this = this;

      if(parent && !this.valueIsEndpoint(parent.value)){

        var i = ++idx;

        var nObj = {
          "key" : null,
          "value" : null,
          "idx" : i,
          "type" : null,
          "parent" : parent,
          "childKeyIdx" : 0      
        };          


        parent.value.push(nObj);
        this.kArr[i] = nObj;


        if(this.isItemChildOfArray(i)){
          nObj.key = parent.value.length - 1;
        }
        else{
          if(key){
            nObj.key = key;
            this.setDuplicateKeys(i, key);
          }else{
            nObj.key = this.getAvailableKey(i);              
          }
        }

        if(value !== undefined){
          if(value && typeof(value) === "object"){
            nObj.value = [];
            if(value instanceof Array){
              nObj.type = "array";
            }else{
              nObj.type = "object";
            }
            this.addChildItems(nObj.idx, value)
          }
          else{
            nObj.type = "string";
            nObj.value = _this.valToString(value);
          }
        }

        return nObj;

      }

      return false;

    },



    // takes a normal JS object in its final format
    // and converts it to work nicer with the JSON editor...
    // this includes adding meta data and unique ids in order
    // to keep track of changes and data types
    compileObject : function(){

      var _this = this;

      // internal, private method to actually do the compiling, which
      // takes arguments in a specific fashion
      // @param: obj - the object to convert
      // @param: target - the target array the compiled object should go into
      // @param: [parent] - the parent of the current object, if needed for deep objects
      var runCompiler = function(obj, target, parent){

        // for(var k in obj){
        _this.forEachChild(obj, function(child, key){

          var i = ++idx;

          var nObj = {
            "key" : key,
            "idx" : i,
            "editmode" : 0,
            "parent" : parent || false,
            "childKeyIdx" : 0        
          };

          if(nObj.key === "_id" && !nObj.parent){
            nObj.locked = 1;
          }

          target.push(nObj);
          _this.kArr[i] = nObj;

          if(child && typeof(child) === "object"){
            nObj.value = [];
            if(child instanceof Array){
              nObj.type = "array";
            }else{
              nObj.type = "object";
            }
            runCompiler(child, nObj.value, nObj);
          }
          else{
            nObj.type = "string";
            nObj.value = _this.valToString(child);
          }

        });

      };

      // reset some variables to ensure the compilation comes out correctly
      idx = 0;
      // this.cObj = [];
      this.resetVariables();
      return runCompiler(this.obj, this.cObj.value, this.cObj);


    },




    // checks a particular object item if any of its siblings have the same key
    // (because no object level can have duplicate keys)...
    // @param: idx - the unique id of the item to compare
    // @param: value - the key value to compare with
    // @return: true, if duplicate is FOUND
    checkDuplicateKeys : function(idx, value){
      var item = this.kArr[idx];
      var parent = item.parent;
      var children = null;

      // if no parent is found, consider the compiled object the parent,
      // as well as the children
      if(!parent){
        parent = this.cObj;
        children = parent;
      }
      // otherwise, the children to compare with are the children of the item's parent
      else{
        children = parent.value;
      }

      // loop through children and check if any keys match, return true if so
      if(parent){
        for(var i=0; i<children.length; i++){
          var sib = children[i];
          if(sib.idx !== item.idx && sib.key === value){
            return sib;
          }
        }
      }

      // nothing matched or something else happened
      return false;

    },




    // generates a key that is available to use, taking into
    // account the given items siblings...the key is in the form
    // of "key (n)", with 'n' being an incremented integer from the
    // previous instance of "key (n-1)"...
    //
    // @param: idx - the unique id of the item to generate a key for
    // @return: key (string) a valid key that the item can use
    getAvailableKey : function(idx){

      // start with just "key"
      var prefix = "key";
      var key = prefix;

      var obj = this.kArr[idx];

      // start with 1 as the incrementer
      // var i = ++obj.parent.childKeyIdx;

      // as long as the current key is taken, we'll change
      // the increment number until it works
      while(this.checkDuplicateKeys(idx, key)){
        key = prefix + " (" + (++obj.parent.childKeyIdx) + ")";
      }

      // return either 'key' or 'key (n)'
      return key;

    },


    // returns the dom element for the item with the passed unique id
    // @param: idx - the unique id of the object item you need
    // @return: dom element of the wrapper element that holds the items
    // key and value (which could be comprised of children)
    getDomItem : function(idx, which){
      var item = this.$.master.querySelector('#item-'+idx);

      if(which){
        if(which === "key"){
          item = item.querySelector('span.key-value');
        }
        else if(which === "value"){
          item = item.querySelector('span.value');
        }
      }

      return item;

    },

    // returns true or false based on whether the given item is a direct
    // child of an array item type, this is useful in situations in which
    // we need to do certain things for direct array children
    // @param: idx - the id of the child item
    isItemChildOfArray : function(idx){
      var obj = this.kArr[idx];
      return obj && obj.parent && obj.parent.type === "array";
    },


    // returns a JS object in the plain form that the user would expect,
    // relative to what they see on screen...this is what you'd use to
    // retrieve the final, pure data object that the user has created
    toJSON : function(convertType, keepUndetermined){
      return this.reconstructObject(this.cObj.value, {}, convertType, keepUndetermined);
    },



    // used in the above toJSON method to create the final JSON object,
    // this should really only be used internally, as the params are somewhat
    // specific to implementation and instance
    // @param: obj - should be this.cObj in order to work correctly
    // @param: target - should initially be plain js object ({}) to start things off
    reconstructObject : function(obj, target, convertType, keepUndetermined){

      // for each item in the compiled object array (cObj)
      for(var i=0; i<obj.length; i++){

        var o = obj[i];

        // if the item doesnt have a designated type,
        // don't include it in the final product
        if(!keepUndetermined && !o.type){
          continue;
        }

        var key = o.key;
        var val = o.value;

        // if the items value is an object type,
        // it must have children
        if(val instanceof Array){
          // array types obviously become arrays
          if(o.type === "array"){
            target[key] = [];
          }
          // object types obviously become objects
          else{
            target[key] = {};
          }
          // recurse back through with the new value array
          // and the child object
          this.reconstructObject(o.value, target[key], convertType, keepUndetermined);
        }
        // otherwise, we're dealing with a static string or number (no children)
        else{
          if(convertType){
            val = this.convertType(val);
          }
          target[key] = val;
        }
      }
      // end loop

      return target;
    
    }



  });




})();
