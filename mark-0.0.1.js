nodeList = document.getElementsByClassName('mark');

Array.prototype.slice.call(nodeList,0).forEach(function(editor){
	
	var myCodeMirror = CodeMirror.fromTextArea(editor, {
		theme: "mark",
	  // value: "function myScript(){return 100;}\n",
		mode: {
			name: "gfm",
			highlightFormatting: true
		},
		lineNumbers: false,
		addModeClass: false,
		lineWrapping: true,
		flattenSpans: true,
		cursorHeight: 1,
		matchBrackets: true,
		autoCloseBrackets: { pairs: "()[]{}''\"\"", explode: "{}" },
		matchTags: true,
		showTrailingSpace: true,
		autoCloseTags: true,
		styleSelectedText: true,
		styleActiveLine: true,
		placeholder: "",
      tabMode: 'indent',
		tabindex: "2",
		dragDrop: false,
		extraKeys: {
			"Enter": "newlineAndIndentContinueMarkdownList",
			"Cmd-B": function(cm){
				makeBold(cm);
			},
			"Ctrl-B": function(cm){
				makeBold(cm);
			},
			"Cmd-I": function(cm){
				wrap(cm, ["_","*"]);
			},
			"Ctrl-I": function(cm){
				wrap(cm, ["_","*"]);
			}
		}
	});
	
	// add edit Options	
	myCodeMirror.on("cursorActivity", function(cm){
		editOptions(cm);
	});
	
});

/* ------------------ */
//
/* functions */
//
// Wrap fn: wrapping element with characters
//
var wrap = function(cm, wrap, check)
{
	// define check if undefined
	check === undefined ? check = {} : '';
	// get cursor position
	var cursor = {
		start: cm.getCursor(true),
		end: cm.getCursor(false)
	}
	
	console.log(isQuote(cm, cursor));
	
	if( typeof(wrap) != undefined && !isHeadline(cm, cursor) )
	{
		// get selection
		var selection = {
			sel: cm.getSelection(),
			stLine: cm.getLine(cursor.start.line),
			endLine: cm.getLine(cursor.end.line),
			stChar: cursor.start.ch,
			stCharOrigin: cursor.start.ch,
			endChar: cursor.end.ch,
			endCharOrigin: cursor.end.ch,
			selLength: cm.getSelection().length
		}
		// build regex
		wrapReg = wrap;
		if( typeof(wrap) === "object" )
		{
			wrapReg = wrap.join("|");
			wrap = wrap[0];
		}
		wrapReg = new RegExp(wrapReg.replace(/\*/g,"\\*"));
		// set selection to middle of selection
		if( selection.selLength > 0 )
		{
			selection.stChar = selection.endChar = selection.stChar+Math.floor(selection.selLength/2);
			cm.setSelection({
				line: cursor.start.line, 
				ch: selection.stChar
			}, {
				line: cursor.end.line, 
				ch: selection.endChar
			});
			// reset selection
			selection.sel = cm.getSelection();
		}
		else if( selection.selLength == 0 )
		{
			cm.setSelection({
				line: cursor.start.line, 
				ch: selection.stChar-1
			}, {
				line: cursor.end.line, 
				ch: selection.endChar+1
			});
			if( cm.getSelection().replace(/^\s+|\s+$/g,'').length <= 1 )
			{
				cm.setSelection({
					line: cursor.start.line, 
					ch: selection.stCharOrigin
				}, {
					line: cursor.end.line, 
					ch: selection.endCharOrigin
				});
				return false;
			}
		}
		// define done
		var done = {
			start: false,
			end: false
		};
		var i = 0;
		while( done.start === false || done.end === false )
		{
			i++;
			console.log(i);
			if( i > 30 )
			{
				return;
			}
			// find beginning of string
			if( !/\s/.test(selection.sel.substr(0, 1)) && selection.stChar > 0 && !wrapReg.test(selection.sel.substr(0,wrap.length)) && done.start === false )
			{
				selection.stChar--;
			}
			else if( /\s/.test(selection.sel.substr(0, 1)) && done.start === false )
			{
				selection.stChar++;
				done.start = true;
			}
			if( ( selection.stChar <= 0 || wrapReg.test(selection.sel.substr(0,wrap.length)) ) && done.start === false )
			{
				done.start = true;
			}
			// find end of string
			if( (!/\s/.test(selection.sel.substr(-1)) && selection.endChar < selection.endLine.length ) && !wrapReg.test(selection.sel.substr(-wrap.length)) && done.end === false)
			{
				selection.endChar++;
			}
			else if( /\s/.test(selection.sel.substr(-1)) )
			{
				selection.endChar--;
				done.end = true;
			}
			if( ( selection.endChar >= selection.endLine.length || wrapReg.test(selection.sel.substr(-wrap.length)) ) && done.end === false)
			{
				done.end = true;
			}
			// set selection
			cm.setSelection({
				line: cursor.start.line, 
				ch: selection.stChar
			}, {
				line: cursor.end.line, 
				ch: selection.endChar
			});
			selection.sel = cm.getSelection();
		}
		// reset selection (exclude whitespace)
		cm.setSelection({
			line: cursor.start.line, 
			ch: selection.stChar
		}, {
			line: cursor.end.line, 
			ch: selection.endChar
		});
		// check if new selection matches wrap
		if( wrapReg.test(selection.sel.substr(0,wrap.length)) && wrapReg.test(selection.sel.substr(-wrap.length)) )
		{
			for( i = 0; i < check.length; i++ )
			{
				if( selection.sel.substr(0,check[i].length) == wrap && selection.sel.substr(-check[i].length) )
				{
					break;
				}
			}
			cm.replaceSelection(selection.sel.substr(wrap.length, selection.sel.length-(wrap.length*2)));
		}
		// otherwise add wrap
		else
		{
			if( selection.selLength !== 0 )
			{
				cm.setSelection({
					line: cursor.start.line, 
					ch: selection.stCharOrigin
				}, {
					line: cursor.end.line, 
					ch: selection.endCharOrigin
				});
				selection.sel = cm.getSelection();
			}
			cm.replaceSelection(wrap+selection.sel+wrap);
		}
	}
};

