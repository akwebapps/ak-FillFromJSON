# akFillFromJSON

A jQuery plugin for populating HTML elements from JSON data, including support for arrays of objects, conditional display, value formatting, lazy loading, templates, and dynamic attribute/class assignment.

## Usage

Create the plugin instance directly:

```javascript
$(function() {
    var myFill = new $.akFillFromJSON($('#element'), options, arg);

    myFill.foo_public_method();
});
```

Or initialize through the jQuery plugin interface:

```javascript
$(function() {
    $('#myHolder').akFillFromJSON(options, arg);
});
```

## Initialization Options

```javascript
$("#myHolder").akFillFromJSON({
    readOnly: false,
    joinBy: ", ",
    replaceArr: [],
    lazyLoading: false,
    recordCount: null,
    append: false,
    data: {},
    primaryKey: "",
    fromFieldEvent: false,
    template: null,

    beforeObj: function(fieldName, dataObj, settings) {
    },

    callback: function(fieldName, $placedItem, dataObj, settings) {
    },

    showLog: false
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `readOnly` | Boolean | `false` | Controls whether `setElemVal` is used on form elements. |
| `joinBy` | String | `", "` | Separator used when an array contains strings that need to be joined. |
| `replaceArr` | Array | `[]` | Replacements applied to string values. Use `["replaceThis", "withThis"]` or multiple replacement pairs. |
| `lazyLoading` | Boolean | `false` | Loads elements up to the height of the screen and loads more as the user scrolls. |
| `recordCount` | Number/null | `null` | Number of records to load at a time. With `lazyLoading`, additional records load when the last visible record becomes visible. |
| `append` | Boolean | `false` | Appends additional records instead of clearing existing records. |
| `data` | Object | `{}` | Data source used to populate the holder. |
| `primaryKey` | String | `""` | Primary key used when processing records. |
| `fromFieldEvent` | Boolean | `false` | Prevents `toggleFieldRow` from triggering. |
| `template` | Object/null | `null` | Forces a specific template for each object in an array. |
| `beforeObj` | Function | — | Called before processing each object in an array. Can modify `settings.template` to force a template. |
| `callback` | Function | — | Called after each object is appended. |
| `showLog` | Boolean/Array | `false` | Enables logging for non-`akForm` elements. Can be `true`, `false`, or an array such as `["display", "fields"]`. |

## Classes and Field Binding

The plugin uses a field-name convention based on the JSON object's keys.

For a field named `title`, the following classes can be used:

```html
<span class="titleVal"></span>
<div class="titleDiv"></div>
<div class="not-titleDiv"></div>
```

### Conditional Display

#### `[field]Div`

Displays an element when the field has a value and hides it when the field has no value.

```html
<div class="titleDiv">
    <span class="titleVal"></span>
</div>
```

#### `.not-[field]Div`

Displays an element when the field has no value and hides it when the field has a value.

```html
<div class="not-titleDiv">
    No title available.
</div>
```

## Value Population

### `[field]Val`

Populates the contents of a standard element.

```html
<span class="titleVal"></span>
```

### Media Elements

For `<img>`, `<iframe>`, `<embed>`, and `<video>`, `[field]Val` populates the `src` attribute.

```html
<img class="imageVal">
```

#### `data-path`

Prefixes the value with `data-path`.

```html
<img
    class="imageVal"
    data-path="/assets/images/"
>
```

Result:

```text
/assets/images/<value>
```

#### `data-append`

Appends additional text after the value.

```html
<img
    class="imageVal"
    data-path="/assets/images/"
    data-append=".jpg"
>
```

Result:

```text
/assets/images/<value>.jpg
```

### `<object>`

For `<object>`, `[field]Val` populates the `data` attribute.

```html
<object class="documentVal"></object>
```

`data-path` and `data-append` are supported in the same way as media elements.

### Links

#### `[field]Val-link`

Populates an anchor's `href`.

```html
<a class="websiteVal-link">Website</a>
```

Supports:

- `data-path`
- `data-append`

#### `[field]Val-email`

Creates an email link:

```html
<a class="emailVal-email"></a>
```

Resulting `href`:

```text
mailto:<value>
```

#### `[field]Val-tel`

Creates a telephone link:

```html
<a class="phoneVal-tel"></a>
```

Resulting `href`:

```text
tel:<value>
```

#### `[field]Val-social`

Creates a social URL using `data-base`.

```html
<a
    class="usernameVal-social"
    data-base="https://example.com/"
