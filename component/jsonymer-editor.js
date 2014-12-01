/**
 * Events
 *
 */

 /**
  * @event beforeItemAdded
  * @description Fires right before an item is added to the JSON structure. Using `event.preventDefault()` will cause the item to not be added.
  *
  * @param {object} parent - the parent item object that the new item will be added to
  */

 /** 
  * @event itemAdded
  * @description Fires after an item has been added to the JSON structure.
  * @param {object} item - the new item object added to the JSON structure
  */

 /** 
  * @event beforeItemRemoved
  * @description Fires right before an item is removed from the JSON structure. Using `event.preventDefault()` will cause the item to not be removed.
  *
  * @param {object} item - the item object that will be removed
  */

 /** 
  * @event itemRemoved
  * @description Fires after an item has been removed from the JSON structure.
  * @param {int} itemId - the index ID of the item that was removed
  * @param {object} parent - the parent item object of the item that was removed
  */

 /** 
  * @event keyValueChanged
  * @description Fires after a item's _key_ has been changed. *Note:* this event fires on every keystroke in the key input element. It will also fire when `setKeyValue()` is called with the `fireEvent` parameter set to true.
  *
  * @param {string} value - the value of the key input box
  * @param {element} element - the HTML element used for user input
  * @param {object} item - the item object for the `key : value` pair
  */

 /** 
  * @event propertyValueChanged
  * @description Fires after a item's _property_ has been changed. *Note:* this event fires on every keystroke in the property input element if the item is a _string type_. It will also fire when `setPropertyValue()` is called with the `fireEvent` parameter set to true.
  *
  * @param {string} value - the value of the value input box
  * @param {element} element - the HTML element used for user input
  * @param {object} item - the item object for the `key : value` pair
  */

 /** 
  * @event beforeItemtypeRemoved
  * @description Fires right before an item's _type_ has been removed (eg. the item goes back to an undetermined state). Using `event.preventDefault()` will cause the item type to not be removed.
  * @param {object} item - the item object that will lose its type
  */

 /** 
  * @event itemTypeRemoved
  * @description Fires after an item's _type_ has been removed.
  * @param {object} item - the item object that lost it's type
  */

 /** 
  * @event edit
  * @description Fires any time the JSON structure has been edited. This makes it possible to trace many of the element's events with one callback. The edit event fires in conjunction with the `itemAdded`, `itemRemoved`, `keyValueChanged`, `propertyValueChanged`, and `itemTypeRemoved` events. The edit event detail will be the same object as documented for each of these corresponding events (depending on what type of edit occurred), along with an additional property of `editType`.
  *
  * @param {string} editType - the type of edit that occurred, in the form of the name of the corresponding event
  */

 /** 
  * @event dirty
  * @description Fires when an error occurs within the JSON structure.
  * @param {object} error - the internal error object created for the error, as specified in the _dealing with errors section_
  * @param {object} item - the item object for the item that the error occurred on
  */

 /** 
  * @event clean
  * @description Fires once the JSON structure is void of any errors. No relevant `event.detail` is provided for this event.
  */





