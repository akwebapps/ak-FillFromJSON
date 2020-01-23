# akFillFromJSON
Fill DOM objects with JSON data based on classes.

## Fill HTML Template with JSON data
Once you have your HTML template created and jQuery included:
```$(element).akFillFromJSON(jsonData,notBS)```
-	`element` (obj): DOM object you want to fill
-	`jsonData` (obj): JSON object with key:value pairs to be used to fill the DOM object
-	`notBS` (boolean): (optional) "Not Bootstrap". By default elements are shown/hidden using bootstrap classes `.d-none` and `.hidden`. If this is `false` then jQuery's `.show()` and `.hide()` will be used instead.

```
$("#myContainer").akFillFromJSON({
  firstName: "Ashley",
  lastName: "Salinas",
  addresses: [{
      street: "123 Private Road",
      city: "Austin",
      state: "TX"
  },{
      street: "456 Company Drive",
      city: "Dallas",
      state: "TX"
  }]
})
```

## HTML Template Setup
### The Basics
You can assign various class names to objects to insert values from JSON. In the below documentation we will use `[key]` and `[value]` to represent the JSON key and value passed in the JSON `key:value` pair.

-   Objext with class `[key]Val` will be populated with the `value`.
    -   If the object is an `<img>` or `<iframe>` tag then the value will be assigned to the `src`.
    -   Include `data-path` to the object if you'd like to APPEND the value to a fixed path.
        ```
        <img src="#" class="myKeyVal" data-path="/assets/myImages/"\>
        ```
-   Objects with the class `[key]Div` will only be visible when the `[value]` is not blank.
-   Objects with the class `not-[key]Div` will only be visible when the `[value]` is blank.

#### EXAMPLE 
Show field values only when they have values.

HTML Template:
```
<div id="myContainer">
	<div class="firstNameDiv">First Name: <span class="firstNameVal"></span></div>
	<div class="lastNameDiv">Last Name: <span class="lastNameVal"></span></div>
	<div class="companyPhoneDiv">Company Phone: <span class="companyPhoneVal"></span></div>
	<div class="not-companyPhoneDiv">
		<div class="homePhoneDiv">Home Phone: <span class="homePhoneVal"></span></div>
	</div>
</div>
```
Initialize:
```
$("#myContainer").akFillFromJSON({
	firstName: "Ashley",
	lastName: "Salinas",
	companyPhone: "",
	homePhone: "555-1212"
})
```
Final Result:
```
<div id="myContainer">
	<div class="firstNameDiv">First Name: <span class="firstNameVal">Ashley</span></div>
	<div class="lastNameDiv">Last Name: <span class="lastNameVal">Salinas</span></div>
	<div class="companyPhoneDiv d-none hidden">Company Phone: <span class="companyPhoneVal"></span></div>
	<div class="not-companyPhoneDiv">
		<div class="homePhoneDiv">Home Phone: <span class="homePhoneVal">555-1212</span></div>
	</div>
</div>
```

### Value Conversions
Sometimes you need to convert the value before displaying it. Add the additional classes below to convert the value before displaying.

-   `.camelCase`: convert a string a camel case variable
-   `.pascalCase`: convert a string a pascal case variable
-   `.alphaNumify`: convert a string to alphanumeric characters only
-   `.slugify`: convert a string to a slug
-   `.toHTML`: convert a string to html (replaces line breaks with `<br>`)
-   `.toText`: converts HTML to text only

#### EXAMPLE
Convert a description with line breaks into HTML with `<br>` tags.

HTML Template:
```
<div id="articleHeader">
	<h3 class="articleNameVal"></h3>
	<div class="articleDescVal toHTML"></div>
</div>
```
Initialize:
```
$("#articleHeader").akFillFromJSON({
	articleID: 12345,
	articleName: "Once Upon a Time",
	articleDesc: "Once upon a time there was a bored programmer.\nShe stayed up too late writing documentation."
})
```
Final Result:
```
<div id="articleHeader">
	<h3 class="articleNameVal">Once Upon a Time</h3>
	<div class="articleDescVal toHTML">Once upon a time there was a bored programmer.<br>She stayed up too late writing documentation.</div>
</div>
```


