/*! akFillFromJSON v1.0.1 2020-01-23 | https://github.com/akwebapps/ak-FillFromJSON | (c) 2020 AK Web Apps | @license Licensed MIT */
(function ( $ ) {
	$.fn.akFillFromJSON = function(data, notBS) {
		this.each(function() {
			new $.akFillFromJSON(this, data, notBS);
		});
		return;
	};
	$.akFillFromJSON = function( elem, data, notBS ){
		$.each(data,function(fieldName,fieldValue){
			if(Array.isArray(fieldValue) && fieldValue.length && typeof fieldValue[0]!="object") fieldValue=fieldValue.join(joinBy || ", ");
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
			} else if (typeof fieldValue=="object" && Array.isArray(fieldValue) && fieldValue.length && typeof fieldValue[0]=="object" && $("."+fieldName+"Div",elem).length && $("."+fieldName+"-item",elem).length){
				$("."+fieldName+"Div",elem).each(function(){
					var $hold=($("."+fieldName+"-holder",this).length)? $("."+fieldName+"-holder",this) : $(this), 
						$item=$($("."+fieldName+"-item",this).first().outerHTML()),
						idField=$(this).attr("data-assign") || "";
					$("."+fieldName+"-item",this).remove();
					$(fieldValue).each(function(i,obj){
						$item.akFillFromJSON(obj);
						if(idField) $item.attr("data-id",obj[idField]);
						$hold.append($item.outerHTML());
					})
				})
			}
			if(fieldValue!="") {
				if(notBS){
					$(".not-"+fieldName+"Div",elem).hide();
					$("."+fieldName+"Div",elem).show();
				} else {
					$(".not-"+fieldName+"Div",elem).addClass("d-none hidden");
					$("."+fieldName+"Div",elem).removeClass("d-none hidden");
				}
			}else{
				if(notBS){
					$(".not-"+fieldName+"Div",elem).show();
					$("."+fieldName+"Div",elem).hide();
				} else {
					$(".not-"+fieldName+"Div",elem).removeClass("d-none hidden");
					$("."+fieldName+"Div",elem).addClass("d-none hidden");
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
