<!-- readme.md -->

Tests:

-√ all events
  -√ beforeItemAdded
  -√ itemAdded
  -√ beforeItemRemoved
  -√ itemRemoved
  -√ keyValueChanged
  -√ propertyValueChanged
  -√ beforeItemTypeRemoved
  -√ itemTypeRemoved
  -√ itemTypeChanged
  -√ edit
  -√ dirty
  -√ clean

- all methods exposed in the DOCS
  -√ valueIsEndpoint
  -√ addItem
  -√ removeItem
  -√ setKeyValue
  -√ setPropertyValue
  -√ setItemType
  -√ removeType
  -√ removeChildren
  -√ getNextItem
  -√ getNextSibling
  -√ getParent
  -X getNextFocusableItem
  -√ setError
  -√ getError
  -√ clearError
  -√ clearDescendingErrors
  -√ hasError
  -√ addChildItems
  -√ createNewItem
  -√ checkDuplicateKeys
  -√ getAvailableKey
  -√ isItemChildOfArray
  -√ toJSON




- making types correct
- add event detail assertions to events
- errorsOn


TODO: 
-√ look into what we should do with addItem() when passing falsy key value (as well as createNewItem())
- SPRITIFY ICONS DUDE
-√ change "idx" term to just "id"
-√ add "required" icon to doc params
- add "clear descending errors" check to tests removeType / removeItem / etc...
- clean up all the inline code in the docs so theres not so much of them
- figure out what to do with "acceptChanges"
-√ rewrite the keyvaluechanged, propertyvaluechanged doc paragraph



Current Doc Methods

-√ toJSON
-√ setError
-√ getError
-√ clearError
-√ hasError
-√ checkDuplicateKeys
-√ addItem
-√ removeItem
-√ setKeyValue
-√ setPropertyValue
-√ removeValue
-√ getNextItem
-√ getNextSibling
-√ getParent
-√ createNewItem
-√ getAvailableKey



Events

- beforeItemAdded
- itemAdded
- beforeItemRemoved
- itemRemoved
- keyValueChanged
- propertyValueChanged
- beforeItemtypeRemoved
- itemTypeRemoved
- edit
- dirty
- clean




jsDoc-onize

-√ toJSON
-√ setError
-√ getError
-√ clearError
-√ hasError
-√ checkDuplicateKeys
-√ addItem
-√ removeItem
-√ setKeyValue
-√ setPropertyValue
-√ removeValue
-√ getNextItem
-√ getNextSibling
-√ getParent
-√ createNewItem
-√ getAvailableKey

-√ beforeItemAdded
-√ itemAdded
-√ beforeItemRemoved
-√ itemRemoved
-√ keyValueChanged
-√ propertyValueChanged
-√ beforeItemtypeRemoved
-√ itemTypeRemoved
-√ edit
-√ dirty
-√ clean