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
		// format
		toggleFormat: function(format, params)
		{
			var block = {"header":["#"], "quote":[">"], "code":["```"]},
				 inline = {"strong":["**"], "em":["_"], "link":[""]},
				 pos, params = (params === undefined || params === null) ? {} : params;
			params.format = format;
 			// if inline 
 			if( inline.hasOwnProperty(format) )
 			{
				if( format === "strong" || format === "em" )
				{
					params.indicator = inline[format];
					options.fn.inlineFormat(params);
				}
				else if( format === "link" )
				{
					// needs to be implemented
				}
 			}
			// if block
 			else
			{
				if( format === "header" || format === "quote" )
				{
					params.indicator = block[format];
					options.fn.blockFormatFront(params);
				}
				else if( format === "code" )
				{
					// needs to be implemented
				}
 			}	 
		},
		// blockFormatFront
		blockFormatFront: function( params )
		{
			var level = options.fn.hasFormat(params.format),
				 curCursor = options.cm.getCursor(true);
			if( level !== false && typeof(level) === 'number' )
			{
				options.cm.setSelection({
					line: options.cm.getCursor(true).line,
					ch: 0
				}, {
					line: options.cm.getCursor(true).line, 
					ch: parseInt(level)+1
				});
				var sel = options.cm.getSelection();
				// remove format
				if( level === params.level )
				{
					options.cm.replaceSelection( sel.substr(params.level + (sel.substr(-1) == ' ' ? 1 : 0) ) );
				}
				// change format
				else if( level > params.level)
				{
					options.cm.replaceSelection( sel.substr(level - params.level));
				}
				else
				{
					options.cm.replaceSelection( sel.substr( params.level + (sel.substr(-1) == ' ' ? 1 : 0) ) + new Array( params.level + 1 ).join( params.indicator[0] )+' ');
				}
			}
			// add format
			else
			{
				options.cm.setSelection({
					line: curCursor.line, 
					ch: 0
				}, {
					line: curCursor.line, 
					ch: 0
				});
				// add indicator
				options.cm.replaceSelection(new Array( params.level + 1 ).join( params.indicator[0] )+' ');
			}
			options.cm.setSelection({
				line: curCursor.line, 
				ch: 0
			}, {
				line: curCursor.line, 
				ch: options.cm.getLine(curCursor.line).length
			});
		},
		// inlineFormat
		inlineFormat: function( params )
		{
			// remove
			if( options.fn.hasFormat(params.format) !== false )
			{
				// get selection
				var sel = options.cm.getSelection(), repSel;
				// define replacement logic
				if( params.format === 'em' )
				{
					 re = {
						 '_': new RegExp("(^|[^_])(\\_|\\_{3})([^_]+)(\\_|\\_{3})([^_]|$)", "g"),
						 '*': new RegExp("(^|[^*])(\\*|\\*{3})([^*]+)(\\*|\\*{3})([^*]|$)", "g"),
						 'use': false,
						 'length': 1
					 };
				}
				else if ( params.format === 'strong' )
				{
				 re = {
					 '_': new RegExp("(^|[^_])(\_{2,3})([^_]+)(\\_{2,3})([^_]|$)", "g"),
					 '*': new RegExp("(^|[^*])(\\*{2,3})([^*]+)(\\*{2,3})([^*]|$)", "g"),
					 'use': false,
					 'length':2
				 };
				}
				// do replacement magic
				if( sel.search(re['_']) !== -1 )
				{
					re.use = '_';
				}
				else if( sel.search(re['*']) !== -1 )
				{
					re.use = '*';
				}
				// grab word
				else
				{
					// select whole word
					options.fn.getWordBoundaries(true);
					sel = options.cm.getSelection();
					// try replacing again
					if( sel.search(re['_']) !== -1 )
					{
						re.use = '_';
					}
					else if( sel.search(re['*']) !== -1 )
					{
						re.use = '*';
					}
				}
				if( re.use !== false )
				{
					repSel = sel.replace(re[re.use], function(matches, m1,m2,m3,m4,m5){
						return m1+m2.substr(re.length)+m3+m4.substr(re.length)+m5;
					});
					options.cm.replaceSelection(repSel);
				}
			}
			// add
			else
			{
				var sel = options.cm.getSelection();
				if( sel.trim().length > 0)
				{
					options.cm.replaceSelection( params.indicator[0]+sel+params.indicator[0] );
				}
				// only a carat is set, no selection
				else
				{
					if( options.fn.inWord() )
					{
						options.fn.getWordBoundaries(true);
						options.cm.replaceSelection(params.indicator[0]+options.cm.getSelection()+params.indicator[0]);
					}
				}
			}
		},
		// check for formatting
		hasFormat: function(format)
		{
			var block = ["header", "quote", "code"], isBlock = false,
				 inline = ["strong", "em", "link"], isInline = false,
				 pos;
			// if inline 
			if( inline.indexOf(format) !== -1 )
			{
				isInline = true;
				// set selection to middle of selection
				pos = options.fn.getMiddlePos(false);
			}
			else{ 
				isBlock = true; 
				pos = options.fn.getLineEndPos();
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
		},
		// get last position of selection
		getLastPos: function( setPos )
		{
			var pos = {
				line: options.cm.getCursor(false).line, 
				ch: options.cm.getCursor(false).ch
			};
			// set selection to position
			if( setPos === true )
			{
				options.cm.setSelection({
					line: pos.line, 
					ch: pos.ch
				});
			}
			// return pos object
			return pos;
		},
		// get last position of selection
		getLineEndPos: function( setPos )
		{
			var pos = { line: options.cm.getCursor(true).line };
				 pos.ch = options.cm.getLine(pos.line).length;
			// set selection to position
			if( setPos === true )
			{
				options.cm.setSelection({
					line: pos.line, 
					ch: pos.ch
				});
			}
			// return pos object
			return pos;
		},
		// getWordBoundaries: get the bundaries of a word
		getWordBoundaries: function(setSelection)
		{
			// get cursor position
			var curCursor = options.cm.getCursor(true);
			// get line
			var line = options.cm.getLine(curCursor.line);
			// get boundries
			var right = false, left = false, i = 0;
			// left
			while( left === false  )
			{
				i++;
				if( line.substring((curCursor.ch-i),curCursor.ch-(i-1)) == ' ' || curCursor.ch-i <= 0)
				{
					left = i;
				}
			}
			i = 0;
			// right
			while( right === false  )
			{
				i++;
				if( /[\.\s,:;?\!]/.test(line.substring((curCursor.ch+i-1),curCursor.ch+(i))) || curCursor.ch+i >= line.length)
				{
					right = i;
				}
			}
			// set selection
			if( typeof(setSelection) != undefined && setSelection != null && setSelection != false  )
			{
				options.cm.setSelection({
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
		},
		// getMiddlePos: get the middle of a given range
		getMiddlePos: function(setPos)
		{
			var sel = options.cm.getSelection(),
				 curCursor = options.cm.getCursor(true),
				 chNum = curCursor.ch + Math.floor(sel.length/2);
			// set middle
			if( typeof(setPos) != undefined && setPos != null && setPos != false && sel.length > 0 )
			{
				options.cm.setSelection({
					line: curCursor.line, 
					ch: chNum
				}, {
					line: curCursor.line, 
					ch: chNum
				});	
			}
			// return middle position
			return { line: curCursor.line , ch: chNum }
		},
		// check if carat is inside a word
		inWord: function()
		{
			var curCursor = {
				start: options.cm.getCursor(true),
				end: options.cm.getCursor(false)
			};
			// set selection for inWord 
			options.cm.setSelection({
				line: curCursor.start.line, 
				ch: curCursor.start.ch-1
			}, {
				line: curCursor.end.line, 
				ch: curCursor.end.ch+1
			});
			var tmpSel = options.cm.getSelection();
			// reset selection
			options.cm.setSelection({
				line: curCursor.start.line, 
				ch: curCursor.start.ch
			}, {
				line: curCursor.end.line, 
				ch: curCursor.end.ch
			});
			// check if in word
			if( tmpSel.trim().length >= 2 && tmpSel.substring(1,2).trim().length > 0 )
			{
				return true;
			}
			return false;
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
		},
		hasClass: function(el, classname)
		{
			if( el.classList.contains(classname) )
			{
				return true;
			}
			return false;
		}
	}
};
/* ------------------ */
//
/* functions */
//
// EditOptions fn: 
//
var f, editOptions = function()
{
	// get element
	var panel = document.getElementById('editOptions');
	// clear timeout
	window.clearTimeout(f);
	// check for selection
	if( options.cm.getSelection().length > 0 )
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
				panel.innerHTML = '<div data-class="strong" data-format="strong" class="strong button">B</div>'+
										'<div data-class="em" data-format="em" class="em button">i</div>'+
										'<div data-class="header1" data-format="header" data-parameters=\'{"level":1}\' class="header1 button">H1</div>'+
										'<div data-class="header2" data-format="header" data-parameters=\'{"level":2}\' class="header2 button">H2</div>'+
										'<div data-class="quote" data-format="quote" data-parameters=\'{"level":1}\' class="quote button"></div>';
				// add panel to editor
				options.cm.addWidget({line:0,ch:0},panel);
				// select elements
				panel = document.getElementById('editOptions');
				// add events			
				panel.addEventListener("click", function(e) 
				{
					// run function
					var params = e.target.getAttribute("data-parameters");
					if( e.target.getAttribute("data-format") === "quote" && ( options.ffn.hasClass(panel, "quote-1") || options.ffn.hasClass(panel, "quote-2")) )
					{
						params = '{"level":2}';
					}
					
					options.fn.toggleFormat(e.target.getAttribute("data-format"), JSON.parse( params )); /// !!!!!!!!!! NEEDS PARAMETERS AS JSON IF PRESENT
					panel.classList.toggle(e.target.getAttribute("data-class"));
					// set focus
					options.cm.focus();
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
				start:options.cm.getCursor(true),
				end:options.cm.getCursor(false)
			};
			// get coords
			var coords = {
				start: options.cm.charCoords({line:cursor.start.line, ch: cursor.start.ch}),
				end: options.cm.charCoords({line:cursor.end.line, ch: cursor.end.ch})
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
		styleSelectedText: false,
		styleActiveLine: true,
		placeholder: "",
      tabMode: 'indent',
		tabindex: "2",
		dragDrop: false,
		extraKeys: {
			"Enter": "newlineAndIndentContinueMarkdownList",
			"Cmd-B": function(){
				options.fn.inlineFormat({'format':'strong'});
			},
			"Ctrl-B": function(){
				console.log(options.fn.getMiddlePos(true));
			},
			"Cmd-I": function(){
				options.fn.inlineFormat({'format':'em'});
			},
			"Ctrl-I": function(){
				options.fn.toggleFormat('quote', {"level":2});
			}
		}
	});
	// add edit Options	
	options.cm.on("cursorActivity", function(){
		editOptions();
		// options.fn.inlineFormat({'format':'em'});
						// console.log( '##'+options.cm.getSelection().match( /(?:^|[^_*])_*([*](?:[*]{2})*)?[^*_]+\1_*(?:[^*_]|$)/gm )+'##' );
	});
	
});
