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
		lineWrapping: true,
		flattenSpans: true,
		cursorHeight: 0.66,
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
				wrap(cm, "**");
			},
			"Ctrl-B": function(cm){
				wrap(cm, "**");
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
	// myCodeMirror.on("cursorActivity", function(cm){
	// 	editOptions(cm)
	// });
	
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
		}
		cm.setSelection({
			line: cursor.start.line, 
			ch: selection.stChar
		}, {
			line: cursor.end.line, 
			ch: selection.endChar
		});
		selection.sel = cm.getSelection();
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
/* functions */
//
// Wrap fn: wrapping element with characters
//
var isHeadline = function(cm, cursor)
{
	// check for headline
	var isHeadline = cm.getLine(cursor.start.line).substr(0,1) === '#' ? true : false;
	// reset selection
	cm.setSelection({
		line: cursor.start.line, 
		ch: cursor.start.ch
	}, {
		line: cursor.end.line, 
		ch: cursor.end.ch
	});
	// return
	return isHeadline;
}

/* ------------------ */
//
/* functions */
//
// EditOptions fn: 
//
// var editOptions = function(cm)
// {
// 	var elem = document.getElementById('editOptions');
// 	//
// 	if( cm.getSelection().length > 0 )
// 	{
// 		if( typeof(elem) === undefined || elem === null)
// 		{
// 			elem = document.createElement('div');
// 			cm.addWidget({line:0,ch:0},elem);
// 		}
// 		var cords = cm.cursorCoords();
// 		elem.id = 'editOptions';
// 		elem.style.top = cords.top-20+'px';
// 		elem.style.left = cords.left+'px';
// 		elem.style.zIndex = 999;
// 		console.log(cords);
// 	}
// 	else if( typeof(elem) !== undefined || elem !== null )
// 	{
// 		console.log(elem);
// 		elem.remove();
// 	}
// };

