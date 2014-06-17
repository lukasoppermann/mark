(function(window, document, define, undefined){
	// --------------------------
	// POLYFILLS
	if (!String.prototype.trim) {
	  String.prototype.trim = function () {
	    return this.replace(/^\s+|\s+$/gm, '');
	  };
	}
	/* ------------------ */
	// options object that holds all settings
	var options = {
		fn: {
			// format
			toggleFormat: function(cm, format, params)
	    {
				var block = {'header':['#'], 'quote':['>'], 'code':['`']},
	          inline = {'strong':['**'], 'em':['_'], 'link':['']};
	      params = (params === undefined || params === null) ? {} : params;
				params.format = format;
	      // if inline
				if( format === 'strong' || format === 'em' )
				{
					params.indicator = inline[format];
					options.fn.inlineFormat(cm, params);
				}
				else if( format === 'link' )
				{
					params.indicator = inline[format];
					options.fn.inlineFormat(cm, params);
				}
				// if block
				if( format === 'header' || format === 'quote' )
				{
					params.indicator = block[format];
					options.fn.blockFormatFront(cm, params);
				}
				else if( format === 'code' )
				{
					// needs to be implemented
				}
			},
			// blockFormatFront
			blockFormatFront: function( cm, params )
			{
				var level = options.fn.hasFormat(cm, params.format),
	          curCursor = cm.getCursor(true),
	          endCursor = cm.getCursor(false);
				// trim line
				cm.setSelection({
					line: curCursor.line,
					ch: 0
				}, {
					line: endCursor.line,
					ch:  cm.getLine(endCursor.line).length
				});
				cm.replaceSelection(cm.getSelection().trim());
				
				if( level !== false && typeof(level) === 'number' )
				{					
					cm.setSelection({
						line: curCursor.line,
						ch: 0
					}, {
						line: curCursor.line,
						ch: parseInt(level)+1
					});
					var sel = cm.getSelection();
					// remove format
					if( level === params.level )
					{
						cm.replaceSelection( sel.substr(params.level + (sel.substr(level) == ' ' ? 1 : 0) ) );
					}
					// change format
					else if( level > params.level)
					{
						cm.replaceSelection( sel.substr(level - params.level));
					}
					// level < params.level (means adding depth to format)
					else
					{
						if( sel.substr(0,1) != params.indicator)
						{
							// needes reselect
							cm.setSelection({
								line: curCursor.line,
								ch: 0
							}, {
								line: curCursor.line,
								ch: 0
							});
							sel = cm.getSelection();
							// replace empty selection
							cm.replaceSelection(new Array( params.level + 1 ).join( params.indicator[0] )+' ');
						}
						else
						{
							cm.replaceSelection( sel.substr(level + (sel.substr(level,level+1) == ' ' ? 1 : 0) ) + new Array( params.level + 1 ).join( params.indicator[0] )+' ');	
						}
					}
				}
				// add format
				else
				{
					cm.setSelection({
						line: curCursor.line,
						ch: 0
					}, {
						line: curCursor.line,
						ch: 0
					});
					// add indicator
					cm.replaceSelection(new Array( params.level + 1 ).join( params.indicator[0] )+' ');
				}
	      // restore position
				cm.setSelection({
					line: curCursor.line,
					ch: 0
				}, {
					line: endCursor.line,
					ch: options.fn.getLineEndPos(cm, false).ch
				});
			},
			// inlineFormat
			inlineFormat: function( cm, params )
			{
	      var sel = cm.getSelection(),
	      curCursor = cm.getCursor(true),
	      endCursor = cm.getCursor(false),
	      selAdd = 0;
	      // remove
				if( options.fn.hasFormat(cm, params.format) !== false )
				{
					if( params.format === 'em' || params.format === 'strong' )
					{
		        var repSel, re;
						// define replacement logic
						if( params.format === 'em' )
						{
		          re = {
		            '_': new RegExp('(^|[^_])(\\_|\\_{3})([^_]+)(\\_|\\_{3})([^_]|$)', 'g'),
		            '*': new RegExp('(^|[^*])(\\*|\\*{3})([^*]+)(\\*|\\*{3})([^*]|$)', 'g'),
		            'use': false,
		            'length': 1
		          };
						}
						else if ( params.format === 'strong' )
						{
		          re = {
		            '_': new RegExp('(^|[^_])(_{2,3})([^_]+)(\\_{2,3})([^_]|$)', 'g'),
		            '*': new RegExp('(^|[^*])(\\*{2,3})([^*]+)(\\*{2,3})([^*]|$)', 'g'),
		            'use': false,
		            'length':2
		          };
						}
						// do replacement magic
						if( sel.search(re._) !== -1 )
						{
							re.use = '_';
		          selAdd = params.indicator[0].length;
						}
						else if( sel.search(re['*']) !== -1 )
						{
							re.use = '*';
		          selAdd = params.indicator[0].length;
						}
						// grab word
						else
						{
							// select whole word
							options.fn.getWordBoundaries(cm, true);
							sel = cm.getSelection();
							// try replacing again
							if( sel.search(re._) !== -1 ||  sel.search(re['*']) !== -1 )
							{
								re.use = '*';
								if( sel.search(re._) !== -1 )
								{
									re.use = '_';
								}
								if( endCursor.ch-curCursor.ch > 0 )
								{
		            	curCursor.ch -= params.indicator[0].length;
		            	endCursor.ch -= params.indicator[0].length;
								}
								else
								{
									curCursor.ch -= params.indicator[0].length;
								}
							}
						}
						if( re.use !== false )
						{
		          //
							repSel = sel.replace(re[re.use], function(matches, m1,m2,m3,m4,m5){
								return m1+m2.substr(re.length)+m3+m4.substr(re.length)+m5;
							});
		          cm.replaceSelection(repSel);
		          // reset selection if needed
		          if( selAdd !== 0 )
		          {
		            endCursor.ch -= selAdd*2;
		          }
						}
		        // restore position
		        cm.setSelection({
		          line: curCursor.line,
		          ch: curCursor.ch
		        }, {
		          line: endCursor.line,
		          ch: endCursor.ch
		        });
					}
					else if( params.format === 'link' )
					{
						if( options.fn.getWordBoundaries(cm, true, { start:'[', end: ')', include: true, endLine: false }) )
						{
							// remove link in []
							cm.setCursor({line:cm.getCursor(true).line, ch:cm.getCursor(true).ch+1});
							options.fn.getWordBoundaries(cm, true, { start:'[', end: ']', include: true, endLine: false });
							sel = cm.getSelection();
							cm.replaceSelection( sel.substring(1,sel.length-1),'around');
							var selection = {
								start:{line:cm.getCursor(true).line, ch:cm.getCursor(true).ch},
								end:{line:cm.getCursor(false).line, ch:cm.getCursor(false).ch}
							};
							// remove link in ()
							cm.setCursor({line:cm.getCursor(false).line, ch:cm.getCursor(false).ch+1});
							options.fn.getWordBoundaries(cm, true, {
								start:'(',
								end: ')',
								include: true,
								endLine: false
							});
							sel = cm.getSelection();
							cm.replaceSelection( '','around');
							// reset selection
							setTimeout(function () {
								cm.setSelection(selection.start, selection.end);
							}, 10);
						}
						else if( options.fn.getWordBoundaries(cm, true, { start:'<', end: '>', include: true, endLine: false }) )
						{
							sel = cm.getSelection();
							sel = sel.substring(1,sel.length-1);
							cm.replaceSelection( sel,'around');
							// reset selection
							setTimeout(function () {
								cm.setSelection({line:endCursor.line,ch:cm.getCursor(true).ch}, {line:endCursor.line,ch:cm.getCursor(false).ch});
							}, 10);
						}
						else
						{
							options.fn.getWordBoundaries(cm, true,{
								start:' ',
								end: ' ',
								include: false,
								endLine: true
							});
							sel = cm.getSelection();
							//
							if(sel.substr(0,4) === 'www.' || sel.substr(0,7) === 'http://' || sel.substr(0,8) === 'https://')
							{
								if(sel.substr(0,4) === 'www.')
								{
									sel = 'http://'+sel;
								}
								cm.replaceSelection( '[link]('+sel+')','around');
								// reset selection
								setTimeout(function () {
									cm.setSelection({line:endCursor.line,ch:cm.getCursor(true).ch+1}, {line:endCursor.line,ch:cm.getCursor(true).ch+5});
								}, 10);
							}
						}
					}
	      }
				// add
				else
				{
					if( sel.trim().length > 0)
					{
						if( params.format == 'link' )
						{
							cm.replaceSelection( '['+sel+'](http://)','around');
							setTimeout(function () {
								cm.setCursor({line:endCursor.line,ch:cm.getCursor(false).ch-1});
							}, 10);

						}
						else
						{
							cm.replaceSelection( params.indicator[0]+sel+params.indicator[0], 'around' );
	          	endCursor.ch += params.indicator[0].length*2;
						}
					}
					// only a carat is set, no selection
					else
					{
						if( options.fn.inWord(cm) )
						{
							options.fn.getWordBoundaries(cm, true);
							cm.replaceSelection(params.indicator[0]+cm.getSelection()+params.indicator[0],'around');
	            curCursor.ch += params.indicator[0].length;
	            endCursor.ch = curCursor.ch;
						}
					}
				}
	    },
			// check for formatting
			hasFormat: function(cm, format)
			{
				var block = ['header', 'quote', 'code'], isBlock = false,
	          inline = ['strong', 'em', 'link'], isInline = false,
	          pos;
				// if inline
				if( inline.indexOf(format) !== -1 )
				{
					isInline = true;
					// set selection to middle of selection
					pos = options.fn.getMiddlePos(cm, false);
				}
				else if( block.indexOf(format) !== -1){
					isBlock = true;
					pos = options.fn.getLineEndPos(cm);
				}
				// check if any type is present
				var type = cm.getTokenTypeAt({
					line: pos.line,
					ch: pos.ch
				});
				var match = false;
				if( type !== null )
				{
					if( isInline === true )
					{
						if(new RegExp(format).test(type) || (format === 'link' && new RegExp('string').test(type)) )
						{
							match = true;
						}
					}
					else if( isBlock === true && type !== undefined )
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
			getLastPos: function( cm, setPos )
			{
				var pos = {
					line: cm.getCursor(false).line,
					ch: cm.getCursor(false).ch
				};
				// set selection to position
				if( setPos === true )
				{
					cm.setSelection({
						line: pos.line,
						ch: pos.ch
					});
				}
				// return pos object
				return pos;
			},
			// get last position of selection
			getLineEndPos: function( cm, setPos )
			{
				var pos = { line: cm.getCursor(true).line };
	      pos.ch = cm.getLine(pos.line).length;
				// set selection to position
				if( setPos === true )
				{
					cm.setSelection({
						line: pos.line,
						ch: pos.ch
					});
				}
				// return pos object
				return pos;
			},
			// getWordBoundaries: get the bundaries of a word
			getWordBoundaries: function(cm, setSelection, char)
			{
				// TODO: Fix only accept .,;: as end if a space is following
				char === undefined ? char = ' ' : '';
				// get cursor position
				var curCursor = cm.getCursor(true);
				var endCursor = cm.getCursor(false);
				// get line
				var line = cm.getLine(curCursor.line);
				// get boundries
				var right = undefined, left = undefined, i = 0;
				// left
				var indicator = typeof(char) === 'string' ? char : char.start;
				while( left === undefined  )
				{
					if( line.substring((curCursor.ch-i),curCursor.ch-(i-1)) == indicator )
					{
						left = i;
						if( char.include === undefined || char.include === false )
						{
							left--;
						}
					}
					else if( curCursor.ch-i < 0 )
					{
						if( char.endLine === undefined || char.endLine === true )
						{
							left = i;
						}
						else
						{
							left = false;
						}
					}
					else if( char.end !== undefined && line.substring((curCursor.ch-i),curCursor.ch-(i-1)) == char.end)
					{
						left = false;
					}
					i++;
				}
				i = 0;
				indicator = typeof(char) === 'string' ? char : char.end;
				// right
				while( right === undefined  )
				{
					///[\.\s,:;?\!]/
					if( (indicator === " " && /[\.,:;?\!]\s/.test(line.substring((endCursor.ch+i-1),endCursor.ch+i+1 ))) || line.substring((endCursor.ch+i-1),endCursor.ch+(i)) == indicator )
					{
						right = i;
						if( char.include === undefined || char.include === false )
						{
							right--;
						}
						else if( indicator === " " && /[\.,:;?\!]\s/.test(line.substring((endCursor.ch+i-1),endCursor.ch+i+1 )) )
						{
							right--;
						}
					}
					else if( endCursor.ch+i > line.length )
					{
						if( char.endLine === undefined || char.endLine === true )
						{
							right = i;
						}
						else
						{
							right = false;
						}
					}
					else if( char.start != char.end && char.start !== undefined && line.substring((endCursor.ch+i),endCursor.ch+(i+1)) == char.start)
					{
						right = false;
					}
					i++;
				}
				// check right and left
				right === undefined ? right = 0 : '';
				left === undefined ? left = 0 : '';
				// set selection
				if( typeof(setSelection) !== undefined && setSelection !== null && setSelection !== false && left !== false && right !== false)
				{
					cm.setSelection({
						line: curCursor.line,
						ch: parseInt(curCursor.ch)-parseInt(left)
					}, {
						line: curCursor.line,
						ch: parseInt(endCursor.ch)+parseInt(right)
					});
				}
				if( left !== false && right !== false )
				{
					// return word boundaries
					return [{ line: curCursor.line, ch: curCursor.ch-left },
		              { line: curCursor.line, ch: curCursor.ch+right }];
				}
				return false;
			},
			// getMiddlePos: get the middle of a given range
			getMiddlePos: function(cm, setPos)
			{
				var sel = cm.getSelection(),
	          curCursor = cm.getCursor(true),
	          chNum = curCursor.ch + Math.floor(sel.length/2);
				// set middle
				if( typeof(setPos) !== undefined && setPos !== null && setPos !== false && sel.length > 0 )
				{
					cm.setSelection({
						line: curCursor.line,
						ch: chNum
					}, {
						line: curCursor.line,
						ch: chNum
					});
				}
				// return middle position
				return { line: curCursor.line , ch: chNum };
			},
			// check if carat is inside a word
			inWord: function(cm)
			{
				var curCursor = {
					start: cm.getCursor(true),
					end: cm.getCursor(false)
				};
				// set selection for inWord
				cm.setSelection({
					line: curCursor.start.line,
					ch: curCursor.start.ch-1
				}, {
					line: curCursor.end.line,
					ch: curCursor.end.ch+1
				});
				var tmpSel = cm.getSelection();
				// reset selection
				cm.setSelection({
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
		}
	},
	// --------------------------
	// define mark
	mark = function( selector, opts ){
		if( selector !== undefined ){
			// define selection and editors if undefined
			mark.selection = [];
			// return markl object with fns
			return mark.init(selector, opts);
		}
	};
	// chain fns to mark object
	mark.chain = function( )
	{
		// add fns to array
		for (var key in mark.fn) {
			if (mark.fn.hasOwnProperty(key) && isNaN(key))
			mark.selection[key] = mark.fn[key];
		}
		// return selection
		return mark.selection;
	};
	// define editors
	mark.editors = [];
	// add version
	mark.version = '0.9.1';
	// --------------------------
	// export mark
	if ( typeof define === "function" && define.amd ) {
		define(
			[
			'engine/engine','codemirror/lib/codemirror','engine/functions/each','engine/functions/addclass','engine/functions/removeclass','engine/functions/hasclass','mark/plugins/panel','codemirror/mode/xml/xml','codemirror/mode/markdown/markdown','codemirror/mode/gfm/gfm','codemirror/mode/javascript/javascript','codemirror/mode/css/css','codemirror/mode/htmlmixed/htmlmixed','codemirror/addon/fold/markdown-fold','codemirror/addon/fold/xml-fold','codemirror/addon/edit/continuelist','codemirror/addon/edit/matchbrackets', 'codemirror/addon/edit/closebrackets', 'codemirror/addon/edit/matchtags','codemirror/addon/edit/trailingspace','codemirror/addon/edit/closetag','codemirror/addon/display/placeholder','codemirror/addon/mode/overlay'
			], function(_, CodeMirror){
			// set codemirror
			mark.codemirror = CodeMirror;
			// expose mark
			return mark;
		});
	}
	else
	{
		// set codemirror
		mark.codemirror = CodeMirror;
		// expose mark
		window.mark = mark;
	}
	// --------------------------
	// extend mark
	mark.init = function( selector, opts )
	{
		_(selector).each(function(editor)
		{
			var id = editor.getAttribute('data-editorid');
			if( id !== undefined && mark.editors[id] !== undefined )
			{
				mark.selection.push(mark.editors[id])
			}
			else
			{
				id = mark.editors.length;
				// init editor
				var newEditor = mark.codemirror.fromTextArea(editor, _.extend(
				{
					theme: "mark",
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
					// excludePanel: ['code'],
					tabMode: 'indent',
					tabindex: "2",
					dragDrop: false,
					extraKeys: {
						"Enter": "newlineAndIndentContinueMarkdownList",
						"Cmd-B": function(){
							options.fn.toggleFormat(mark.editors[id],'strong');
						},
						"Ctrl-B": function(){
							options.fn.toggleFormat(mark.editors[id],'strong');
						},
						"Cmd-I": function(){
							options.fn.toggleFormat(mark.editors[id],'em');
						},
						"Ctrl-I": function(){
							options.fn.toggleFormat(mark.editors[id],'em');
						}
					}
				},opts));
				// add edit Options
				newEditor.on("cursorActivity", function(){
					editOptions(newEditor, options);
				});
				// blur
				newEditor.on("focus", function(){
					mark.editors.forEach(function(cmEditor){
						if( cmEditor.length !== 0 && cmEditor.display.wrapper !== newEditor.display.wrapper )
						{
							// remove selection
							cmEditor.setCursor({ch: cmEditor.getCursor(true).ch,line: cmEditor.getCursor(true).line});
							// hide panel
							var cmPanel = cmEditor.display.wrapper.getElementsByClassName('edit-options')[0];
							if( cmPanel !== undefined ){
								cmPanel.classList.remove('active');
							}
						}
					});
				});
				//
				mark.editors.push(newEditor);
				editor.setAttribute('data-editorid', id);
				mark.selection.push(newEditor);
			}
		});
		
		return mark.chain();
	};
	// additional function
	mark.fn = mark.prototype = {
		// get plain content of editor
		get: function(){
			var output = [];
			this.forEach(function(editor){
				var id = editor.getTextArea().getAttribute('data-editorid');
				output[id] = mark.editors[id].getValue();
			});
			return output;
		}
	};
	//
}(window, window.document, window.define, undefined));