/* ------------------ */
//
// makeBold: makes the selection bold or not bold
//
var makeBold = function(cm)
{
	var position = getMiddle(cm, true);
	console.log(position);
	
};
/* ------------------ */
//
// getMiddle: get the middle of a given range
//
var getMiddle = function(cm, setMiddle)
{
	// selection
	var sel = cm.getSelection();
	// get cursor
	var cursor = {
		start: cm.getCursor(true),
		end: cm.getCursor(false)
	}
	console.log(cursor);
	// get middle
	var length = 0, lineNum = false, chNum = Math.floor(sel.length/2) - 1;
	selLength = chNum + cursor.start.ch;
	chNum = selLength+1
	lineNum = cursor.start.line;
	// loop through lines
	
	// cm.eachLine(cursor.start.line, cursor.end.line+1, function(line)
	// {
	// 	length += line.text.length;
	// 	if( length >= selLength && lineNum == false)
	// 	{
	// 		lineNum = cm.getLineNumber(line);
	// 	}
	// 	if( lineNum == false )
	// 	{
	// 		chNum -= line.text.length;
	// 	}
	// });
	// get middle
	if( typeof(setMiddle) != undefined && setMiddle != null && setMiddle != false && sel.length > 0  )
	{
		// reset selection
		cm.setSelection({
			line: lineNum, 
			ch: chNum
		}, {
			line: lineNum, 
			ch: chNum
		});	
	}
	// get middle position
	return { line: lineNum , ch: chNum }
};
/* ------------------ */
//
/* detect styling */
//
// isHeadline: check if element is headline
//
var isHeadline = function(cm)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(true).ch
	});
	//
	if( type != null )
	{
		// match headline
		var match = type.match(/header(\d+)/);
	}
	// return
	return match != null ? match[1] : false;
}
//
// isBold: check if element is bold
//
var isBold = function(cm)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(true).ch
	});
	if( type != null )
	{
		// match headline
		var match = type.match(/strong/);
	}
	// return
	return match != null ? true : false;
}
//
// isItalic: check if element is italic
//
var isItalic = function(cm)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(true).ch
	});
	if( type != null )
	{
		// match headline
		var match = type.match(/em/);
	}
	// return
	return match != null ? true : false;
}
//
// isQuote: check if element is quote
//
var isQuote = function(cm, cursor)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(true).ch
	});
	//
	if( type != null )
	{
		// match headline
		var match = type.match(/quote-(\d+)/);
	}
	// return
	return match != null ? match[1] : false;
}
//
// isLink: check if element is link
//
var isLink = function(cm, cursor)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(true).ch
	});
	//
	if( type != null )
	{
		// match headline
		var match = type.match(/link/);
		match == undefined ? match = type.match(/string/) : null;
	}
	// return
	return match != null ? true : false;
}
/* ------------------ */
//
/* functions */
//
// EditOptions fn: 
//
var f, editOptions = function(cm)
{
	// get element
	var elem = document.getElementById('editOptions');
	// clear timeout
	window.clearTimeout(f);
	// check for selection
	if( cm.getSelection().length > 0 )
	{
		// ------------------------------
		// start timeout
		f = window.setTimeout(function()
		{
			// check for element	
			if( typeof(elem) === undefined || elem === null)
			{
				// create element
				elem = document.createElement('div');
				cm.addWidget({line:0,ch:0},elem);
				elem.id = 'editOptions';
				// add buttons
				elem.innerHTML = 	'<div id="bold" class="button">B</div>'+
										'<div id="italic" class="button">i</div>'+
										'<div id="headline-1" class="button">H1</div>'+
										'<div id="headline-2" class="button">H2</div>'+
										'<div id="quote" class="button"></div>'+
										'<div id="link" class="button">&</div>';
				// select elements
				elem = document.getElementById('editOptions');
			}
			// get cursor
			var cursor = {
				start: cm.getCursor(true),
				end: cm.getCursor(false)
			};
			// get coords
			var coords = {
				start: cm.charCoords({line:cursor.start.line, ch: cursor.start.ch}),
				end: cm.charCoords({line:cursor.end.line, ch: cursor.end.ch})
			};
			// add active class
			elem.classList.add('active');
			// ------------------------------
			// calculate top
			var arrowHeight = 7+2;
			var top = (coords.start.top-arrowHeight-window.getComputedStyle(elem).height.replace('px',''));
			// remove class
			elem.classList.remove('from-top');
			if( top < 0 ){ 
				top = (coords.end.top+arrowHeight+parseInt(window.getComputedStyle(elem).height.replace('px','')));
				elem.classList.add('from-top');
			}
			elem.style.top = top+'px';
			// ------------------------------
			// calculate horizontal position
			//
			var middle = coords.end.left-((coords.end.left-coords.start.left)/2);
			var left = Math.floor(middle-(window.getComputedStyle(elem).width.replace('px','')/2));
			// remove classes
			elem.classList.remove('from-left');
			elem.classList.remove('from-right');
			if( left < 1 ){ 
				left = 2;
				elem.classList.add('from-left');
			}
			else if( left + parseInt(window.getComputedStyle(elem).width.replace('px','')) >= window.innerWidth )
			{
				left = window.innerWidth - (parseInt(window.getComputedStyle(elem).width.replace('px','')) + 2);
				elem.classList.add('from-right');
			}
			// set position
			elem.style.left = left+'px';
		// close timeout
		}, 200);
	}
	else if( typeof(elem) !== undefined && elem !== null )
	{
		elem.classList.remove('active');
	}
};

