;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.mark = factory();
  }
}(this, function() { // jshint ignore:line
    /* ------------------------------
     *
     * get last position of selection
     *
     */
    // var _getLastPos = function( cm, setPos )
    // {
    //     var pos = {
    //         line: cm.getCursor(false).line,
    //         ch: cm.getCursor(false).ch
    //     };
    //     // set selection to position
    //     if( setPos === true )
    //     {
    //         cm.setSelection({
    //             line: pos.line,
    //             ch: pos.ch
    //         });
    //     }
    //     // return pos object
    //     return pos;
    // };
    /* ------------------------------
     *
     * get last position of selection
     *
     */
    var _getLineEndPos = function( cm, setPos )
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
     };
     /* ------------------------------
      *
      * getWordBoundaries: get the bundaries of a word
      *
      */
     var _getWordBoundaries = function(cm, setSelection, char)
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
             if( line.substring((curCursor.ch-i),curCursor.ch-(i-1)) === indicator )
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
             else if( char.end !== undefined && line.substring((curCursor.ch-i),curCursor.ch-(i-1)) === char.end)
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
             if( (indicator === ' ' && /[\.,:;?\!]\s/.test(line.substring((endCursor.ch+i-1),endCursor.ch+i+1 ))) || line.substring((endCursor.ch+i-1),endCursor.ch+(i)) === indicator )
             {
                 right = i;
                 if( char.include === undefined || char.include === false )
                 {
                     right--;
                 }
                 else if( indicator === ' ' && /[\.,:;?\!]\s/.test(line.substring((endCursor.ch+i-1),endCursor.ch+i+1 )) )
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
             else if( char.start !== char.end && char.start !== undefined && line.substring((endCursor.ch+i),endCursor.ch+(i+1)) === char.start)
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
     };
    /* ------------------------------
     *
     * check if carat is inside a word
     *
     */
    var _inWord = function(cm)
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
    };
    /* ------------------------------
     *
     * getMiddlePos: get the middle of a given range
     *
     */
    var _getMiddlePos = function(cm, setPos)
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
    };
    /* ------------------------------
     *
     * check for formatting
     *
     */
    var _hasFormat = function(cm, format)
    {
        var block = ['header', 'quote', 'code'];
        var isBlock = false;
        var inline = ['strong', 'em', 'link'];
        var isInline = false;
        var pos;
        // if inline
        if( inline.indexOf(format) !== -1 )
        {
            isInline = true;
            // set selection to middle of selection
            pos = _getMiddlePos(cm, false);
        }
        else if( block.indexOf(format) !== -1){
            isBlock = true;
            pos = _getLineEndPos(cm);
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
    };
    /* ------------------------------
     *
     * set inline format
     *
     */
    var _inlineFormat = function( cm, params )
    {
        var sel = cm.getSelection(),
        curCursor = cm.getCursor(true),
        endCursor = cm.getCursor(false),
        selAdd = 0;
        // remove
        if( _hasFormat(cm, params.format) !== false )
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
                    selAdd = params.indicator.length;
                }
                else if( sel.search(re['*']) !== -1 )
                {
                    re.use = '*';
                    selAdd = params.indicator.length;
                }
                // grab word
                else
                {
                    // select whole word
                    _getWordBoundaries(cm, true);
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
                            curCursor.ch -= params.indicator.length;
                            endCursor.ch -= params.indicator.length;
                        }
                        else
                        {
                            curCursor.ch -= params.indicator.length;
                        }
                    }
                }
                if( re.use !== false )
                {
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
                if( _getWordBoundaries(cm, true, { start:'[', end: ')', include: true, endLine: false }) )
                {
                    // remove link in []
                    cm.setCursor({line:cm.getCursor(true).line, ch:cm.getCursor(true).ch+1});
                    _getWordBoundaries(cm, true, { start:'[', end: ']', include: true, endLine: false });
                    sel = cm.getSelection();
                    cm.replaceSelection( sel.substring(1,sel.length-1),'around');
                    var selection = {
                        start:{line:cm.getCursor(true).line, ch:cm.getCursor(true).ch},
                        end:{line:cm.getCursor(false).line, ch:cm.getCursor(false).ch}
                    };
                    // remove link in ()
                    cm.setCursor({line:cm.getCursor(false).line, ch:cm.getCursor(false).ch+1});
                    _getWordBoundaries(cm, true, {
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
                else if( _getWordBoundaries(cm, true, { start:'<', end: '>', include: true, endLine: false }) )
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
                    _getWordBoundaries(cm, true,{
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
                if( params.format === 'link' )
                {
                    cm.replaceSelection( '['+sel+'](http://)','around');
                    setTimeout(function () {
                        cm.setCursor({line:endCursor.line,ch:cm.getCursor(false).ch-1});
                    }, 10);

                }
                else
                {
                    cm.replaceSelection( params.indicator+sel+params.indicator, 'around' );
                    endCursor.ch += params.indicator.length*2;
                }
            }
            // only a carat is set, no selection
            else
            {
                if( _inWord(cm) )
                {
                    _getWordBoundaries(cm, true);
                    cm.replaceSelection(params.indicator+cm.getSelection()+params.indicator,'around');
                    curCursor.ch += params.indicator.length;
                    endCursor.ch = curCursor.ch;
                }
            }
        }
    };
    /* ------------------------------
     *
     * set block format
     *
     */
    var _blockFormatFront = function( cm, params )
    {
        var level = _hasFormat(cm, params.format);
        var curCursor = cm.getCursor(true);
        var endCursor = cm.getCursor(false);
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
                if( sel.substr(0,1) !== params.indicator)
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
                    cm.replaceSelection(new Array( params.level + 1 ).join( params.indicator )+' ');
                }
                else
                {

                    cm.replaceSelection( sel.substr(level + (sel.substr(level,level+1) === ' ' ? 1 : 0) ) + new Array( level + 2 ).join( params.indicator )+' ');
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

            cm.replaceSelection(new Array( (params.minLevel || 1) + 1 ).join( params.indicator )+' ');
        }
        // restore position
        cm.setSelection({
            line: curCursor.line,
            ch: 0
        }, {
            line: endCursor.line,
            ch: _getLineEndPos(cm, false).ch
        });
    };
    /* ------------------------------
     *
     * stoggle a format
     *
     */
    var _toggleFormat = function(cm, format, params)
    {
        var formats = {
            'header':{
                'format': 'header',
                'indicator': '#',
                'level': 6,
                'minLevel': 2,
                'fn': _blockFormatFront
            },
            'quote':{
                'format': 'quote',
                'level': 2,
                'indicator': '>',
                'fn': _blockFormatFront
            },
            'strong':{
                'format': 'strong',
                'indicator': '**',
                'fn': _inlineFormat
            },
            'em':{
                'format': 'em',
                'indicator': '_',
                'fn': _inlineFormat
            },
            'link':{
                'format': 'link',
                'indicator': '',
                'fn': _inlineFormat
            }
        };
        // check if format exists
        if(formats.hasOwnProperty(format)){
            formats[format].fn(cm, formats[format]);
        }
    };
	/* ------------------ */
	//
	/* functions */
	var cms = [];
    var f;
    var editOptions = function(cm)
	{
		// get element
		var editor = cm.display.wrapper;
        var panel = editor.getElementsByClassName('edit-options')[0];
		// clear timeout
		window.clearTimeout(f);
		// check for selection
		if( cm.getSelection().length > 0)
		{
			// ------------------------------
			// start timeout
			f = window.setTimeout(function()
			{
				// check for element
				if( panel === undefined || panel === null )
				{
					// create element
					panel = document.createElement('div');
					panel.className += 'edit-options';
	        // add button
	        var panelHtml = '<div class="panel-arrow"></div>';
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('strong') === -1 )
	        {
	          panelHtml += '<div data-class="strong" data-format="strong" class="strong mark-button"></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('em') === -1 )
	        {
	              panelHtml += '<div data-class="em" data-format="em" class="em mark-button"></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('header') === -1 )
	        {
	              panelHtml += '<div data-class="header" data-format="header" class="header mark-button"></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('quote') === -1 )
	        {
	              panelHtml += '<div data-class="quote" data-format="quote" class="quote mark-button"></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('link') === -1 )
	        {
	          panelHtml += '<div data-class="link" data-format="link" class="link mark-button"></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('code') === -1 )
	        {
	          panelHtml += '<div data-class="code" data-format="code" data-parameters=\'{"level":1}\' class="code mark-button"></div>';
	        }
	        // add items to panel
	        panel.innerHTML = panelHtml;
				// add panel to editor
				cm.addWidget({line:0,ch:0},panel);
				// select elements
				panel = editor.getElementsByClassName('edit-options')[0];
				// add events
				panel.addEventListener('click', function(e){
					// run function
					_toggleFormat(cm, e.target.getAttribute('data-format'));
					// set focus
					cm.focus();
				});
			}
				// check which elements are active
				// normal elements
                ['strong','em','link','quote', 'header'].forEach(function(item){
                    if(_hasFormat(cm, item) !== false){
                        panel.querySelector('.'+item).classList.add('is-active');
                    }
                    else {
                        panel.querySelector('.'+item).classList.remove('is-active');
                    }
                    panel.querySelector('.'+item).setAttribute('data-level',_hasFormat(cm, item));
                });
				// ------------------------------
				// get cursor
				var cursor = {
					start:cm.getCursor(true),
					end:cm.getCursor(false)
				};
				// get coords
				var coords = {
					start: cm.charCoords({line:cursor.start.line, ch: cursor.start.ch},'local'),
					end: cm.charCoords({line:cursor.end.line, ch: cursor.end.ch},'local')
				};
				// add active class
				panel.classList.add('active');
				// ------------------------------
				// calculate top
				var panelHeight = parseInt(window.getComputedStyle(panel).height.replace('px','')),
						arrowHeight = panelHeight*0.18,
	          top = (coords.start.top-arrowHeight-panelHeight);
	      	// remove class
				panel.classList.remove('from-top');
				if( top < 0 ){
					top = (coords.end.bottom+arrowHeight);
					panel.classList.add('from-top');
				}
				panel.style.top = top+'px';
				// ------------------------------
				// calculate horizontal position
				var middle = coords.start.left+((coords.end.left-coords.start.left)/2),
						panelWidth = parseInt(window.getComputedStyle(panel).width.replace('px','')),
						left = Math.floor(middle-(panelWidth/2)),
						editorWidth = parseInt(window.getComputedStyle(editor.getElementsByClassName('CodeMirror-sizer')[0]).width.replace('px',''));
				// remove classes
				panel.classList.remove('from-left');
				panel.classList.remove('from-right');
				if( left < 1 ){
					left = 4;
					panel.classList.add('from-left');
				}
				else if( parseInt(left + panelWidth) >= editorWidth )
				{
					left = (editorWidth - panelWidth) - 6;
					panel.classList.add('from-right');
				}
				// set position
				panel.style.left = left+'px';
				// set arrow pos
				var leftPos = (coords.start.left-left+(coords.end.left-coords.start.left)/2);
				panel.getElementsByClassName('panel-arrow')[0].style.left = (leftPos > 12 ? leftPos : 12)+'px';
			// close timeout
			}, 200);
		}
		else
		{
			window.setTimeout(function()
			{
				if( panel !== undefined && panel !== null )
				{
					panel.classList.remove('active');
				}
			}, 100);
		}
	};
	// --------------------------
	// mark
	var mark = function( editor )
	{
        editor.setOption("extraKeys", {
            'Enter': 'newlineAndIndentContinueMarkdownList',
            'Cmd-B': function(){
                _toggleFormat(editor,'strong');
            },
            'Ctrl-B': function(){
                _toggleFormat(editor,'strong');
            },
            'Cmd-I': function(){
                _toggleFormat(editor,'em');
            },
            'Ctrl-I': function(){
                _toggleFormat(editor,'em');
            }
        });
    	// add edit Options
		editor.on('cursorActivity', function(){
			editOptions(editor);
		});
		// blur
		editor.on('blur', function(){
            editor.timeout = window.setTimeout(function(){
                // remove selection
                editor.setCursor({ch: editor.getCursor(true).ch,line: editor.getCursor(true).line});
                // hide panel
                var cmPanel = editor.display.wrapper.querySelector('.edit-options');
                if( cmPanel !== undefined ){
                    cmPanel.classList.remove('active');
                }
            },750)
		});
        // blur
		editor.on('focus', function(){
            window.clearTimeout(editor.timeout);
        });
	};
	return mark;
	//
}));
