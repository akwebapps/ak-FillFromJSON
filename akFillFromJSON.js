/*! akFillFromJSON v1.0.2 2026-05-04 | https://github.com/akwebapps/ak-FillFromJSON | (c) 2026 AK Web Apps | @license Licensed MIT */
(function ( $ ) {
	$.fn.akFillFromJSON = function(data,params) {
		this.each(function() {
			new $.akFillFromJSON(this,data,params);
		});
		return;
	};
	$.akFillFromJSON = function( elem, useData, params ){
		var data=useData;
		if(params && params.primaryKey) {
			data={};
			data[params.primaryKey] = useData;
		}
		$.each(data,function(fieldName,fieldValue){
			if(Array.isArray(fieldValue) && fieldValue.length && typeof fieldValue[0]!="object") fieldValue=fieldValue.join(", ");
			if(typeof fieldValue=="string" || typeof fieldValue=="number"){
				// ----- .[fieldName]Val
				$("."+fieldName+"Val:not(img):not(iframe), [data-param='"+fieldName+"']:not(img):not(iframe)",elem).each(function(){
					var $el=$(this), useVal=convertValue($el,fieldValue);
					if($el.hasClass("toText")) $el.text(useVal);
					else $el.html(useVal);
				})
				// ----- special tags (links, images, input, etc)
				$("img."+fieldName+"Val, img[data-param='"+fieldName+"'], iframe."+fieldName+"Val, iframe[data-param='"+fieldName+"']",elem).attr("src",fieldValue);
				$("a."+fieldName+"Val-link, a[data-param='"+fieldName+"']",elem).attr("href",fieldValue);
				$("."+fieldName+"Val-class",elem).addClass(fieldValue);
				if(fieldValue.toString().indexOf("//")<0){
					$("img."+fieldName+"Val[data-path], iframe."+fieldName+"Val[data-path]",elem).each(function(){
						$(this).attr("src",$(this).attr("data-path") + convertValue($(this),fieldValue));
					})
					$("."+fieldName+"Val-link[data-path]",elem).each(function(){
						$(this).attr("href",$(this).attr("data-path") + convertValue($(this),fieldValue));
					})
				}
				$("a."+fieldName+"Val-email",elem).attr("href","mailto:"+ fieldValue);
				$("a."+fieldName+"Val-social[data-base]",elem).each(function(){
					var b=$(this).attr("data-base"), useVal=convertValue($(this),fieldValue);
					$(this).attr("href",b + ((b.slice(-1)!="/" && useVal.substr(0,1)!="/")?"/":"") +useVal);
				})
				$("a."+fieldName+"Val-tel",elem).attr("href","tel:"+ fieldValue).text(fieldValue);
				if($.isNumeric(fieldValue)) $("."+fieldName+"Val-width",elem).css("width",fieldValue+"%").removeClass("d-none")
				else $("."+fieldName+"Val-width",elem).addClass("d-none");
				$("."+fieldName+"Val-inpV",elem).attr("value",fieldValue);
				$("."+fieldName+"Val-inpN",elem).attr("name",fieldValue).addClass(fieldValue);
				$("."+fieldName+"Val-attr",elem).attr("data-"+ fieldName,fieldValue);
			// ----- array of objects
			} else if (typeof fieldValue=="object" && Array.isArray(fieldValue) && fieldValue.length && typeof fieldValue[0]=="object" && $("."+fieldName+"Div",elem).length){
				$("."+fieldName+"Div",elem).each(function(){
					var $hold=($("."+fieldName+"-holder",this).length)? $("."+fieldName+"-holder",this) : $(this),
						idField=$hold.attr("data-assign-id") || $hold.attr("data-assign") || "";
					if(!$hold.data("copy-elem") && $("."+fieldName+"-item",$hold).length) {
						var newID = fieldName;
    					var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    					for( var i=0; i < 8; i++ ) newID += possible.charAt(Math.floor(Math.random() * possible.length));
						$copyItem = $("."+fieldName+"-item",$hold).first().detach();
						const useTag = $copyItem.is("tr") ? "table" : ($copyItem.is("li") ? "ol" : "div");
						$("body").append("<"+ useTag +" style='display:none' id='"+ newID +"'></"+ useTag +">");
						$hold.data("copy-elem","#"+newID);
						$("#"+newID).append($copyItem);
					}
					if($hold.data("copy-elem")){
						$("."+fieldName+"-item",$hold).remove();
						$(fieldValue).each(function(i,obj){
							var $item=$($hold.data("copy-elem")).children(":first").clone();
							$item.akFillFromJSON(obj);
							if(idField) $item.data("id",obj[idField]).attr("data-id",obj[idField]);
							$item.data("data",obj);
							$hold.append($item);
							if(params && typeof params.callback=="function") params.callback(fieldName,obj,$item);
						})
					}
				})
			}
			if(fieldValue!="") {
				if(!params || params.bootstrap){
					$(".not-"+fieldName+"Div",elem).addClass("d-none hidden");
					$("."+fieldName+"Div",elem).removeClass("d-none hidden");
				} else {
					$(".not-"+fieldName+"Div",elem).hide();
					$("."+fieldName+"Div",elem).show();
				}
			}else{
				if(!params || params.bootstrap){
					$(".not-"+fieldName+"Div",elem).removeClass("d-none hidden");
					$("."+fieldName+"Div",elem).addClass("d-none hidden");
				} else {
					$(".not-"+fieldName+"Div",elem).show();
					$("."+fieldName+"Div",elem).hide();
				}
			}
		})
		function convertValue(elem,value){
			var useVal=(value || "").toString();
			if(elem.hasClass("alphaNumify")) useVal=useVal.replace(/\s/g,'_').replace(/\W+/g,'');
			else if(elem.hasClass("slugify")) useVal=useVal.replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
			else if(elem.hasClass("toHTML")) useVal=useVal.replace(new RegExp("\n".replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), "<br>");
			else if(elem.hasClass("toText")) useVal=$("<div>"+fieldValue+"</div>").text();
			//change case
			if(elem.hasClass("toLowerCase")) useVal=useVal.toLowerCase();
			else if(elem.hasClass("toUpperCase")) useVal=useVal.toUpperCase();
			else if(elem.hasClass("camelCase")) useVal=useVal.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
			else if(elem.hasClass("pascalCase")) useVal=useVal.replace(/(\-|^)([a-z])/gi, function (match, delimiter, hyphenated) {return hyphenated.toUpperCase();});
			return useVal;
		}
	}
}( jQuery ));