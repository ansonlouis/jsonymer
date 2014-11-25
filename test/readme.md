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
  - toJSON




- making types correct
- add event detail assertions to events
- errorsOn


TODO: 
- look into what we should do with addItem() when passing falsy key value (as well as createNewItem())
