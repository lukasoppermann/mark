/* ------------------ */
//
/* functions */
// KILL THIS ONE !!!!!!!!!!!!!!!!!
// Wrap fn: wrapping element with characters
//
// var wrap = function(cm, wrap, check)
// {
// 	// define check if undefined
// 	check === undefined ? check = {} : '';
// 	// get cursor position
// 	var cursor = {
// 		start: cm.getCursor(true),
// 		end: cm.getCursor(false)
// 	}
// 	
// 	console.log(isQuote(cm, cursor));
// 	
// 	if( typeof(wrap) != undefined && !isHeadline(cm, cursor) )
// 	{
// 		// get selection
// 		var selection = {
// 			sel: cm.getSelection(),
// 			stLine: cm.getLine(cursor.start.line),
// 			endLine: cm.getLine(cursor.end.line),
// 			stChar: cursor.start.ch,
// 			stCharOrigin: cursor.start.ch,
// 			endChar: cursor.end.ch,
// 			endCharOrigin: cursor.end.ch,
// 			selLength: cm.getSelection().length
// 		}
// 		// build regex
// 		wrapReg = wrap;
// 		if( typeof(wrap) === "object" )
// 		{
// 			wrapReg = wrap.join("|");
// 			wrap = wrap[0];
// 		}
// 		wrapReg = new RegExp(wrapReg.replace(/\*/g,"\\*"));
// 		// set selection to middle of selection
// 		if( selection.selLength > 0 )
// 		{
// 			selection.stChar = selection.endChar = selection.stChar+Math.floor(selection.selLength/2);
// 			cm.setSelection({
// 				line: cursor.start.line, 
// 				ch: selection.stChar
// 			}, {
// 				line: cursor.end.line, 
// 				ch: selection.endChar
// 			});
// 			// reset selection
// 			selection.sel = cm.getSelection();
// 		}
// 		else if( selection.selLength == 0 )
// 		{
// 			cm.setSelection({
// 				line: cursor.start.line, 
// 				ch: selection.stChar-1
// 			}, {
// 				line: cursor.end.line, 
// 				ch: selection.endChar+1
// 			});
// 			if( cm.getSelection().replace(/^\s+|\s+$/g,'').length <= 1 )
// 			{
// 				cm.setSelection({
// 					line: cursor.start.line, 
// 					ch: selection.stCharOrigin
// 				}, {
// 					line: cursor.end.line, 
// 					ch: selection.endCharOrigin
// 				});
// 				return false;
// 			}
// 		}
// 		// define done
// 		var done = {
// 			start: false,
// 			end: false
// 		};
// 		var i = 0;
// 		while( done.start === false || done.end === false )
// 		{
// 			i++;
// 			console.log(i);
// 			if( i > 30 )
// 			{
// 				return;
// 			}
// 			// find beginning of string
// 			if( !/\s/.test(selection.sel.substr(0, 1)) && selection.stChar > 0 && !wrapReg.test(selection.sel.substr(0,wrap.length)) && done.start === false )
// 			{
// 				selection.stChar--;
// 			}
// 			else if( /\s/.test(selection.sel.substr(0, 1)) && done.start === false )
// 			{
// 				selection.stChar++;
// 				done.start = true;
// 			}
// 			if( ( selection.stChar <= 0 || wrapReg.test(selection.sel.substr(0,wrap.length)) ) && done.start === false )
// 			{
// 				done.start = true;
// 			}
// 			// find end of string
// 			if( (!/\s/.test(selection.sel.substr(-1)) && selection.endChar < selection.endLine.length ) && !wrapReg.test(selection.sel.substr(-wrap.length)) && done.end === false)
// 			{
// 				selection.endChar++;
// 			}
// 			else if( /\s/.test(selection.sel.substr(-1)) )
// 			{
// 				selection.endChar--;
// 				done.end = true;
// 			}
// 			if( ( selection.endChar >= selection.endLine.length || wrapReg.test(selection.sel.substr(-wrap.length)) ) && done.end === false)
// 			{
// 				done.end = true;
// 			}
// 			// set selection
// 			cm.setSelection({
// 				line: cursor.start.line, 
// 				ch: selection.stChar
// 			}, {
// 				line: cursor.end.line, 
// 				ch: selection.endChar
// 			});
// 			selection.sel = cm.getSelection();
// 		}
// 		// reset selection (exclude whitespace)
// 		cm.setSelection({
// 			line: cursor.start.line, 
// 			ch: selection.stChar
// 		}, {
// 			line: cursor.end.line, 
// 			ch: selection.endChar
// 		});
// 		// check if new selection matches wrap
// 		if( wrapReg.test(selection.sel.substr(0,wrap.length)) && wrapReg.test(selection.sel.substr(-wrap.length)) )
// 		{
// 			for( i = 0; i < check.length; i++ )
// 			{
// 				if( selection.sel.substr(0,check[i].length) == wrap && selection.sel.substr(-check[i].length) )
// 				{
// 					break;
// 				}
// 			}
// 			cm.replaceSelection(selection.sel.substr(wrap.length, selection.sel.length-(wrap.length*2)));
// 		}
// 		// otherwise add wrap
// 		else
// 		{
// 			if( selection.selLength !== 0 )
// 			{
// 				cm.setSelection({
// 					line: cursor.start.line, 
// 					ch: selection.stCharOrigin
// 				}, {
// 					line: cursor.end.line, 
// 					ch: selection.endCharOrigin
// 				});
// 				selection.sel = cm.getSelection();
// 			}
// 			cm.replaceSelection(wrap+selection.sel+wrap);
// 		}
// 	}
// };