(function(){

  // unique id tracker
  var id = 0;

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

    /* END POLYMER INTERNAL METHODS */


    resetVariables : function(){
      this.cObj = {
        "id" : -1,
        "value" : [],
        "parent" : false,
        "childKeyIdx" : 0,
        "type" : "object"
      };
      this.kArr = {};
      this.errors = {};
      this.kArr[this.cObj.id] = this.cObj;
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
      else if(typeof(collection) === "object"){
        for(var i in collection){
          fn(collection[i], i);
        }
      }
    },

    getItem : function(id){
      return this.kArr[id];
    },

    getSiblings : function(id){
      var item = this.getItem(id);
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
      return item.id === -1;
    },

    itemCanHaveChildren : function(id){
      var item = this.getItem(id);
      if(item){
        return item.type === "array" || item.type === "object";
      }
      return false;
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
    /* END POLYMER TEMPLATE FILTER FUNCTIONS */








    
    /* POLYMER CHANGED EVENT METHODS */

    // everytime the obj property changes, we'll need to
    // compile the new object into our special format and reset
    // some variables
    objChanged : function(){
      if(typeof(this.obj) === "object"){
        return this.compileObject();
      }
    },
    /* END POLYMER CHANGED EVENT METHODS */


    







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


    /**
     * @method addItem
     *
     * @description Adds a new item into the passed _parentId_ item. If the item should be added to the top level, pass `-1` for the parentId. This method is also used by the editor template as well, so any events dealing with items being added will fire `beforeItemAdded`, `itemAdded`, and `edit`. If you want to circumvent this behavior, use `createNewItem()` instead.
     *
     * @param parentId - The id of the parent that the new item will be added to.
     *
     * @param [key] - The key for the new item. Passing any falsey value (besides _0_) will result in a generated key. If a key is passed that already exists in some sibling, duplicate key errors will be set.
     *
     * @param [value] - The value for the new item. If a string or falsey value is passed, it will be converted to a string representation. If an object or array is passed, those items will automatically be generated into the editor as children. If `undefined` is passed, the new item will have an undetermined type.
     *
     * @param [editMode] - Set to true to send the new item's key into edit mode (focus).
     *
     * @returns {object} The new item object that was added to the editor or `false` if some error.
     *
     */
    addItem : function(parentId, passedKey, passedValue, editMode){
      

      if(this.isCalledFromDom(arguments)){
        var el = arguments[2];
        var parentId = el.getAttribute('data-id');
        return this.addItem(parentId, undefined, undefined, true);
      }


      var _this = this;

      // get the parent object
      var targetParent = this.kArr[parentId] || this.cObj;

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

      var item = this.createNewItem(parentId, passedKey, passedValue);

      // automatically enter edit mode into the new items "key" edit box
      if(editMode && targetParent.type !== "array"){
        this.enterEditModeAsync(item.id);
      }


      var detail = {
        "item" : item
      };

      this.fireEditEvent(detail, 'itemAdded', true);

      return item;
      
    },



    /**
     * @method removeItem
     *
     * @description Removes an item from the editor. This will also remove any children the item might have, remove any errors placed on these children, as well as resolve any duplicate key errors that were placed on the item itself. The events `beforeItemRemoved` and `itemRemoved` will both fire when this method is called.
     *
     * @param itemId - The id of the item to remove
     *
     * @returns {boolean} Returns `true` if the item was removed, `false` if an error occured.
     *
     */
    removeItem : function(itemId){

      if(this.isCalledFromDom(arguments)){
        var el = arguments[2];
        var id = el.getAttribute('data-id');
        return this.removeItem(id);
      }


      var obj = this.getItem(itemId);
      
      if(obj && !this.itemIsRoot(obj)){

        var parent = (obj.parent && obj.parent.value) || this.cObj.value;
        var itemChildOfArray = this.isItemChildOfArray(itemId);

        if(parent){

          for(var i=0; i<parent.length; i++){
            
            var tObj = parent[i];

            if(tObj.id === obj.id){

              var eventObj = this.fire('beforeItemRemoved', {
                "item" : obj,
              });

              // if the user used preventDefault in their callback for
              // "beforeItemRemoved" lets not actually remove the item!
              if(eventObj.defaultPrevented){
                return null;
              }

              // clear all errors from this item and its children
              this.clearError(itemId);
              this.clearDescendingErrors(itemId);

              // remove item from parent and key map array
              parent.splice(i, 1);
              this.removeItemFromKeyMap(itemId);


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
                "id" : itemId,
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
        var itemid = arguments[0] || null;
        var which = arguments[1] || null;
        if(which !== 'key' && which !== 'value'){
          which = 'key';
        }
        var domItem = this.getDomItem(itemid, which);
        return domItem.focus();
      }

      var id = el.getAttribute('data-id');

      var obj = this.kArr[id];

      // if we're trying to focus on a key, and the item is a direct child of
      // an array type, cancel out, because array keys should not be editable
      if(el.classList.contains('key-value') && this.isItemChildOfArray(id)){
        return;
      }

      this.focusedItem = el;
      this.enterEditMode(id, el);

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
          var id = el.getAttribute('data-id');
          el.blur();
          // on enter, focus next value (like tab)
          var nextFocusable = this.getNextFocusableItem(id);
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
      var id = el.getAttribute('data-id');
      var v = el.innerText;
      var dup = this.checkDuplicateKeys(id, v);
      if(dup){
        this.setError(dup.id, "_dup", "You cannot have duplicate keys in the same level.");
        this.setError(id, "_dup", "You cannot have duplicate keys in the same level.");
      }else{
        this.clearError(id, "_dup");
      }
    },


    doInput : function(e, data, el){

      var key = el.classList.contains('key-value');
      var id = el.getAttribute('data-id');
      var obj = this.kArr[id];
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


    /**
     * @method setKeyValue
     *
     * @description Changes the key value for the corresponding item. If no key is passed, one will be generated and used instead. If the new key matches that of a sibling, duplicate key errors will be set. If the item is an _Array Item_, this method will fail, as those keys must be ordered and uneditable.
     *
     * @param itemId - The id of the item that will get the new key
     *
     * @param [newKey] - The new key value, as a string or number. False values (besides _0_) will result in a generated key.
     *
     * @param [fireEvents=false] - Set to true to ensure that the `keyValueChanged` and `edit` events are fired.
     *
     * @returns {boolean} Returns `true` if the item the key was changed, `false` if an error occured.
     *
     */
    setKeyValue : function(id, newKey, fireEvents){


      if(this.isCalledFromDom(arguments)){
        var el = arguments[2] || null;
        var itemid = el.getAttribute('data-id');
        var val = el.textContent || el.innerText;
        return this.setKeyValue(itemid, val, true);
      }


      if(this.isItemChildOfArray(id)){
        return false;
      }

      var item = this.kArr[id];

      var oldKey = item.key;
      if(newKey === undefined){
        item.key = this.getAvailableKey(item.id);
      }
      else{
        item.key = this.valToString(newKey);
      }
      

      this.resetDuplicateKeys(this.getSiblings(id), oldKey);
      this.setDuplicateKeys(id, newKey);

      if(fireEvents){
        var eventDetail = {
          "value" : newKey,
          "oldValue" : oldKey,
          "element" : this.getDomItem(id, 'key'),
          "item" : this.getItem(id)            
        };
        this.fireEditEvent(eventDetail, 'keyValueChanged', true);
      }

      return true;

    },



    /**
     * @method setPropertyValue
     *
     * @description Changes the property value for the corresponding item. If the passed item is some _endpoint value_ (string, number, falsey value besides _undefined_) then the value will become the string representation of that value. If that's the case, and the item is of an array or object type, any children attached to those will be removed and the item type will change to string. If the property value is an object or array, any children in that value will be added to the editor.

     If the call to `setPropertyValue` causes the item's type to change, and the `fireEvents` argument is true, the `itemTypeChanged`, `propertyValueChanged`, and `edit` events will all fire. If the item's type did not change, only the `propertyValueChanged` and `edit` events will fire. Note that in the first case, several edit events may fire.

     If the passed value is `undefined`, the item type and its children will be removed and the type will become _undetermined_.
     *
     * @param itemId - The id of the item that will get the new value
     *
     * @param [newValue] - The new value for the item. Arrays and Objects will turn the item into Array or Object types. String / Number or falsey values will become strings. Undefined value will cause the item type to be _undetermined_.
     *
     * @param [fireEvents=false] - Set to true to ensure that all resulting events will fire. These events will be `itemTypeChanged`, `propertyValueChanged`, and `edit` if the items type changed. Otherwise, just `propertyValueChanged` and `edit` will fire.
     *
     * @returns {boolean} Returns `true` if the item value was changed, `false` if an error occured.
     *
     */
    setPropertyValue : function(id, newValue, fireEvents){

      if(this.isCalledFromDom(arguments)){
        var el = arguments[2] || null;
        var itemid = el.getAttribute('data-id');
        var val = el.textContent || el.innerText;
        return this.setPropertyValue(itemid, val, true);
      }


      var item = this.getItem(id);
      var oldValue = item.value;


      var valType = this.typeOfValue(newValue);
      if(valType !== item.type){
        this.removeValue(item.id, false);
        this.setItemType(item.id, valType, fireEvents);
      }

      if(valType !== undefined){
        if(valType === "string"){
          item.value = this.valToString(newValue);
        }
        else{
          this.addChildItems(item.id, newValue, true);
        }
      }
        

      if(fireEvents){
        var eventDetail = {
          "value" : newValue,
          "oldValue" : oldValue,
          "element" : this.getDomItem(id, 'value'),
          "item" : item           
        };
        this.fireEditEvent(eventDetail, 'propertyValueChanged', true);
      }

    },


    // on blur of key-value box, exit edit mode and accept the new
    // changes for the item
    doBlur : function(e, data, el){
      var id = el.getAttribute('data-id');
      var obj = this.kArr[id];
      this.clearElementSelection();
      this.exitEditMode();
      this.acceptChanges(id);
    },


    setItemType : function(itemid, type, fireEvent){

      var item = this.kArr[itemid];
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
      var id = el.getAttribute('data-id');
      this.setItemType(id, 'string', true);
      this.enterEditModeAsync(id, 'value');
    },


    makeItemObject : function(e, data, el){
      var id = el.getAttribute('data-id');
      this.setItemType(id, 'object', true);

      this.async(function(){
        var itemEl = this.getDomItem(id);
        itemEl.querySelector("a.add-item[data-id='"+id+"']").focus();
      });

    },

    makeItemArray : function(e, data, el){
      var id = el.getAttribute('data-id');
      this.setItemType(id, 'array', true);

      this.async(function(){
        var itemEl = this.getDomItem(id);
        itemEl.querySelector("a.add-item[data-id='"+id+"']").focus();
      });

    },


    onEnterDoClick : function(e, data, el){
      if(e.which === 13){
        e.preventDefault();
        el.click();
      }
    },


    /**
     * @method removeValue
     *
     * @description Removes the value and type of the corresponding item. If the item has children, those items will be removed along with any errors attached to those items.
     *
     * @param itemId - The id of the item that will lose it's value
     *
     * @param [fireEvent=false] - Set to true to ensure that the `beforeItemTypeRemoved`, `itemTypeRemoved`, and `edit` events are fired.
     *
     * @returns {boolean} Return `true` if the item's value was removed, `false` if an error occured.
     *
     */
    removeValue : function(itemid, fireEvent){


      if(this.isCalledFromDom(arguments)){
        var el = arguments[2];
        var itemid = el.getAttribute('data-id');
        return this.removeValue(itemid, true);
      }

      var obj = this.kArr[itemid];

      var eventResp = this.fire('beforeItemTypeRemoved', {
        "item" : obj
      });

      if(eventResp.defaultPrevented){
        return;
      }

      this.removeChildren(obj.id);
      obj.value = null;
      obj.type = null;


      if(fireEvent){
        var eventDetail = {
          item : obj
        };
        this.fireEditEvent(eventDetail, 'itemTypeRemoved', false);
      }

    },

    /* END POLYMER TEMPLATE EVENT HOOKS */



    removeChildren : function(parentid){
      var parent = this.getItem(parentid);
      if(parent && !this.valueIsEndpoint(parent.value)){
        this.clearDescendingErrors(parentid);
        this.removeChildrenFromKeyMap(parentid);
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
      this.clearError(foundItem.id, "_dup");
    },


    setDuplicateKeys : function(id, targetKey){
      var dup = this.checkDuplicateKeys(id, targetKey);
      if(dup){
        this.setError(dup.id, "_dup", "You cannot have duplicate keys in the same level.", {key:targetKey});
        this.setError(id, "_dup", "You cannot have duplicate keys in the same level.", {key:targetKey});
      }else{
        this.clearError(id, "_dup");
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


    /**
     * @method getNextItem
     *
     * @description Returns the next item in the JSON heirarchy. This item could be the _first child_ of the item, if it has children, or the _next possible sibling_. This sibling could be a direct sibling of the item, or possibly a sibling of some ancestor of the item. Visually, this will return the next item immediately below the item that was passed.
     *
     * @param itemId - The id of the item
     *
     * @returns {object} Returns the next adjacent item, or `null` if no item was found or the bottom of the data structure was hit.
     *
     */
    getNextItem : function(id){

      var obj = this.getItem(id);

      if(obj){
        // if item has children, return first child
        if(this.isArray(obj.value) && obj.value.length){
          return obj.value[0];
        }

        var safety = this.getItemLength();

        while(safety-- > 0){
          var sibling = this.getNextSibling(obj.id);
          if(!sibling && obj.parent){
            obj = obj.parent;
          }else{
            return sibling;
          }
        }
      }

      return null;

    },


    /**
     * @method getNextSibling
     *
     * @description Returns the next immediate sibling below the item, or `null` or no sibling is found.
     *
     * @param itemId - The id of the item
     *
     * @returns {object} Returns the next sibling, or `null` if no sibling was found.
     *
     */
    getNextSibling : function(id){
      var obj = this.getItem(id);
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


    /**
     * @method getParent
     *
     * @description Returns the parent of the item, or `null` if the item is the top level.
     *
     * @param itemId - The id of the item
     *
     * @returns {object} Returns the parent of the item, or `null` if the item is the top level.
     *
     */
    getParent : function(id){
      var obj = this.getItem(id);
      return obj.parent || null;
    },


    getNextFocusableItem : function(id){
      var nextItem = this.getNextItem(id);
      if(nextItem){
        var item = this.getDomItem(nextItem.id);
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



    removeItemFromKeyMap : function(id){
      
      // this recurses through all descending children
      this.removeChildrenFromKeyMap(id);
      delete this.kArr[id];

    },

    removeChildrenFromKeyMap : function(id){

      var item = this.kArr[id];
      
      // if item has children, go through each child and remove them first
      // in a recursive many (if child has children has children has children, etc)
      if(item.value instanceof Array){
        for(var i=0; i<item.value.length; i++){
          this.removeItemFromKeyMap(item.value[i].id);
        }
      }
    },




    /**
     * @method setError
     *
     * @desc This sets an error on a specific object item, making the key of the item a red color, along with an exclaimation mark icon set in between the key and value (these styles can obviously be changed by _you_). The optional `errorStr` argument will show up as a native tooltip as the user hovers over the item. The error will then be stored on the `jsonymerInstance.errors` property, in the format:
```javascript
errors : {
  "<item-id>" : {
    "<error-id>" : {
      "error" : "<error-string>",
      "data" : "<error-data>"
    },
    "<error-id-2>" : { ... }
  },
  "<item-id-2>" : { ... }
}
```
      * *Note*: This method does nothing if you set `jsonymerInstance.errorsOn = false`.
      *
      * @param itemId - The index ID of the item the error should be set on
      *
      * @param errorId - A unique error ID (generated by you) that you can use to identify the error. This allows you to have multiple errors on a single item, as well as cherry-pick a specific error to remove when needed.
      *
      * *Note*: the errorId `_dup` is currently used internally for duplicate key errors, so using that as an errorId may be problematic.
      *
      * @param [errorStr=''] - The public facing error string you'd like the user to see when hovering over the item.
      *
      * @param [data=null] - Any additional data you need for the error for possible future use when clearing the error
      *
      * @returns {object} The error object that was created for the error, or `false` if no error was created.
     */
    setError : function(id, errorID, str, data){
      
      if(!this.errorsOn){ return false; }

      if(!errorID){
        throw new Error("No error ID given in setError on item " + id);
      }

      var item = this.getItem(id);

      if(item){

        if(!this.errors[id]){
          this.errors[id] = {};
        }

        var errObj = {
          "id" : id,
          "errorID" : errorID,
          "error" : str || "",
          "data" : data || null
        };

        this.errors[id][errorID] = errObj;

        item.error = errObj;

        // this.async(function(){
        //   var $item = this.getDomItem(id);
        //   $item.setAttribute('error', true);
        //   $item.setAttribute('title', str);          
        // }, 0);


        this.fire('dirty', {
          error : errObj,
          item : this.kArr[id]
        });

        return errObj;

      }


    },


    /**
     * @method getError
     *
     * @desc This returns the specific error object with the passed error ID, on the specific item with the passed item ID. If no error id is passed, all errors found on the item with passed item id will be returned. If no item id is passed, the entire error object is returned.
     *
     * @param [itemId] - The ID of the item that has the error you need
     *
     * @param [errorId] - The error ID that was given when the error was first created
     *
     * @returns {object} - The specific error object / All errors for the item / All errors in the entire data structure
     */
    getError : function(id, errorID){
      if(errorID && this.errors[id]){
        return this.errors[id][errorID];
      }
      else if(id){
        return this.errors[id];
      }
      return this.errors;
    },


    /**
     * @method clearError
     *
     * @desc Clears the error attached to the given item ID with the given error ID. If no error ID is given, all errors attached to the item will be removed.
     *
     * @param itemId - The ID of the item that has the error you need to remove
     *
     * @param [errorId] - The unique error ID (you created yourself) that was given when the error was first created. If not present, all errors for the item will be cleared
     *
     * @returns {boolean} `true` if the error was cleared, `false` if it was not because of some error or if it did not exist.
     */
    clearError : function(id, errorID){

      if(!this.errorsOn){ return false; }

      var item = this.getItem(id);

      if(this.errors[id]){

        if(errorID !== undefined){
          delete this.errors[id][errorID];
        }
        else{
          delete this.errors[id];
        }

        var currentError = this.hasError(id);

        if(!currentError){

          // this.async(function(){
          //   var $item = this.getDomItem(id);
          //   $item.removeAttribute('error');
          //   $item.removeAttribute('title');
          // }, 0);

          delete this.errors[id];
          item.error = false;

          if(!this.hasError()){
            this.fire('clean');
          }

        }

        else{
          item.error = currentError;
        }

        return true;

      }

      return false;

    },

    // clear all errors existing on any descending child
    // if the item is not of array/object type, it will clear
    // errors from the item itself...if the item IS of array/object
    // type, no errors will be cleared from the passed item itself
    clearDescendingErrors : function(id){

      if(!this.errorsOn){ return; }

      var item = this.getItem(id);
      var _this = this;

      if(item){
        this.forEachChild(item.value, function(child){
          _this.clearDescendingErrors(child.id);
          _this.clearError(child.id);
        });        
      }

    },


    /**
     * @method hasError
     *
     * @desc Returns true or false based on whether the specified item (or whole object) has an error or not. If you pass an item ID, the method will return a value based on the _validity_ of that item only. If you do not pass an item ID, the method will return based on the validity of the whole object in total, returning true if any error is found, and false if no errors.
     *
     * @param [itemId] - the item ID that you'd like to check for errors on.
     *
     * @returns The first error found matching the passed arguments or `false`
     */
    hasError : function(id){
      var toSearch = id ? this.errors[id] : this.errors;
      for(var k in toSearch){
        return toSearch[k];
      }
      return false;
    },






    // enters edit mode for a given item, allowing user to edit the value through the keyboard
    // @param: id - the id of the item to be put into edit mode
    // @param: elToFocus - the element to focus to, which could be either the key element box or value element box
    enterEditMode : function(id, elToFocus){

      var item = false;

      // set the item to either the elToFocus param or query the key box
      if(elToFocus){
        switch(elToFocus){
          case 'key' :
            item = this.$.master.querySelector('#item-'+id+' .key-value');
            break;
          case 'value' :
            item = this.$.master.querySelector('#item-'+id+' .value');
            break;
          default :
            item = elToFocus;
        }
      }else{
        item = this.$.master.querySelector('#item-'+id+' .key-value');
      }

      // get the item obj to focus
      var obj = this.kArr[id];

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

      if(elToFocus === "value" || item.classList.contains('value')){
        item.innerHTML = obj.value;
      }

    },







    // same as enterEditMode, but does it asyncronously
    // to allow the DOM elements to render and everything
    enterEditModeAsync : function(id, elToFocus){
      return this.async(function(){
        this.enterEditMode(id, elToFocus);
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
    // @param: id - the unique id of the item we want to accept changes for
    acceptChanges : function(id){

      // get the dom element and also the key/value elements
      var item = this.getDomItem(id);
      var keyEl = item.querySelector('.key-value[data-id="'+id+'"]');
      var valueEl = item.querySelector('.value[data-id="'+id+'"]');

      // the item data object
      var obj = this.kArr[id];

      // get the items "key" value
      if(keyEl){
        var key = keyEl.textContent;
        obj.key = key;
        keyEl.innerHTML = key;
      }

      // get the items "value" value, same as the above
      if(valueEl){
        var value = valueEl.textContent;
        obj.value = value;
        valueEl.innerHTML = value;          
      }

      this.exitEditMode();

      this.fire('edit', {
        "editType" : "changesAccepted"
      });

    },


    addChildItems : function(parentid, children, overwrite){

      var parent = this.getItem(parentid);
      var _this = this;

      if(parent && this.itemCanHaveChildren(parentid)){


        if(!this.valueIsEndpoint(children)){

          // if the children dont match what the item type is
          if( 
            (children instanceof Array && parent.type === "object") ||
            (!(children instanceof Array) && parent.type === "array")
          ){
            return false;
          }


          if(overwrite){
            this.removeChildren(parent.id);
          }

          this.forEachChild(children, function(child, key){
            _this.createNewItem(parent.id, key, child);
          });

          return parent;

        }

      }

      return false;

    },

    /**
     * @method createNewItem
     *
     * @description Identical to `addItem()`, although without the overhead of firing events and putting anything into edit mode.
     *
     * @param parentId - The id of the parent that the new item will be added to.
     *
     * @param [key] - The key for the new item. Passing any falsey value (besides _0_) will result in a generated key. If a key is passed that already exists in some sibling, duplicate key errors will be set.
     *
     * @param [value] - The value for the new item. If a string or falsey value is passed, it will be converted to a string representation. If an object or array is passed, those items will automatically be generated into the editor as children. If `undefined` is passed, the new item will have an _undetermined type_.
     *
     * @returns {object} Returns the new item that was created or `false` if an error occured.
     *
     */
    createNewItem : function(parentid, key, value){

      var parent = this.getItem(parentid);
      var _this = this;

      if(parent && !this.valueIsEndpoint(parent.value)){

        var i = ++id;

        var nObj = {
          "key" : null,
          "value" : undefined,
          "id" : i,
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
          if(key || key === 0){
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
            this.addChildItems(nObj.id, value)
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
      // var runCompiler = function(obj, target, parent){

      //   // for(var k in obj){
      //   _this.forEachChild(obj, function(child, key){

      //     var i = ++id;

      //     var nObj = {
      //       "key" : key,
      //       "id" : i,
      //       "editmode" : 0,
      //       "parent" : parent || false,
      //       "childKeyIdx" : 0        
      //     };

      //     if(nObj.key === "_id" && !nObj.parent){
      //       nObj.locked = 1;
      //     }

      //     target.push(nObj);
      //     _this.kArr[i] = nObj;

      //     if(child && typeof(child) === "object"){
      //       nObj.value = [];
      //       if(child instanceof Array){
      //         nObj.type = "array";
      //       }else{
      //         nObj.type = "object";
      //       }
      //       runCompiler(child, nObj.value, nObj);
      //     }
      //     else{
      //       nObj.type = "string";
      //       nObj.value = _this.valToString(child);
      //     }

      //   });

      // };

      // reset some variables to ensure the compilation comes out correctly
      id = 0;
      // this.cObj = [];
      this.resetVariables();

      return this.addChildItems(-1, this.obj);

      // return runCompiler(this.obj, this.cObj.value, this.cObj);


    },




    /**
     * @method checkDuplicateKeys
     *
     * @desc This compares a prospective key value for an item with the current key values of its siblings and checks if an item already exists with that key. This method returns false if it is safe to apply the key to the item. If a match is found, the first one is immediately returned to you.
     *
     * @param itemId - The ID of the item that will get a new key
     * @param testKey - The prospective value for the item (this value will be compared to its siblings)
     *
     * @returns {object} The first sibling `item` with a key matching the _value_ argument or `false`
     */
    checkDuplicateKeys : function(id, value){

      var item = this.getItem(id);
      var parent = item.parent;

      // loop through children and check if any keys match, return true if so
      if(parent){
        var children = parent.value;
        for(var i=0; i<children.length; i++){
          var sib = children[i];
          if(sib.id !== item.id && sib.key === value){
            return sib;
          }
        }
      }

      // nothing matched or something else happened
      return false;

    },



    /**
     * @method getAvailableKey
     *
     * @description Generates and returns a unique key relative to it's siblings. This key will start out as _key_, and increment to _key (1), key (2),...key (n)_ on every call. This is important to note, as the appended number to the generated key won't necessarily be _1 incremented step_ above the next highest key. This is simply to improve efficiency and limit the amount of checks necessary. Also, note that this method will return a new, incremented key for every call. It will not try to find the lowest possible incremented number, it just increments, validates, and returns.
     *
     * @param itemId - The id of the item to generate a key for.
     *
     * @returns {string} a valid key that the item can use
     *
     */
    getAvailableKey : function(id){

      // start with just "key"
      var prefix = "key";
      var key = prefix;

      var obj = this.getItem(id);

      // as long as the current key is taken, we'll change
      // the increment number until it works
      while(this.checkDuplicateKeys(id, key)){
        key = prefix + " (" + (++obj.parent.childKeyIdx) + ")";
      }

      // return either 'key' or 'key (n)'
      return key;

    },


    // returns the dom element for the item with the passed unique id
    // @param: id - the unique id of the object item you need
    // @return: dom element of the wrapper element that holds the items
    // key and value (which could be comprised of children)
    getDomItem : function(id, which){
      var item = this.$.master.querySelector('#item-'+id);

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
    // @param: id - the id of the child item
    isItemChildOfArray : function(id){
      var obj = this.getItem(id);
      return obj && obj.parent && obj.parent.type === "array";
    },



    /**
     * @method toJSON
     *
     * @desc Returns the object in its final format, as shown on screen.
     *
     * @param {boolean} [convertType=false] - Pass `true` if you'd like item values to be converted into native types. The possible values that can be converted are `numbers/floats`, `null`, `undefined`, `true`, and `false`.
     *
     * @param {boolean} [preserveUndetermined=false] - Pass `true` if you'd like any data item that has no chosen type (string/object/array) to be preserved in the final object with a value of `undefined`. Otherwise, any item with an undetermined type will not be provided in the returned object.
     *
     * @returns {object} a javascript object containing the user's data as it appears on the screen
     */
    toJSON : function(convertType, preserveUndetermined){
      return this.reconstructObject(this.cObj.value, {}, convertType, preserveUndetermined);
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