### Additional Shortcuts
Sometimes values represent things other than text. Here are some other shortcuts to populate your HTML.

-   `.[key]Val-link`: assigns value to href attribute
    -   Include `data-path` to the object if you'd like to APPEND the value to a fixed path. If our JSON was `{catalogID:42}` we coud link to it like this:
        ```
        <a href="#" class="catalogIDVal-link" data-path="/myCatalog/index.asp?catalogID=">
            Catalog #<span class="catalogIDVal"></span>
        </a>
        ```
-   `.[key]Val-class`: assigns value to class attribute
-   `.[key]Val-email`: assigns `mailto:[value]` to href attribute
-   `.[key]Val-social` + `data-base`: assigns `[data-base][value]` to the href attribute.
    ```
    <a href="#" class="twitterIDVal-social" data-base="https://twitter.com/">View Twitter Profile</a>
    ```
-   `.[key]Val-tel`: assigns `tel:[value]` to href attribute
-   `.[key]Val-width`: assigns value width attribute as a percentage.
-   `.[key]Val-inpV`: assigns value to value attribute
-   `.[key]Val-inpN`: assigns value to name attribute
-   `.[key]Val-attr`: adds `data-[key]="[value]"` attribute

### Advanced: Array of Objects
You can also make a block of HTML repeat for every item in an array of json objects.

-   `.[key]Div`: top-level HTML parent block. By default, contents will be replaced with repeating HTML block.
-   `.[key]-holder`: assign to HTML block inside of `.[key]Div` if you want to specify a sub-element as the container for the repeating HTML.
-   `.[key]-item`: assign to HTML block inside of the holder container (`.[key]Div` by default) that will be repeated for each item in the array.
-   Add the `data-assign` attribute to the `.[key]Div` element to assign the `[value]` of the `[key]` to the `data-id` attribute on each item.

#### EXAMPLE
Show a section of demos with various properties.

HTML Template:
```
<div class="demoModulesDiv">
	<h4>Lab Modules</h4>
	<ul class="fa-ul demoModules-holder">
		<li class="demoModules-item"><span class="fa-li"><i class="far fa-caret-right"></i></span> 
			<strong class="moduleTitleVal"></strong>
			<span class="moduleDescriptionDiv"> - 
				<span class="moduleDescriptionVal"></span>
			</span>
		</li>
	</ul>
</div>
```
Initialize:
```
$("body").akFillFromJSON({
	"demoModules": [{
		"moduleTitle": "OpenManage Enterprise v3.2 Getting Started",
		"moduleDescription": "Focuses on the basic features available in OpenManage Enterprise v3.2 to provide you with a good understanding of its capabilities."
	},{
		"moduleTitle": "OpenManage Enterprise Home Portal",
		"moduleDescription": "a high-level overview of the OpenManage Enterprise Home Portal."
	}]
})
```
Final Result:
```
<div class="demoModulesDiv">
	<h4>Lab Modules</h4>
	<ul class="fa-ul demoModules-holder">
		<li class="demoModules-item"><span class="fa-li"><i class="far fa-caret-right"></i></span> 
			<strong class="moduleTitleVal">OpenManage Enterprise v3.2 Getting Started</strong>
			<span class="moduleDescriptionDiv"> - 
				<span class="moduleDescriptionVal">Focuses on the basic features available in OpenManage Enterprise v3.2 to provide you with a good understanding of its capabilities.</span>
			</span>
		</li>
		<li class="demoModules-item"><span class="fa-li"><i class="far fa-caret-right"></i></span> 
			<strong class="moduleTitleVal">OpenManage Enterprise Home Portal</strong>
			<span class="moduleDescriptionDiv"> - 
				<span class="moduleDescriptionVal">a high-level overview of the OpenManage Enterprise Home Portal.</span>
			</span>
		</li>
	</ul>
</div>
```