// polyfills
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/gm, '');
  };
}
/* ------------------ */
//
// options object that holds all settings
//
var options = {
	fn: {
		// makeBold: makes the selection bold or not bold
		makeBold: function(cm)
		{
			// store original selection
			var sel = cm.getSelection(),
				 selLength = sel.length;
			// get cursor
			var cursor = {
				start: cm.getCursor(true),
				end: cm.getCursor(false)
			}
			// go to middle
			var position = getMiddle(cm, true);
			// check if bold
			if( isBold(cm) )
			{
				var match = {
					'*' : sel.match(/(\*\*)/g),
					'_' : sel.match(/(__)/g)
				};
				if( (match['*'] != undefined && match['*'].length >= 2) || (match['_'] != undefined && match['_'].length >= 2))
				{
					// reset selection
					cm.setSelection({
						line: cursor.start.line, 
						ch: cursor.start.ch
					}, {
						line: cursor.end.line, 
						ch: cursor.end.ch
					});
					// replace
					cm.replaceSelection(sel.replace(/^[\*||_]{2}/g, '').replace(/[\*||_]{2}$/g,''));
				}
				else
				{
					// get cursor position
					var curCursor = cm.getCursor(true);
					// get line
					var line = cm.getLine(curCursor.line);
					// get boundries
					var right = false, left = false, i = 0, str;
					// left
					while( left === false  )
					{
						i++;
						str = line.substring((curCursor.ch-i),curCursor.ch-(i-2));
						if( str == '**' || str == '__' )
						{
							left = i;
						}
				
					}
					i = 0;
					// right
					while( right === false  )
					{
						i++;
						str = line.substring((curCursor.ch+i),curCursor.ch+(i+2));
						if( str == '**' || str == '__' )
						{
							right = i;
						}
					}
					// get selection
					if( right !== false && left !== false )
					{
						cm.setSelection({
							line: curCursor.line, 
							ch: curCursor.ch-left
						}, {
							line: curCursor.line, 
							ch: curCursor.ch+right+2
						});
						// replace selection
						cm.replaceSelection(cm.getSelection().replace(/^[\*||_]{2}/g, '').replace(/[\*||_]{2}$/g,''));
					}
				}
			}
			else
			{
				if( selLength == 0 )
				{
					getWordBoundaries(cm, true);
					sel = cm.getSelection();
				}
				else
				{			
					// reset selection
					cm.setSelection({
						line: cursor.start.line, 
						ch: cursor.start.ch
					}, {
						line: cursor.end.line, 
						ch: cursor.end.ch
					});
					sel = cm.getSelection();
				}
				// add bold chars
				cm.replaceSelection('**'+sel+'**');
			}
		},
		// makeItalic: makes the selection bold or not bold
		makeItalic: function(cm)
		{
			// store original selection
			var sel = cm.getSelection(),
				 selLength = sel.length;
			// get cursor
			var cursor = {
				start: cm.getCursor(true),
				end: cm.getCursor(false)
			}
			// go to middle
			var position = getMiddle(cm, true);
			// check if bold
			if( isItalic(cm) )
			{
				var match = {
					'*' : sel.match(/(\*)/g),
					'_' : sel.match(/(_)/g)
				};
				if( (match['*'] != undefined && match['*'].length >= 2) || (match['_'] != undefined && match['_'].length >= 2))
				{
					// reset selection
					cm.setSelection({
						line: cursor.start.line, 
						ch: cursor.start.ch
					}, {
						line: cursor.end.line, 
						ch: cursor.end.ch
					});
					// replace
					cm.replaceSelection(sel.replace(/^[\*||_]{1}/g, '').replace(/[\*||_]{1}$/g,''));
				}
				else
				{
					// get cursor position
					var curCursor = cm.getCursor(true);
					// get line
					var line = cm.getLine(curCursor.line);
					// get boundries
					var right = false, left = false, i = 0, str;
					// left
					while( left === false  )
					{
						i++;
						str = line.substring((curCursor.ch-i),curCursor.ch-(i-1));
						if( str == '*' || str == '_' )
						{
							left = i;
						}
				
					}
					i = 0;
					// right
					while( right === false  )
					{
						i++;
						str = line.substring((curCursor.ch+i),curCursor.ch+(i+1));
						if( str == '*' || str == '_' )
						{
							right = i;
						}
					}
					// get selection
					if( right !== false && left !== false )
					{
						cm.setSelection({
							line: curCursor.line, 
							ch: curCursor.ch-left
						}, {
							line: curCursor.line, 
							ch: curCursor.ch+right+1
						});
						// replace selection
						cm.replaceSelection(cm.getSelection().replace(/^[\*||_]{1}/g, '').replace(/[\*||_]{1}$/g,''));
					}
					return false;
				}
			}
			else
			{
				if( selLength == 0 )
				{
					getWordBoundaries(cm, true);
					sel = cm.getSelection();
				}
				else
				{			
					// reset selection
					cm.setSelection({
						line: cursor.start.line, 
						ch: cursor.start.ch
					}, {
						line: cursor.end.line, 
						ch: cursor.end.ch
					});
					sel = cm.getSelection();
				}
				// add bold chars
				cm.replaceSelection('_'+sel+'_');
			}
			// set focus
			cm.focus();
		},
		// makeHeadline: makes headline for
		makeHeadline: function(cm, setLevel)
		{
			var level = isHeadline(cm),
				 curCursor = cm.getCursor(true),
				 setLevel = (setLevel !== undefined) ? parseInt(setLevel) : 1;
		
			// check if line is headline
			if( level !== false )
			{
				// set selection
				cm.setSelection({
					line: curCursor.line, 
					ch: 0
				}, {
					line: curCursor.line, 
					ch: parseInt(level)+1
				});
				// get selection
				var sel = cm.getSelection(),
					 num = (sel.substr(-1) == ' ' ? 1 : 0);
			 
				if( level == setLevel )
				{
					cm.replaceSelection(cm.getSelection().substr(setLevel+num));
				}
				else if( level > setLevel )
				{
					cm.replaceSelection(cm.getSelection().substr(level-setLevel));
				}
				// level < setLevel
				else
				{
					cm.replaceSelection(cm.getSelection().substr(setLevel+num)+new Array( setLevel + 1 ).join( '#' )+' ');
				}
			}
			else
			{
				// set selection
				cm.setSelection({
					line: curCursor.line, 
					ch: 0
				}, {
					line: curCursor.line, 
					ch: 0
				});
				// add #
				cm.replaceSelection(new Array( setLevel + 1 ).join( '#' )+' '+cm.getSelection());
			}
			// reset selection
			cm.setSelection({
				line: curCursor.line, 
				ch: 0
			}, {
				line: curCursor.line, 
				ch: cm.getLine(curCursor.line).length
			});
			// set focus
			cm.focus();
		},
		// makeQuote: makes quotes
		makeQuote: function(cm, setLevel)
		{
			var level = isQuote(cm),
				 curCursor = cm.getCursor(true),
				 setLevel = (setLevel !== undefined && typeof(setLevel) === "number") ? setLevel : (level === false ? 1 : (parseInt(level) === 1 ? 2 : false));
			// check if line is headline
			if( level !== false )
			{
				// set selection
				cm.setSelection({
					line: curCursor.line, 
					ch: 0
				}, {
					line: curCursor.line, 
					ch: parseInt(level)+1
				});
				// get selection
				var sel = cm.getSelection(),
					 num = (sel.substr(-1) == ' ' ? 1 : 0);
			 
				if ( setLevel === false )
				{
					cm.replaceSelection(cm.getSelection().substr(level+num))
				}
				else if( level == setLevel )
				{
					cm.replaceSelection(cm.getSelection().substr(setLevel+num));
				}
				else if( level > setLevel )
				{
					cm.replaceSelection(cm.getSelection().substr(level-setLevel));
				}
				// level < setLevel
				else
				{
					cm.replaceSelection(cm.getSelection().substr(setLevel+num)+new Array( setLevel + 1 ).join( '>' )+' ');
				}
			}
			else
			{
				// set selection
				cm.setSelection({
					line: curCursor.line, 
					ch: 0
				}, {
					line: curCursor.line, 
					ch: 0
				});
				// add #
				cm.replaceSelection(new Array( setLevel + 1 ).join( '>' )+' '+cm.getSelection());
			}
			// reset selection
			cm.setSelection({
				line: curCursor.line, 
				ch: 0
			}, {
				line: curCursor.line, 
				ch: cm.getLine(curCursor.line).length
			});
			// set focus
			cm.focus();
		},
		// check for formatting
		hasFormat: function(format, middle){
			var block = ["header", "quote", "code"], isBlock = false,
				 inline = ["strong", "em", "link"], isInline = false,
				 pos;
			// if inline 
			if( inline.indexOf(format) !== -1 )
			{
				isInline = true;
				// set selection to middle of selection
				pos = getMiddle(options.cm, false); // remove cm !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
			}
			else{ 
				isBlock = true; 
				pos = {
					line: options.cm.getCursor(false).line, 
					ch: options.cm.getCursor(false).ch
				};
			}
			// check if any type is present
			var type = options.cm.getTokenTypeAt({
				line: pos.line, 
				ch: pos.ch
			});
			var match = false;
			if( type != null )
			{
				if( isInline === true )
				{
					if(new RegExp(format).test(type) || (format === 'link' && new RegExp('string').test(type)) )
					{
						match = true;
					}
				}
				else if( isBlock === true )
				{
					var tmpMatch = type.match(new RegExp(format+'-?(\\d+)'));
					if( tmpMatch !== null && tmpMatch[1] !== null )
					{
						match = parseInt(tmpMatch[1]);
					}
				}
			}
			// return
			return match;
		}
	},
	ffn: {
		addClass: function (el, classes) 
		{
			options.ffn.changeClass(el, classes, 'add');
		},
		removeClass: function (el, classes) 
		{
			options.ffn.changeClass(el, classes, 'remove');
		},
		changeClass: function(el, classes, type)
		{
			if( classes !== undefined && classes.trim().length > 0 )
			{
				classes = Array.prototype.slice.call (arguments, 1);
				for (var i = classes.length; i--;) 
				{
					classes[i] = classes[i].trim ().split (/\s*,\s*|\s+/);
					for (var j = classes[i].length; j--;)
					{
						el.classList[type](classes[i][j]);
					}
				}
			}
		}
	}
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
	if( typeof(setMiddle) != undefined && setMiddle != null && setMiddle != false && sel.length > 0 )
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
// getWordBoundaries: get the bundaries of a word
//
var getWordBoundaries = function(cm, setSelection)
{
	// get cursor position
	var curCursor = cm.getCursor(true);
	// get line
	var line = cm.getLine(curCursor.line);
	// get boundries
	var right = false, left = false, i = 0, str;
	// left
	while( left === false  )
	{
		i++;
		str = line.substring((curCursor.ch-i),curCursor.ch-(i-1));
		if( str == ' ')
		{
			left = i;
		}
		
	}
	i = 0;
	// right
	while( right === false  )
	{
		i++;
		str = line.substring((curCursor.ch+i),curCursor.ch+(i+1));
		if( str == ' ')
		{
			right = i;
		}
	}
	// set selection
	if( typeof(setSelection) != undefined && setSelection != null && setSelection != false  )
	{
		cm.setSelection({
			line: curCursor.line, 
			ch: parseInt(curCursor.ch)-parseInt(left)+1
		}, {
			line: curCursor.line, 
			ch: parseInt(curCursor.ch)+parseInt(right)-1
		});
		
	}
	// return word boundaries
	return [{ line: curCursor.line, ch: curCursor.ch-left+1 },
			  { line: curCursor.line, ch: curCursor.ch+right-1 }];
}
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
	return match != null ? parseInt(match[1]) : false;
}
//
// isBold: check if element is bold
//
var isBold = function(cm)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(false).ch
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
var isQuote = function(cm)
{
	// get type
	var type = cm.getTokenTypeAt({
		line: cm.getCursor(true).line, 
		ch: cm.getCursor(false).ch
	});
	//
	if( type != null )
	{
		// match headline
		var match = type.match(/quote-(\d+)/);
	}
	// return
	return match != null ? parseInt(match[1]) : false;
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
	var panel = document.getElementById('editOptions');
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
			if( typeof(panel) === undefined || panel === null)
			{
				// create element
				panel = document.createElement('div');
				panel.id = 'editOptions';
				panel.innerHTML = '<div data-class="strong" data-fn="makeBold" class="strong button">B</div>'+
										'<div data-class="em" data-fn="makeItalic" class="em button">i</div>'+
										'<div data-class="header1" data-fn="makeHeadline" data-parameters="1" class="header1 button">H1</div>'+
										'<div data-class="header2" data-fn="makeHeadline" data-parameters="2" class="header2 button">H2</div>'+
										'<div data-class="quote" data-fn="makeQuote" data-parameters="false" class="quote button"></div>'+
										'<div data-class="link" data-fn="makeLink" class="link button">&</div>';
				// add panel to editor
				cm.addWidget({line:0,ch:0},panel);
				// select elements
				panel = document.getElementById('editOptions');
				// add events			
				panel.addEventListener("click", function(e) 
				{
					// run function
					options.fn[e.target.getAttribute("data-fn")](cm, e.target.getAttribute("data-parameters"));
					panel.classList.toggle(e.target.getAttribute("data-class"));
					// set focus
					cm.focus();
				});
			}
			// check which elements are active
			var add = "", remove = "";
			options.fn.hasFormat('strong') ? add += 'strong, ' : remove += 'strong, ';
			options.fn.hasFormat('em') ? add += 'em, ' : remove += 'em, ';
			options.fn.hasFormat('quote') === 1 ? add += 'quote-1, ' : remove += 'quote-1, ';
			options.fn.hasFormat('quote') === 2 ? add += 'quote-2, ' : remove += 'quote-2, ';
			options.fn.hasFormat('header') === 1 ? add += 'header1, ' : remove += 'header1, ';
			options.fn.hasFormat('header') === 2 ? add += 'header2, ' : remove += 'header2, ';
			// add & remove classes
			options.ffn.addClass(panel, add.replace(/\,\s+$/gm, ''));
			options.ffn.removeClass(panel, remove.replace(/\,\s+$/gm, ''));
			// ------------------------------
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
			panel.classList.add('active');
			// ------------------------------
			// calculate top
			var arrowHeight = 7+2;
			var top = (coords.start.top-arrowHeight-window.getComputedStyle(panel).height.replace('px',''));
			// remove class
			panel.classList.remove('from-top');
			if( top < 0 ){ 
				top = (coords.end.top+arrowHeight+parseInt(window.getComputedStyle(panel).height.replace('px','')));
				panel.classList.add('from-top');
			}
			panel.style.top = top+'px';
			// ------------------------------
			// calculate horizontal position
			//
			var middle = coords.end.left-((coords.end.left-coords.start.left)/2);
			var left = Math.floor(middle-(window.getComputedStyle(panel).width.replace('px','')/2));
			// remove classes
			panel.classList.remove('from-left');
			panel.classList.remove('from-right');
			if( left < 1 ){ 
				left = 2;
				panel.classList.add('from-left');
			}
			else if( left + parseInt(window.getComputedStyle(panel).width.replace('px','')) >= window.innerWidth )
			{
				left = window.innerWidth - (parseInt(window.getComputedStyle(panel).width.replace('px','')) + 2);
				panel.classList.add('from-right');
			}
			// set position
			panel.style.left = left+'px';
		// close timeout
		}, 200);
	}
	else
	{
		window.setTimeout(function()
		{
			if( typeof(panel) !== undefined && panel !== null )
			{
				panel.classList.remove('active');		
			}
		}, 100);
	}
};

/* ------------------ */
//
/* RUN EDITOR */
//
// run codemirror on every instance of .mark
Array.prototype.slice.call(document.getElementsByClassName('mark'),0).forEach(function(editor){
	
	options.cm = CodeMirror.fromTextArea(editor, {
		theme: "mark",
	  // value: "function myScript(){return 100;}\n",
		mode: {
			name: "gfm",
			highlightFormatting: true
		},
		lineNumbers: true,
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
				makeItalic(cm);
			},
			"Ctrl-I": function(cm){
				makeItalic(cm);
			}
		}
	});
	// add edit Options	
	options.cm.on("cursorActivity", function(cm){
		options.fn.hasFormat('header');
		options.fn.hasFormat('quote');
		editOptions(cm);
	});
	
});
