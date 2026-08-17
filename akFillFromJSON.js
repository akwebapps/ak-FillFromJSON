/*! akFillFromJSON v2 2026-08-11 | https://github.com/akwebapps/ak-FillFromJSON | (c) 2026 AK Web Apps | @license Licensed MIT */
/* USAGE------------------------------------------------------------------------------
$(function() {
	// create a new instance of the plugin
	var myFill = new $.akFillFromJSON($('#element'), options, arg);
	// call a public method
	myFill.foo_public_method();
	
	//or 
	$('#myHolder').akFillFromJSON(options, arg);
});
	
INIT WITH OPTIONS-------------------------------------------------------------------
$("#myHolder").akFillFromJSON({
	readOnly: false, //whether or not to use setElemVal on form elements
	joinBy: ", ", //if a value is an array of strings, how do you want to join them
	replaceArr: [], //replace text within a string value. ["replaceThis","withThis"] or an array of multiple
	lazyLoading: false, //will load elements up to the height of the screen. Loads more on scroll.
	recordCount: null, //will load [x] records at a time. If lazyLoading=true more will load when last one becomes visible.
	append: false, //append more records instead of clearing
	data: {},
	primaryKey: "",
	fromFieldEvent: false, //this prevent the toggleFieldRow from triggering
	template: null, //force a template for each object item in the array
	beforeObj: function(fieldName,dataObj,settings){}, //for arrays of objects this will be run before the object loop. force a template by updating settings.template
	callback: function(fieldName,$placedItem,dataObj,settings){}, //for arrays of objects this will be run after each object is appended
	showLog: false //non akForm elements; true/false or array of what to log ["display","fields"]
})
CLASSES-------------------------------------------------------------------------------
	
	[field]Div to toggle an element
	.[field]Div shows an element if a value is present and hides the element if there is no value.
	.not-[field]Div shows an element if there is no value and hides the element if a value is present.

	[field]Val to populate an element
	<img>, <iframe>, <embed>, <video> [field]Val populates src
		- assign [data-path] to assign [data-path]+[value]
		- assign [data-append] to assign [data-path]+[value]+[data-append]
	<object> [field]Val populates data
		- assign [data-path] to assign [data-path]+[value]
		- assign [data-append] to assign [data-path]+[value]+[data-append]
	<a> [field]Val-link populates href
		- assign [data-path] to assign [data-path]+[value]
		- assign [data-append] to assign [data-path]+[value]+[data-append]
	<a> [field]Val-email populates href with emailto:[value]
	<a> [field]Val-tel populates href with tel:[value]
	<a> [field]Val-social with data-base="https://blahblah.com/" populates href with [data-base]+[value]
	
	[field]Val-width assigns style width to [value] and removes "hidden d-none" classes if [value] is numeric (otherwise it assigns "hidden d-none" classes)
	[field]Val-inpV populates value
	[field]Val-inpN populates name and assigns [value] as a class
	[field]Val-title populates the title property
	[field]Val-attr populates "data-"+slugify([field])
	[field]Val-class adds [value] as a class
	
	.[field]Val.camelCase: convert a string a camel case variable
	.[field]Val.pascalCase: convert a string a pascal case variable
	.[field]Val.alphaNumify: convert a string to alphanumeric characters only
	.[field]Val.slugify: convert a string to a slug
	.[field]Val.toHTML: convert a string to html (replaces line breaks with <br>)
	.[field]Val.toText: converts HTML to text only
	.[field]Val.toNumber-commas: converts to 5,123,456.345
	.[field]Val.toNumber-money: converts to $00.00
	.[field]Val.toNumber-percent: appends "%" 
	.[field]Val.toColorBlock: sets html to a block of color
	.[field]Val.toFAicon: sets html to <i class='[value]'></i> and adds necessary fa and fa- to value
	.[field]Val.toEmailLink: turns email string into a mailto <a></a> tag
	.[field]Val[data-format]: converts value to proper formats 
		ex: class="[field]Val" date-format="I" gives 9/4/1986
		L - 09/04/1986
		LL - September 4, 1986

Array of Objects----------------------------------------------------------------------
METHODS...............................................................................
	$("#myHolder").akFillFromJSON("clear");
	$("#myHolder").akFillFromJSON("more");
	var objData = $(this).akFillFromJSON("getData"); //will get the array's data for the closest index.
	
	OR
	
	var myObj=getAKpluginInstance("fills",holderID);
	OR
	var myObj=$("#myHolder").akFillFromJSON("get");
	THEN
	myObj.clearItems();
	myObj.fillMore();
HOLDER TAG: ............................................................................
	data-assign //the name of the key to use when assigning the data-id="" attribute to each item
	data-placeholder //can be existing object, html, or an image path "/assets/blah.jpg";
	data-template //can be an existing object, html, or an #ID; container will be cloned;
HTML SETUP .............................................................................
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

//For additional form functionality include toggleFieldRow()
*/
if(typeof akPluginArr=="undefined") akPluginArr={};
(function ( $ ) {
	$.fn.akFillFromJSON = function(data,params) {
		this.each(function() {
			new $.akFillFromJSON(this,data,params);
		});
		return;
	};
	$.akFillFromJSON = function( holder, options, arg ){
        var defaults = {
			readOnly: false,
			joinBy: ", ",
			replaceArr: [],
			lazyLoading: false, //load on scroll
			recordCount: null, //how many records to load at a time
			loadMoreLabel: "Load More",
			append: false, //can be a function
			data: {},
			primaryKey: "",
			fromFieldEvent: false, //this prevent the toggleFieldRow from triggering,
			template: null,
			beforeObj: function(fieldName,$parentItem,dataObj,settings){},
			beforeFill: function(fieldName,$itemToFill,dataObj,currentIndex,settings){},
			callback: function(fieldName,$placedItem,dataObj,settings){}, //for arrays of objects this will be run after each object is appended
			showLog: false //only used for non-akForm objects
		}, 
		plugin = this;
		plugin.holder = null;
		plugin.settings = {};
		
		//==================================================================================================
		//INITIALIZE ---------------------------------------------------------------------------------------
		var init = function() {
			//Log(["init",options]);
			plugin.settings = $.extend(true, {}, defaults, (Array.isArray(options) ? {data:options} : options));
			
			//Start initialization---------------------------------------------------------------------------
			var settings=plugin.settings, fillData=convertToJson(settings.data);
			
			//data is an array of strings: handle custom elements if they exist or convert to string
			var primaryKey=settings.primaryKey, 
				//arrayOfStrings=(Array.isArray(fillData) && fillData.length && typeof fillData[0]!="object"),
				//containsObject=(typeof fillData=="object" && !Array.isArray(fillData)) || (Array.isArray(fillData) && fillData.length && typeof fillData[0]=="object"),
				hasVal=(fillData && (typeof fillData!="string" || fillData!="") && (!Array.isArray(fillData) || fillData.length)),
				embedded = false; 
			if(primaryKey!="") fillData = fillCustomObjects(primaryKey,fillData);
							
			//data is an array but primaryKey was not provided: get primaryKey from "holder" element
			if(primaryKey=="" && fillData && Array.isArray(fillData)) {
				var primaryKey=$(holder).attr("data-field"), holderClass=$(holder).attr("class");
				if(!primaryKey && holderClass){
					$(holderClass.split(" ")).each(function(i,cl){
						if(cl.indexOf("Div")>0) {
							primaryKey=cl.replace("Div","");
							return;
						}
					})
				}
				if(!primaryKey) fillData=fillData[0];
			}
			settings.data = fillData;
			settings.primaryKey = primaryKey;
			//value is a json object with key/values - loop through each key and akFill on individual object
			if(typeof fillData=="object" && !Array.isArray(fillData)) {
				embedded=true;
				$.each(fillData,function(f,v){
					var thisField=f.replaceAll(" ","-");
					$(holder).akFillFromJSON($.extend({},settings,{primaryKey:thisField,data:v}));
				});
			//value is an array of objects - create the plugin for looping and adding DOM objects
			} else if(Array.isArray(fillData) && fillData.length && typeof fillData[0]=="object" && !Array.isArray(fillData[0])){
				startPlugin();
			//individual elem/value - value is a string,boolean,number
			} else if(primaryKey!=""){
				fillStrings(primaryKey,fillData);
			}
			if(!embedded && primaryKey!=""){
				if(!settings.fromFieldEvent && (!$("."+primaryKey,holder).parents(".akForm").length || !$("."+primaryKey,holder).filter("input, select, textarea").length)){
					if(typeof toggleFieldRow=="function") toggleFieldRow(primaryKey,(hasVal?fillData:""),holder);
				}if(hasVal) {
					$(".not-"+primaryKey+"Div",holder).akHide();
					$("."+primaryKey+"Div",holder).akShow();
				}else{
					$(".not-"+primaryKey+"Div",holder).akShow();
					$("."+primaryKey+"Div",holder).akHide();
				}
			}
		} 
	
		//==================================================================================================
		//PRIVATE FUNCTIONS -----------------------------------------------------------------------------------
		//fillCustomObjects(fieldName,valueArr) returns remaining fieldValue. valueArr will be array.
		//fillStrings(fieldName,stringValue) //replaces all fieldName+"Val" elements where stringValue is a string
		//fillArrays(fieldName,arrayValue) //replaces all fieldName+"Val" elements where arrayValue is an array of objects
		var startPlugin = function(){
			//Log(["start",plugin.settings.data]);
			plugin.fillObject=$.extend(true, { 
				id: "",
				idField: "",
				//array of objects "Div" only
				template: null, //can be an existing object, html, or an #ID; container will be cloned;
				templateObj: null, //dom element to be cloned
				placeholder: null, //can be existing object, html, or an image path "/assets/blah.jpg";
				placeholderObj: null, //dom element to be cloned as a placeholder
				container: null, //the specific fieldName+"Div" object to be populated with array of object data
				currentIndex: 0,
				working: false
			}, (plugin.fillObject || {}))
			var settings=plugin.settings,
				 fillData=settings.data,
				fieldName=settings.primaryKey,
				isAppend=(typeof settings.append=="function" ? settings.append() : settings.append);
			settings.template=null;
			settings.beforeObj(fieldName,$(holder),fillData,settings);
			var $parentDiv=($(holder).hasClass(fieldName+"Div") ? $(holder) : $("."+fieldName+"Div",holder)).filter(function(){
				return !$(this).parents("."+fieldName+"Div:not(.akFillHolder)").length;
			});
			//fill each [fieldName]Div with a different process
			if($parentDiv.length>1){
				embedded=true;
				$parentDiv.each(function(divI,divObj){
					$parentDiv.addClass("akFillHolder").attr("data-field",fieldName);
					$(divObj).akFillFromJSON($.extend({},settings,{fieldName:fieldName,data:fillData}));
				})
			} else if($parentDiv.length==1){
				var pluginObj=plugin.fillObject, pt;
				pluginObj.id=$parentDiv.attr("id") || randomStr(6);
				plugin.holder = $parentDiv;
				$parentDiv.attr("id",pluginObj.id).addClass("akFillHolder").attr("data-field",fieldName);
				if(!pluginObj.templateObj){
					pt=pluginObj.template;
					if(!pt) pt=$parentDiv.data("template") || null;
					if(pt && typeof pt=="string" && pt.indexOf("<")==0) pluginObj.templateObj=$(pt); //template is HTML
					else if(pt && typeof pt=="string" && $(pt).length) pluginObj.templateObj=$(pt).clone(); //template is selection string "#myTemplateObj"
					else if(pt) pluginObj.templateObj=pt; //template is jQuery object $("#myTemplateObj")
					else if($("."+fieldName+"-item",$parentDiv).length) pluginObj.templateObj=$("."+fieldName+"-item",$parentDiv).first().clone(); //template is not passed grab from first .[fieldName]-item
				}
				if(!pluginObj.placeholder && settings.lazyLoading){
					var ph=pluginObj.placeholder;
					if(!ph) ph=$parentDiv.data("placeholder") || null;
					if(ph && typeof ph=="string" && ph.indexOf("<")==0) pluginObj.placeholderObj=$(ph);
					else if(ph && typeof ph=="string" && $(ph).length) pluginObj.placeholderObj=$(ph).clone();
					else if(ph && typeof ph=="string" && ph.indexOf(".")>0) pluginObj.placeholderObj=$("<img src='"+ ph +"'>");
					//else if(pluginObj.templateObj) pluginObj.placeholderObj=pluginObj.templateObj;
				}
				if(!pluginObj.container) pluginObj.container=$("."+fieldName+"-holder",$parentDiv).length ? $("."+fieldName+"-holder",$parentDiv) : $parentDiv;
				
				if(!$("."+ fieldName +"-placeholder",pluginObj.container).length) {
					const $ph=$("<div class='"+ fieldName +"-placeholder d-none' style='display:none'></div>")
					if($("."+ fieldName +"-item",pluginObj.container).length) $("."+ fieldName +"-item",pluginObj.container).first().after($ph);
					else pluginObj.container.append($ph);
				}
				if(!pluginObj.idField) pluginObj.idField=$parentDiv.data("assign") || pluginObj.container.data("assign") || "";
				//if(!settings.recordCount && fillData) settings.recordCount=fillData.length;
				
				if(pluginObj.templateObj){
					if(!isAppend || !$parentDiv.hasClass("akinit")) plugin.clearItems();
					fillArrays();
					$parentDiv.addClass("akinit");
					if(!akPluginArr.fills) akPluginArr.fills={};
					akPluginArr.fills[pluginObj.id]=plugin;
				}
			}
		},
		
		fillCustomObjects = function(fieldName,fieldValue){
			//Log([fieldName,fieldValue])
			var settings=plugin.settings, returnVals=fieldValue;
			//if this is an array of files/images--------------------------------------------------
			var $fileHolders=$("."+fieldName+"Val.toFileLink");
			if($fileHolders.length){
				if(!Array.isArray(fieldValue)) fieldValue=[fieldValue];
				var $fileObj=$("<div></div>");
				for(var fv=0;fv<fieldValue.length;fv++){
					var fileName=fieldValue[fv];
					//what parameters are passed with fieldValue is an object {obj.filename?}
					if(typeof fileName=="object" && fileName.filename) fileName==fileName.filename;
					if(typeof fileName=="string"){
						var fileExt=fileName.substring(fileName.lastIndexOf('.')+1, fileName.length),
							justFile=(fileName.indexOf("/")>=0 ? fileName.substring(fileName.lastIndexOf('/')+1, fileName.length) : fileName);
						fileExt=(typeof fileExt=="string" ? fileExt.toLowerCase() : fileName) || fileName;
						$fileObj.append("<div><a href='"+fileName+"' target='_blank'><"+justFile+"</a></div>");
					}
				}
				if($("a",$fileObj).length) $fileHolders.append($fileObj);
				returnVals=""; //do not fill anything other than "toFileLink" elements
			}
			
			//if this is a form element-----------------------------------------------------------
			//used for non-akForm forms to set input values
			var formElem=$("."+fieldName+":not(.static)",holder).filter(function(){
					return !$(this).parents(".stopProp").length
				});
			//if there's an element with class='[fieldName]'
			if(formElem.length){
				if(typeof fieldName!="string") fieldName=formElem.attr("data-field") || formElem.attr("name") || ""; //added formElem.attr("name") 5/18/22; why would fieldName not be a string? 8/29/22
				if(settings.showLog==true || (Array.isArray(settings.showLog) && settings.showLog.indexOf("fields")>=0)) Log(["set field value", fieldName, fieldValue, formElem])
				if(!settings.readOnly) formElem.val(fieldValue).trigger("change");
			}
				
			return returnVals;
		},
		
		//Fill Strings --------------------------------------------
		fillStrings = function(fieldName,fieldValue,parentObj){
			var settings=plugin.settings, justStrings=fieldValue || "", replaceArr=settings.replaceArr;
			if(replaceArr && replaceArr.length){
				if(typeof replaceArr[0]=="string") justStrings=[justStrings];
				$(replaceArr).each(function(i,obj){
					justStrings=justStrings.replaceAll(obj[0],obj[1])
				})
			}
			if(settings.showLog==true || (Array.isArray(settings.showLog) && settings.showLog.indexOf("display")>=0)) Log(["set display element", fieldName, justStrings, holder])
			//special tags (links, images, input, etc)
			$("."+fieldName+"Val:not([data-path]), [data-param='"+fieldName+"']:not([data-path])",holder).filter(":not(img):not(iframe):not(object):not(embed):not(video)").html(justStrings);
			$("img, iframe, embed, video",holder).filter(function(){
				return ($(this).not("[data-path]") || justStrings.toString().indexOf("//")>=0 || justStrings.toString().indexOf("/")==0) && ($(this).hasClass(fieldName+"Val") || $(this).is("[data-param='"+fieldName+"']"));
			}).attr("src",justStrings);
			$("object."+fieldName+"Val, object[data-param='"+fieldName+"']",holder).filter(function(){
				return $(this).not("[data-path]") || justStrings.toString().indexOf("//")>=0 || justStrings.toString().indexOf("/")==0;
			}).attr("data",justStrings);
			$("a."+fieldName+"Val-link, a[data-param='"+fieldName+"']",holder).attr("href",justStrings);
			$("a."+fieldName+"Val-email",holder).attr("href","mailto:"+ justStrings);
			$("a."+fieldName+"Val-social[data-base]",holder).each(function(){
				var b=$(this).attr("data-base");
				$(this).attr("href",b + ((b.slice(-1)!="/" && fieldValue.substr(0,1)!="/")?"/":"") +fieldValue);
			})
			$("a."+fieldName+"Val-tel",holder).attr("href","tel:"+ justStrings).text(justStrings);
			$("."+fieldName+"Val-inpV",holder).attr("value",justStrings);
			$("."+fieldName+"Val-title",holder).attr("title",justStrings);
			$("."+fieldName+"Val-inpN",holder).attr("name",justStrings).addClass(justStrings);
			$("."+fieldName+"Val-class",holder).each(function(){
				if(!$(this).attr("data-orig-class")) $(this).attr("data-orig-class",$(this).attr("class"));
				var newClass=$(this).data("orig-class") + (justStrings!="" ? " "+justStrings : "");
				$(this).attr("class",newClass);
			})
			//$("."+fieldName+"Val-class",holder).addClass(justStrings);
			var fieldSlug=slugify(fieldName,true,true);
			$("."+fieldName+"Val-attr",holder).attr("data-"+ fieldSlug,justStrings);
			$("."+fieldName+"Val-data[data-"+fieldSlug+"]",holder).each(function(){
				var dataAttr=$(this).attr("data-"+ fieldSlug);
				$(this).attr("data-"+dataAttr,justStrings);
			});
			if(justStrings.toString()=="" && $("."+fieldName+"Val[data-placeholder!=''], [data-param='"+fieldName+"'][data-placeholder!='']",holder).length){
				$("."+fieldName+"Val[data-placeholder], [data-param='"+fieldName+"'][data-placeholder]",holder).each(function(){
					$(this).html($(this).attr("data-placeholder"));
				})
			}
			if(justStrings.toString().indexOf("//")<0 && justStrings.toString().indexOf("/")!=0){
				$("[data-path], [data-default], [data-append]",holder).filter(function(){
					return (
						$(this).is("img") || $(this).is("iframe") || $(this).is("embed") || $(this).is("video") || $(this).is("object") || $(this).hasClass(fieldName+"Val-link")
					) && (
						$(this).hasClass(fieldName+"Val") || $(this).hasClass(fieldName+"Val-link") || $(this).is("[data-param='"+fieldName+"']")
					);
				}).each(function(){
					var path=justStrings ? ($(this).attr("data-path") || "") : ($(this).attr("data-default") || ""), 
						app=justStrings ? ($(this).attr("data-append") || "") : "", 
						useAtt=$(this).is("object") ? "data" : ($(this).hasClass(fieldName+"Val-link") ? "href" : "src"),
						middle=(path && path.length && justStrings && justStrings.length && path.slice(-1)!="/" && path.slice(-1)!="#" && justStrings.substr(0,1)!="/") ? "/" : "";
					$(this).attr(useAtt,path + middle + justStrings + app);
				})
			}
			//change value for display
			if(fieldValue){
				if($("."+fieldName+"Val.camelCase",holder).length) $("."+fieldName+"Val.camelCase",holder).html(camelCase(fieldValue));
				if($("."+fieldName+"Val.pascalCase",holder).length) $("."+fieldName+"Val.pascalCase",holder).html(pascalCase(fieldValue));
				if($("."+fieldName+"Val.alphaNumify",holder).length) $("."+fieldName+"Val.alphaNumify",holder).html(alphaNumify(fieldValue));
				if($("."+fieldName+"Val.slugify",holder).length) $("."+fieldName+"Val.slugify",holder).html(slugify(fieldValue));
				if($("."+fieldName+"Val.toHTML",holder).length) $("."+fieldName+"Val.toHTML",holder).html(fieldValue.replaceAll("\n","<br>"));
				if($("."+fieldName+"Val.toText",holder).length) $("."+fieldName+"Val.toText",holder).text($("<div>"+fieldValue+"</div>").text());
				//from AKForms toNumber-money, toNumber-percent, toColorBlock, toEmailLink, toFAicon
				$("."+fieldName+"Val.toNumber-commas",holder).html(fieldValue.toLocaleString());
				$("."+fieldName+"Val.toNumber-money",holder).html(roundToPennies(fieldValue));
				$("."+fieldName+"Val.toNumber-percent",holder).html(fieldValue+"%");
				$("."+fieldName+"Val.toColorBlock",holder).html("<div style='background-color:"+ fieldValue +"' class='sq-sm'>&nbsp;</div>");
				if($("."+fieldName+"Val.toFAicon",holder).length){
					var iconPre="";
					if(fieldValue.indexOf(" ")<=0 || fieldValue.indexOf("fa")!=0) iconPre="fa ";
					if(fieldValue.indexOf("fa-")!=0 && fieldValue.indexOf(" fa-")<0) iconPre+="fa-";
					$("."+fieldName+"Val.toFAicon",holder).html("<i class='"+ iconPre + fieldValue +" fa-lg'></i>");
				}
				$("."+fieldName+"Val.toEmailLink",holder).html("<a href='mailto:"+ fieldValue +"'>"+ fieldValue +"</a>");
				if ($("." + fieldName + "Val[data-format]:not([data-format=''])", holder).length) {
					$("." + fieldName + "Val[data-format]:not([data-format=''])", holder).each(function() {
						var thisFormat = $(this).attr("data-format");
						var thisDate = formatDate(fieldValue).format(thisFormat);
						$(this).text(thisDate);
					});
				}
			}
			if($("img."+fieldName+"Val.fillBox").length) $("img."+fieldName+"Val.fillBox").fillBox();
			if($("."+fieldName+"Val-title[data-toggle='tooltip']").length) $("."+fieldName+"Val-title[data-toggle='tooltip']").tooltip();
			if($("."+fieldName+"Val-title[data-bs-toggle='tooltip']").length) $("."+fieldName+"Val-title[data-bs-toggle='tooltip']").tooltip();
			if($("."+fieldName+"Val-title[data-toggle='popover']").length) $("."+fieldName+"Val-title[data-toggle='popover']").popover({animation:false});
			if($("."+fieldName+"Val-title[data-bs-toggle='popover']").length) $("."+fieldName+"Val-title[data-bs-toggle='popover']").popover({animation:false});
			if($("."+fieldName+"Val.toFAicon",holder).length || $("."+fieldName+"Val-class",holder).length){
			}
		},
		
		
		//Fill Arrays --------------------------------------------
		fillArrays = function(isMore){
			//get settings
			var settings=plugin.settings, pluginObj=plugin.fillObject,
				$parent=plugin.holder, 
				$hold=pluginObj.container,
				fieldName=settings.primaryKey,
				fieldValue=settings.data,
				idField=pluginObj.idField,
				h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0), 
				d = $(document).scrollTop(),
				aboveFold=true,
				startIndex=pluginObj.currentIndex,
				onCount=1,
				addBeforeObj=$("."+ fieldName +"-placeholder",$hold).length ? $("."+ fieldName +"-placeholder",$hold) : null;
			$(".akFillMoreBtnHolder",$hold).remove();
			if(isMore){
				var nextI=startIndex+1,
					$next=$(".akFillItem.fillMe[data-index='"+nextI+"'][data-fill-field='"+fieldName+"']",$hold).length
						? $(".akFillItem.fillMe[data-index='"+nextI+"'][data-fill-field='"+fieldName+"']",$hold) 
						: $(".akFillItem.fillMe",$hold).first(),
					$last=$next.length ? $next.prev(".akFillItem") : null;
				//---------DEBUG: should this only be for lazy or limited count? prevent button from appearing
				if(settings.lazyLoading || settings.recordCount) aboveFold = $last.length && settings.lazyLoading ? $last.position().top <= (h+d) : (settings.recordCount && onCount<=settings.recordCount);
				if(aboveFold) startIndex=nextI;
			}
			//loop through each array item
			if(aboveFold){
				pluginObj.working=true;
				for(var i=startIndex;i<fieldValue.length;i++){//&& i<15
					var useTemplate=pluginObj.templateObj;
						if(settings.template) useTemplate=$(settings.template);
					var $item=useTemplate.clone().attr("data-index",i).attr("data-fill-field",fieldName).addClass("akFillItem");
					if(aboveFold){
						pluginObj.currentIndex=i;
						var valObj=fieldValue[i];
						settings.beforeFill(fieldName,$item,valObj,i,settings);
						if(idField) $item.data("id",valObj[idField]).attr("data-id",valObj[idField]);
						//add data to data attribute for "get" purposes
						$item.data("fill",valObj);
						//fill container
						$item.akFillFromJSON($.extend({},settings,{fieldName:fieldName,data:valObj}));
						//load BS things
						//loadBS($item);
						//append to DOM
						if(isMore) {
							var $next=$(".akFillItem.fillMe[data-index='"+i+"'][data-fill-field='"+fieldName+"']",$hold).length
								? $(".akFillItem.fillMe[data-index='"+i+"'][data-fill-field='"+fieldName+"']",$hold) 
								: $(".akFillItem.fillMe",$hold).first();
							if($next.length) {
								//Log([i,$next.position().top,h+d]);
								$next.before($item);
								$next.remove();
							} else if(addBeforeObj) addBeforeObj.before($item);
							else $hold.append($item);
						}  else if(addBeforeObj) addBeforeObj.before($item);
						else $hold.append($item);
						var $placedItem=$(".akFillItem[data-index='"+i+"'][data-fill-field='"+fieldName+"']",$hold);
						settings.callback(fieldName,$placedItem,valObj,settings);
						//see if next one is not visible or we've reached the max record count
						//aboveFold=(!settings.recordCount || (onCount<=settings.recordCount && (!settings.lazyLoading || $placedItem.position().top <= (h+d))));	
						//---------DEBUG: should this only be for lazy or limited count? prevent button from appearing
						if(settings.recordCount || settings.lazyLoading) aboveFold=settings.recordCount ? onCount<=settings.recordCount : $placedItem.position().top <= (h+d);	
						//Log([i,aboveFold,$placedItem.position().top <= (h+d)])
					} else if (!isMore){
						if(pluginObj.placeholderObj) $item.append(pluginObj.placeholderObj);
						else $item.addClass("fillMe hidden d-none");
						if(addBeforeObj) addBeforeObj.before($item);
						else $hold.append($item);
					}
					onCount++;
				}
				if($(".akFillItem.fillMe",$hold).length && fieldValue.length>pluginObj.currentIndex+1) {
					$parent.addClass("fillMore").addClass(settings.lazyLoading?"fillLazy":"fillClick");
					if(!settings.lazyLoading && !$(".akFillMoreBtn",$hold).length) {
						$moreBtn=$("<button class='akFillMoreBtn btn btn-outline-primary' type='button'>"+ (settings.loadMoreLabel || "Load More") +"</button>").on("click",function(e){
							e.preventDefault();
							$(this).closest(".akFillHolder.fillMore").akFillFromJSON("more");
							$(this).closest(".akFillMoreBtnHolder").remove();
						});
						$hold.append($("<div class='akFillMoreBtnHolder clearfix w-100 text-center'></div>").append($moreBtn));
					}
				} else $parent.removeClass("fillMore fillLazy fillClick");
				//load compontents for new items
				pluginObj.working=false;
			} 
		}, 
		convertToJson = function(str){
			var r=str;//.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]\'~]*/g, '');
			if(typeof r=="string"){
				try {
					var o = JSON.parse(r);
					if (o && typeof o == "object") r=o;
				}
				catch (e) {}
			}
			return r;
		},
		formatDate = function(value, format) {
			const date = new Date(value);

			if (Number.isNaN(date.getTime())) {
				return value;
			}

			switch (format) {
				case "I":
					return new Intl.DateTimeFormat("en-US").format(date);

				case "L":
					return new Intl.DateTimeFormat("en-US", {
						month: "2-digit",
						day: "2-digit",
						year: "numeric"
					}).format(date);

				case "LL":
					return new Intl.DateTimeFormat("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric"
					}).format(date);

				default:
					return new Intl.DateTimeFormat("en-US").format(date);
			}
		},
		Log = function (msgOrObj,ow) {
			if (typeof showLog=="undefined" || showLog|| ow==true){
				if(msgOrObj && typeof msgOrObj=="object" && !Array.isArray(msgOrObj) && msgOrObj.label && msgOrObj.label!="") {
					var useStyle = msgOrObj.style || "", useLabel=msgOrObj.label;
					var totalLength=10, padLength = (totalLength - useLabel.length) /2;
					useLabel = useLabel.padStart(useLabel.length + padLength).padEnd(totalLength);
					if(useStyle!="" && useStyle.indexOf(":")<0) {
						var isOutline=useStyle.indexOf("-outline")>0,
							useStyle=isOutline ? useStyle.replace("-outline","") : useStyle;
						var useColor=useStyle.indexOf("#")==0 ? useStyle : null;
						if(!useColor) useColor={
							"danger":"#cd476a",
							"warning":"#f6d16d",
							"success":"#80c163",
							"primary":"#3aa8dd",
							"secondary":"#6c757d",
							"tertiary":"#80c163",
							"default":"#8f979e"
						}[useStyle];
						if(!useColor) useColor="#8f979e";
						useStyle="padding:2px 4px;border-radius:3px;" + (isOutline ? "border:solid 1px "+ useColor +";color:"+ useColor +";" : "background-color:"+ useColor +";color:white;")
					}
					//if(msgOrObj.action) console.log("%c"+useLabel, useStyle, [msgOrObj.action, msgOrObj.log || ""]);
					//else 
					console.log("%c"+useLabel, useStyle, msgOrObj.log || "");
				} else console.log(msgOrObj);
			}
		};
		
		//==================================================================================================
		//PUBLIC METHODS -----------------------------------------------------------------------------------
		//getInstance() = plugin.getInstance() [ myplugin.getInstance() ]
		//clearItems()
		//fillMore()
		plugin.getInstance = function(){
			var objname=$(holder).hasClass("akFillHolder") ? ($(holder).attr("id") || "") 
				: (options && options.fieldName && $(".akFillHolder[data-field='"+ options.fieldName +"']",holder).length ? 
					$(".akFillHolder[data-field='"+ options.fieldName +"']",holder)[0].id : "");
			//objname=$(holder).hasClass("akFillHolder") ? ($(holder).attr("id") || "") : "";
			//Log([])
			return objname && akPluginArr.fills ? akPluginArr.fills[objname] : null;
		}
		plugin.refresh = function(options){
			if($(plugin.holder).hasClass("akinit")) plugin.clearItems();
			$(plugin.holder).akFillFromJSON(options);
		}
		plugin.clearItems = function(){
			var pluginObj=plugin.fillObject;
			if(pluginObj && pluginObj.id){
				var settings=plugin.settings, 
					fieldName=settings.primaryKey,
					$parent=plugin.holder, 
					$hold=pluginObj.container;
				pluginObj.currentIndex=0;
				$("."+ fieldName +"-item",$hold).remove();
				$parent.removeClass("akinit");
			}
		}
		plugin.fillMore = function(){
			var pluginObj=plugin.fillObject;
			if(pluginObj && pluginObj.id && !pluginObj.working) fillArrays(true);
		}
		
		//=====================================================================================================
		//SHORTCUTS METHODS -----------------------------------------------------------------------------------
		if (options && typeof(options) == 'string') {
			var thisplugin=plugin.getInstance();
			if (thisplugin && options == "clear") thisplugin.clearItems();
			else if (thisplugin && options == "more") thisplugin.fillMore();
			else if (thisplugin && options == "get") return thisplugin;
			return;
        
		
		//==================================================================================================
		//INITIALIZE -----------------------------------------------------------------------------------
		} else {
			//Initialize Plugin
	        if(!plugin.holder) init();
			//Reset Plugin
			else {
				var thisplugin=plugin.getInstance();
				if(!thisplugin) init();
				else{
					//Log([options.fieldName,options,thisplugin])
					thisplugin.refresh(options);
				}
			}
		}
    }
	
	$(window).on("resize scroll", function () {
		if($(".akFillHolder.fillMore.fillLazy .akFillItem.fillMe").length){
			$(".akFillHolder.fillMore.fillLazy").each(function(){
				$(this).akFillFromJSON("more");
			})
		} 
	});


})(jQuery);