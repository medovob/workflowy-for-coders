jQuery.SyntaxHighlighter.init({
	
	/**
	 * Whether or not we should load in Google Prettify automatically if it was not detected.
	 */
	'load': true,

	/**
	 * Whether or not we should highlight all appropriate code blocks automatically once the page has finished loading.
	 */
	'highlight': false,

	/**
	 * Whether or not we should output debug information in case something is not working correctly.
	 */
	'debug': false,

	/**
	 * Whether or not we should wrap the code blocks lines, or have them scrollable.
	 */
	'wrapLines': false,

	/**
	 * Whether or not we should display line numbers next to the code blocks.
	 */
	'lineNumbers': false,

	/**
	 * Whether or not we should strip empty start and finish lines from the code blocks.
	 */
	'stripEmptyStartFinishLines': true,

	/**
	 * Whether or not we should remove whitespaces/indentations which are only there for HTML formatting of our code block.
	 */
	'stripInitialWhitespace': true,

	/**
	 * Whether or not we should alternate the lines background colours on odd and even rows.
	 */
	'alternateLines': false,

	/**
	 * The default class to look for in case we have not explicitly specified a language.
	 */
	'defaultClassname': 'syntax-highlight',

	/**
	 * The theme that should be used by our highlighted code blocks.
	 */
	'theme': 'balupton',

	/**
	 * The themes to load in for use with our highlighted code blocks.
	 */
	'themes': ['balupton'],

	/**
	 * The baseUrl to load Google's Prettify from.
	 * This is used to load in Google's Prettify if the load option is true and it was not found.
	 */
	'prettifyBaseUrl': 'http://github.com/balupton/jquery-syntaxhighlighter/raw/master/prettify',

	/**
	 * The baseUrl to load our Syntax Highlighter from.
	 * This is used to load in the stylesheet and additional themes.
	 */
	'baseUrl': 'http://github.com/balupton/jquery-syntaxhighlighter/raw/master'

});

jQuery.fn.getID = function() {
  
	var element = $(this)[0];

	if(element) {
		if(!element.id) {
			element.id = (new Date()).getTime()+"_"+Math.round(Math.random()*10000);
		}
		return element.id
	}	
	return "";
}

jQuery(document).ready(function($) {
  
  var converter = new Showdown.converter();

	$("textarea").focus(function() {
    if($(".project.selected>.notes .content.editing").length) {
			$(this).addClass("enhanced");
		}	
	}).blur(function() {
		$(this).removeClass("enhanced");
	});

	$("#workflowy").bind("DOMSubtreeModified", function() {

    $(".project.selected>.notes .content.editing.markdown-processed")
    	.removeClass("markdown-processed")
    	.parent()
    		.find(".markdown")
    		  .remove();
    
    $(".project")
    	.not(".selected")
        .children(".notes")
    		  .children(".content.markdown-processed")
    				.removeClass("markdown-processed")
    				.parent()
    					.find(".markdown")
    						.remove();

    $(".project.selected>.notes .content").not(".markdown-processed,.editing").each(function() {
	    	
			var $notes = $(this).parent(),
			    $content = $(this).addClass("markdown-processed"),
			    text = $content.text(),
			    $markdown = $('<div class="markdown wikistyle"></div>').html(converter.makeHtml(text)).appendTo($notes);
    		
    	$markdown.find("pre code").addClass("syntax-highlight").css("width","auto !important");
			$markdown.syntaxHighlight();		
	    	
		  var contentID = $content.getID();
      		
      $markdown.dblclick(function() {
        injectScript(function(contentID) {
       	  jQuery("#"+contentID).mouseover();
       		if(!jQuery(".editor.hovered textarea").focus().is(".enhanced")) {
	       	  jQuery(".editor").not(".fixed").find("textarea").focus();
	       	}
       	},contentID);
      });
    });

	    
	  $("#exportPopup .previewWindow").find(".note").not(".markdown-enabled").addClass("markdown-enabled wikistyle").each(function() {
	    var text = $(this).text();
	    $(this).html(converter.makeHtml(text));
	    $(this).find("pre code").addClass("syntax-highlight");
			$(this).syntaxHighlight();
	  });
	    
	}).trigger("DOMSubtreeModified");

});