></a>
```

Resulting `href`:

```text
https://example.com/<value>
```

## Specialized Value Classes

### `[field]Val-width`

Assigns the field value to the element's CSS `width`.

If the value is numeric, the `hidden` and `d-none` classes are removed.

If the value is not numeric, `hidden` and `d-none` are added.

```html
<div class="progressVal-width"></div>
```

### `[field]Val-inpV`

Populates an input's `value`.

```html
<input class="usernameVal-inpV">
```

### `[field]Val-inpN`

Populates an input's `name` and assigns the field value as a class.

```html
<input class="usernameVal-inpN">
```

### `[field]Val-title`

Populates the element's `title` property.

```html
<span class="titleVal-title"></span>
```

### `[field]Val-attr`

Creates a `data-*` attribute using a slugified field name.

```html
<div class="userVal-attr"></div>
```

The resulting attribute follows the pattern:

```html
data-user="..."
```

### `[field]Val-class`

Adds the field value as a CSS class.

```html
<div class="statusVal-class"></div>
```

## String Formatting

The plugin supports formatter suffixes on `[field]Val`.

### `.camelCase`

Converts a string to camel case.

```html
<span class="nameVal.camelCase"></span>
```

### `.pascalCase`

Converts a string to Pascal case.

```html
<span class="nameVal.pascalCase"></span>
```

### `.alphaNumify`

Converts a string to alphanumeric characters only.

```html
<span class="nameVal.alphaNumify"></span>
```

### `.slugify`

Converts a string to a slug.

```html
<span class="nameVal.slugify"></span>
```

### `.toHTML`

Converts a string to HTML, including converting line breaks to `<br>`.

```html
<div class="descriptionVal.toHTML"></div>
```

### `.toText`

Converts HTML into text only.

```html
<div class="descriptionVal.toText"></div>
```

### `.toNumber-commas`

Formats a number with commas.

```html
<span class="amountVal.toNumber-commas"></span>
```

Example:

```text
5123456.345
```

becomes:

```text
5,123,456.345
```

### `.toNumber-money`

Formats a number as money.

```html
<span class="amountVal.toNumber-money"></span>
```

### `.toNumber-percent`

Appends `%` to the value.

```html
<span class="completionVal.toNumber-percent"></span>
```

### `.toColorBlock`

Sets the element's HTML to a block representing the color value.

```html
<div class="colorVal.toColorBlock"></div>
```

### `.toFAicon`

Creates a Font Awesome icon from the field value and adds the required `fa`/`fa-` prefixes.

```html
<i class="iconVal.toFAicon"></i>
```

### `.toEmailLink`

Converts an email address into a `mailto` `<a>` element.

```html
<span class="emailVal.toEmailLink"></span>
```

## Date Formatting

The `[field]Val` `[data-format]` functionality converts a value to a formated date.

Example:

```html
<span
    class="birthDateVal"
    data-format="I"
></span>
```

Example formats:

| Format | Result |
|---|---|
| `I` | `9/4/1986` |
| `L` | `09/04/1986` |
| `LL` | `September 4, 1986` |


## Arrays of Objects

The plugin can populate holders from arrays of objects.

### Methods

Clear the current records:

```javascript
$("#myHolder").akFillFromJSON("clear");
```

Load more records:

```javascript
$("#myHolder").akFillFromJSON("more");
```

Get the array data associated with the closest index:

```javascript
var objData = $(this).akFillFromJSON("getData");
```

Get the plugin instance:

```javascript
var myObj = $("#myHolder").akFillFromJSON("get");
```

The instance can then be used directly:

```javascript
myObj.clearItems();
myObj.fillMore();
```

Alternatively, an instance can be retrieved by holder ID:

```javascript
var myObj = getAKpluginInstance("fills", holderID);
```

## Holder Attributes

### `data-assign`

Specifies the object key used to assign the `data-id` attribute to each generated item.

```html
<ul
    id="myHolder"
    data-assign="id"
></ul>
```

### `data-placeholder`

Defines the placeholder used while content is being loaded.

The value can be:

- An existing object
- HTML
- An image path

Example:

```html
<div
    id="myHolder"
    data-placeholder="/assets/blah.jpg"
></div>
```

### `data-template`

Defines the template used to create each item.

The value can be:

- An existing object
- HTML
- An element ID such as `#myTemplate`

The container is cloned when used as a template.

```html
<div
    id="myHolder"
    data-template="#myTemplate"
></div>
```

## HTML Setup

A basic array-of-objects setup can look like this:

