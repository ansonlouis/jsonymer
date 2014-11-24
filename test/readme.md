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
  - clearError
  - clearDescendingErrors
  - hasError
  - addChildItems
  - createNewItem
  - checkDuplicateKeys
  - getAvailableKey
  - isItemChildOfArray





- adding/removing/editing items
- dup key error and removal
- making types correct
- add event detail assertions to events

TODO: 
- look into what we should do with addItem() when passing falsy key value