//////////////////////////////////////////////////////////////////////////////////////////////
// Copyright(C) 2010 Abdullah Ali, voodooattack@hotmail.com                                 //
//////////////////////////////////////////////////////////////////////////////////////////////
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php       //
//////////////////////////////////////////////////////////////////////////////////////////////
 
// Injects a script into the DOM, the new script gets executed in the original page's
// context instead of the active content-script context.
//
//    Parameters:
//            source: [string/function]
//            (2..n): Function arguments if a function was passed as the first parameter.
 
 
function injectScript(source)
{
     
    var isFunction = function (arg) { 
        return (Object.prototype.toString.call(arg) == "[object Function]"); 
    };
     
    var jsEscape = function (str) { 
        // Replaces quotes with numerical escape sequences to
        // avoid single-quote-double-quote-hell, also helps by escaping HTML special chars.
        if (!str || !str.length) return str;
        // use \W in the square brackets if you have trouble with any values.
        var r = /['"<>\/]/g, result = "", l = 0, c; 
        do{    c = r.exec(str);
            result += (c ? (str.substring(l, r.lastIndex-1) + "\\x" + 
                c[0].charCodeAt(0).toString(16)) : (str.substring(l)));
        } while (c && ((l = r.lastIndex) > 0))
        return (result.length ? result : str);
    };
 
    var bFunction = isFunction(source);
    var elem = document.createElement("script");    // create the new script element.
    var script, ret, id = "";
 
    if (bFunction)
    {
        // We're dealing with a function, prepare the arguments.
        var args = [];
 
        for (var i = 1; i < arguments.length; i++)
        {
            var raw = arguments[i];
            var arg;
 
            if (isFunction(raw))    // argument is a function.
                arg = "eval(\"" + jsEscape("(" + raw.toString() + ")") + "\")";
            else if (Object.prototype.toString.call(raw) == '[object Date]') // Date
                arg = "(new Date(" + raw.getTime().toString() + "))";
            else if (Object.prototype.toString.call(raw) == '[object RegExp]') // RegExp
                arg = "(new RegExp(" + raw.toString() + "))";
            else if (typeof raw === 'string' || typeof raw === 'object') // String or another object
                arg = "JSON.parse(\"" + jsEscape(JSON.stringify(raw)) + "\")";
            else
                arg = raw.toString(); // Anything else number/boolean
 
            args.push(arg);    // push the new argument on the list
        }
 
        // generate a random id string for the script block
        while (id.length < 16) id += String.fromCharCode(((!id.length || Math.random() > 0.5) ?
            0x61 + Math.floor(Math.random() * 0x19) : 0x30 + Math.floor(Math.random() * 0x9 )));
 
        // build the final script string, wrapping the original in a boot-strapper/proxy:
        script = "(function(){var value={callResult: null, throwValue: false};try{value.callResult=(("+
            source.toString()+")("+args.join()+"));}catch(e){value.throwValue=true;value.callResult=e;};"+
            "document.getElementById('"+id+"').innerText=JSON.stringify(value);})();";
 
        elem.id = id;
    }
    else // plain string, just copy it over.
    {
        script = source;
    }
 
    elem.type = "text/javascript";
    elem.innerHTML = script;
 
    // insert the element into the DOM (it starts to execute instantly)
    document.head.appendChild(elem);
 
    if (bFunction)
    {
        // get the return value from our function:
        ret = JSON.parse(elem.innerText);
 
        // remove the now-useless clutter.
        elem.parentNode.removeChild(elem);
 
        // make sure the garbage collector picks it instantly. (and hope it does)
        delete (elem);
 
        // see if our returned value was thrown or not
        if (ret.throwValue)
            throw (ret.callResult);
        else
            return (ret.callResult);
    }
    else // plain text insertion, return the new script element.
        return (elem);
}