```html
<div class="demoModulesDiv">
    <h4>Lab Modules</h4>

    <ul class="fa-ul demoModules-holder">
        <li class="demoModules-item">
            <span class="fa-li">
                <i class="far fa-caret-right"></i>
            </span>

            <strong class="moduleTitleVal"></strong>

            <span class="moduleDescriptionDiv">
                -
                <span class="moduleDescriptionVal"></span>
            </span>
        </li>
    </ul>
</div>
```

Given an object such as:

```javascript
{
    moduleTitle: "Example Module",
    moduleDescription: "An example module description."
}
```

The plugin maps:

```text
moduleTitle       → .moduleTitleVal
moduleDescription → .moduleDescriptionVal
```

The `moduleDescriptionDiv` wrapper can additionally be shown or hidden based on whether `moduleDescription` contains a value.

## Example Initialization

```javascript
$("#myHolder").akFillFromJSON({
    data: {
        modules: [
            {
                id: 1,
                moduleTitle: "Module One",
                moduleDescription: "First module."
            },
            {
                id: 2,
                moduleTitle: "Module Two",
                moduleDescription: "Second module."
            }
        ]
    },

    primaryKey: "id",
    lazyLoading: true,
    recordCount: 10,

    callback: function(fieldName, $placedItem, dataObj, settings) {
        // Custom processing after each object is appended.
    }
});
```

## Lifecycle Hooks

### `beforeObj`

Called before processing each object in an array.

```javascript
beforeObj: function(fieldName, dataObj, settings) {
    // settings.template can be changed here.
}
```

This can be used to dynamically select a template:

```javascript
beforeObj: function(fieldName, dataObj, settings) {
    if (dataObj.featured) {
        settings.template = "#featuredTemplate";
    }
}
```

### `callback`

Called after each object has been appended.

```javascript
callback: function(fieldName, $placedItem, dataObj, settings) {
    // Custom processing for the newly inserted item.
}
```

## Lazy Loading

Enable lazy loading with:

```javascript
$("#myHolder").akFillFromJSON({
    lazyLoading: true
});
```

Use `recordCount` to control the number of records loaded at a time:

```javascript
$("#myHolder").akFillFromJSON({
    lazyLoading: true,
    recordCount: 10
});
```

When lazy loading is enabled, additional records are loaded as the user reaches the end of the currently visible records.

## Append Mode

Set `append` to `true` to retain existing records and append additional records:

```javascript
$("#myHolder").akFillFromJSON({
    append: true
});
```

## Public API Summary

### jQuery API

```javascript
$("#myHolder").akFillFromJSON("clear");
$("#myHolder").akFillFromJSON("more");
$("#myHolder").akFillFromJSON("getData");
$("#myHolder").akFillFromJSON("get");
```

### Instance API

```javascript
var myObj = $("#myHolder").akFillFromJSON("get");

myObj.clearItems();
myObj.fillMore();
```

## Quick Reference

| Pattern | Purpose |
|---|---|
| `[field]Div` | Show when a value exists |
| `not-[field]Div` | Show when a value does not exist |
| `[field]Val` | Populate element content |
| `[field]Val-link` | Populate `href` |
| `[field]Val-email` | Create `mailto:` link |
| `[field]Val-tel` | Create `tel:` link |
| `[field]Val-social` | Build social URL from `data-base` |
| `[field]Val-width` | Set CSS width |
| `[field]Val-inpV` | Set input value |
| `[field]Val-inpN` | Set input name/class |
| `[field]Val-title` | Set title |
| `[field]Val-attr` | Set `data-*` attribute |
| `[field]Val-class` | Add CSS class |
| `[field]Val.camelCase` | Convert to camel case |
| `[field]Val.pascalCase` | Convert to Pascal case |
| `[field]Val.alphaNumify` | Keep alphanumeric characters |
| `[field]Val.slugify` | Convert to slug |
| `[field]Val.toHTML` | Convert text to HTML |
| `[field]Val.toText` | Convert HTML to text |
| `[field]Val.toNumber-commas` | Format number with commas |
| `[field]Val.toNumber-money` | Format as money |
| `[field]Val.toNumber-percent` | Append `%` |
| `[field]Val.toColorBlock` | Render a color block |
| `[field]Val.toFAicon` | Render Font Awesome icon |
| `[field]Val.toEmailLink` | Render email as a link |
| `[field]Val[data-format]` | Format dates |

## Notes

- The plugin is designed around jQuery selectors and class-based field binding.
- Array-of-object rendering supports templates, callbacks, placeholders, lazy loading, and incremental loading.
- Font Awesome formatting depends on the corresponding Font Awesome classes being available in the project.
