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
                    cm.replaceSelection( params.indicator[0]+sel+params.indicator[0], 'around' );
                    endCursor.ch += params.indicator[0].length*2;
                }
            }
            // only a carat is set, no selection
            else
            {
                if( _inWord(cm) )
                {
                    _getWordBoundaries(cm, true);
                    cm.replaceSelection(params.indicator[0]+cm.getSelection()+params.indicator[0],'around');
                    curCursor.ch += params.indicator[0].length;
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
                    cm.replaceSelection(new Array( params.level + 1 ).join( params.indicator[0] )+' ');
                }
                else
                {
                    cm.replaceSelection( sel.substr(level + (sel.substr(level,level+1) === ' ' ? 1 : 0) ) + new Array( params.level + 1 ).join( params.indicator[0] )+' ');
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
        var block = {'header':['#'], 'quote':['>'], 'code':['`']};
        var inline = {'strong':['**'], 'em':['_'], 'link':['']};
        params = (params === undefined || params === null) ? {} : params;
        params.format = format;
        // if inline
        if( format === 'strong' || format === 'em' )
        {
            params.indicator = inline[format];
            _inlineFormat(cm, params);
        }
        else if( format === 'link' )
        {
            params.indicator = inline[format];
            _inlineFormat(cm, params);
        }
        // if block
        if( format === 'header' || format === 'quote' )
        {
            params.indicator = block[format];
            _blockFormatFront(cm, params);
        }
        else if( format === 'code' )
        {
            // needs to be implemented
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
	          panelHtml += '<div data-class="strong" data-format="strong" class="strong mark-button"><svg viewBox="0 0 16 20" class="mark-icon shape-strong">'+
	                        '<path d="M7.531,1.032c2.544,0,6.112,0.367,6.112,4.59c0,2.623-1.679,3.462-2.676,3.961 c1.233,0.341,3.279,1.311,3.279,4.328c0,4.381-3.121,5.089-6.505,5.089h-6.19C1.105,19,1,18.895,1,18.449v-1.416 c0-0.472,0.105-0.551,0.551-0.551h1.338V3.55H1.551C1.105,3.55,1,3.472,1,2.999V1.583c0-0.472,0.105-0.551,0.551-0.551H7.531z M7.243,8.455c1.548,0,2.859-0.393,2.859-2.466c0-1.652-1.128-2.203-2.571-2.203H6.43v4.669H7.243z M7.374,16.246 c1.81,0,3.331-0.315,3.331-2.544c0-2.203-1.521-2.492-3.279-2.492H6.43v5.036H7.374z"/></svg></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('em') === -1 )
	        {
	              panelHtml += '<div data-class="em" data-format="em" class="em mark-button"><svg viewBox="0 0 9 20" class="mark-icon shape-em">'+
	                            '<path d="M1.138,16.813c0.057-0.286,0.145-0.665,0.262-1.136l1.266-4.905c0.016-0.074,0.031-0.147,0.043-0.221 c0.012-0.074,0.017-0.142,0.016-0.207C2.715,9.967,2.265,9.278,1.633,9.266l0.113-2.022C2.273,7.194,5.285,6.705,5.767,6.66 c0,0,1.209-0.193,1.081,0.208c-0.128,0.4-1.879,7.608-1.879,7.608c-0.167,0.693-0.28,1.173-0.337,1.441 c-0.043,0.213-0.093,0.346-0.149,0.654c-0.036,0.199,0,0.598,0.556,0.598c0.285-0.007,0.326-0.027,0.915-0.027 c0.57-0.048,0.102,0.944-0.373,1.423c-0.781,0.79-1.626,1.196-2.536,1.218c-0.514,0.012-0.98-0.135-1.397-0.441 c-0.416-0.307-0.632-0.786-0.648-1.438C0.994,17.675,1.04,17.311,1.138,16.813z M7.382,0.643c0.376,0.358,0.57,0.799,0.582,1.322 c0.013,0.523-0.16,0.975-0.518,1.355C7.088,3.701,6.648,3.898,6.125,3.91C5.602,3.923,5.15,3.748,4.769,3.385 c-0.38-0.363-0.577-0.806-0.59-1.329C4.167,1.534,4.342,1.084,4.704,0.708s0.805-0.57,1.329-0.583 C6.557,0.113,7.006,0.285,7.382,0.643z"/></svg></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('header') === -1 )
	        {
	              panelHtml += '<div data-class="header1" data-format="header" data-parameters=\'{"level":1}\' class="header1 mark-button"><svg viewBox="0 0 30 20" class="mark-icon shape-h1">'+
	                            '<g><path d="M16,5.496V16.33l1.992,0.768l-0.264,1.704H11.24L11,17.098l2.016-0.744L13,12H6v4.354l2,0.744l-0.24,1.704 H1.288l-0.264-1.704l1.992-0.744V5.496L1,4.704L1.24,3h6.568L8,4.704L6,5.496v4.729h7.016V5.496L11,4.704L11.24,3h6.537 l0.24,0.704L16,5.496z"/><polygon points="25.835,16.577 25.835,5.726 24.1,5.726 20,6.645 20.372,8.645 23,8.645 23,16.573 20.655,16.985 21,19 27.763,19 28.138,17.012"/></g>'+
                                '</svg></div>'+
	                            '<div data-class="header2" data-format="header" data-parameters=\'{"level":2}\' class="header2 mark-button"><svg viewBox="0 0 30 20" class="mark-icon shape-h2">'+
	              	            '<g><path d="M16,5.496V16.33l1.992,0.768l-0.264,1.704H11.24L11,17.098l2.016-0.744L13,12H6v4.354l2,0.744l-0.24,1.704 H1.288l-0.264-1.704l1.992-0.744V5.496L1,4.704L1.24,3h6.568L8,4.704L6,5.496v4.729h7.016V5.496L11,4.704L11.24,3h6.537 l0.24,1.704L16,5.496z"/> <path d="M25.685,17h-3.423c0.362-0.576,1.713-1.893,2.533-2.528c1.653-1.278,3.711-2.867,3.711-5.508 c0-1.9-1.318-3.818-4.263-3.818c-1.195,0-2.54,0.313-3.69,0.859l-0.168,0.08v3.12l1.854,0.36l0.645-2.127 c0.372-0.142,0.904-0.206,1.298-0.206c0.706,0,1.667,0.508,1.667,1.509c0,1.716-1.841,2.954-3.151,4.264 C21.372,14.332,20,15.704,20,17.633V19l8-0.011v-3.153l-1.564-0.347L25.685,17z"/></g>'+
                                '</svg></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('quote') === -1 )
	        {
	              panelHtml += '<div data-class="quote" data-format="quote" data-parameters=\'{"level":1}\' class="quote mark-button"><svg viewBox="0 0 25 20" class="mark-icon shape-quote">'+
	                            '<g><path class="quote-part-1" d="M2.822,7.114C1.613,9.056,1,10.908,1,12.617c0,1.726,0.466,3.185,1.386,4.336 c0.939,1.176,2.211,1.773,3.78,1.773c1.422,0,2.531-0.441,3.298-1.312c0.756-0.857,1.139-1.853,1.139-2.959 c0-1.229-0.342-2.255-1.017-3.048c-0.688-0.812-1.577-1.224-2.642-1.224c-0.202,0-0.578,0.036-1.184,0.113 c-0.298-0.009-0.452-0.076-0.576-0.208C5.072,9.96,5.02,9.789,5.02,9.554c0-1.012,0.608-2.141,1.808-3.354 C7.53,5.483,8.64,4.577,10.124,3.51l0.256-0.185L9.498,1.672L9.183,1.836C6.169,3.398,4.029,5.174,2.822,7.114z"/> <path class="quote-part-2" d="M15.332,7.113c-1.209,1.942-1.822,3.793-1.822,5.503c0,1.726,0.466,3.185,1.386,4.337 c0.939,1.176,2.211,1.773,3.78,1.773c1.421,0,2.531-0.441,3.298-1.312c0.755-0.858,1.139-1.854,1.139-2.959 c0-1.23-0.342-2.256-1.017-3.049c-0.689-0.812-1.578-1.223-2.643-1.223c-0.205,0-0.581,0.036-1.183,0.113 c-0.305-0.009-0.462-0.079-0.584-0.218C17.582,9.96,17.53,9.788,17.53,9.553c0-1.012,0.608-2.14,1.808-3.354 c0.702-0.717,1.812-1.623,3.296-2.69l0.256-0.185l-0.882-1.653l-0.316,0.164C18.68,3.397,16.54,5.173,15.332,7.113z"/></g></svg></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('link') === -1 )
	        {
	          panelHtml += '<div data-class="link" data-format="link" class="link mark-button"><svg viewBox="0 0 24 20" class="mark-icon shape-link">'+
	                        '<g><path d="M20.84,1.901l-0.494-0.493C19.438,0.5,18.227,0,16.936,0s-2.502,0.5-3.409,1.408L9.169,5.766 c-1.88,1.88-1.88,4.938,0.001,6.819l0.494,0.493c0.021,0.021,0.044,0.039,0.065,0.059l1.659-1.659 c-0.022-0.021-0.048-0.035-0.069-0.057l-0.494-0.493c-0.967-0.967-0.967-2.541,0-3.507l4.358-4.358 c0.465-0.466,1.088-0.722,1.753-0.722c0.665,0,1.288,0.257,1.755,0.723l0.494,0.493c0.967,0.967,0.967,2.541,0,3.507L16.81,9.44 c0.091,0.429,0.141,0.87,0.141,1.319c0,0.793-0.15,1.562-0.428,2.279L20.84,8.72C22.72,6.841,22.72,3.783,20.84,1.901z"/> <path d="M14.079,7.35l-1.656,1.656c0.466,0.465,0.722,1.088,0.722,1.753c0,0.665-0.257,1.288-0.722,1.754 l-2.556,2.556L8.065,16.87c-0.466,0.465-1.088,0.722-1.754,0.722c-0.665,0-1.288-0.256-1.754-0.723l-0.494-0.493 c-0.465-0.466-0.722-1.088-0.722-1.754c0-0.665,0.256-1.288,0.722-1.753l2.377-2.377C6.185,9.299,6.28,8.046,6.725,6.896 l-4.317,4.317C1.5,12.121,1,13.332,1,14.622c0,1.291,0.5,2.502,1.409,3.41l0.494,0.493c0.907,0.908,2.118,1.408,3.409,1.408 c1.291,0,2.502-0.5,3.41-1.408l2.622-2.622l1.736-1.736c0.908-0.908,1.408-2.119,1.408-3.41S14.986,8.258,14.079,7.35z"/></g></svg></div>';
	        }
	        if( cm.options.excludePanel === undefined || cm.options.excludePanel.indexOf('code') === -1 )
	        {
	          panelHtml += '<div data-class="code" data-format="code" data-parameters=\'{"level":1}\' class="code mark-button"><svg viewBox="0 0 23 20" class="mark-icon shape-code">'+
	                        '<g><path class="code-part-1" d="M6.345,1.999C5.939,2,5.434,2.287,5.224,2.638L1.159,9.422c-0.211,0.351-0.212,0.927-0.004,1.279l3.9,6.605 c0.208,0.352,0.711,0.641,1.117,0.641h1.619c0.406,0,0.579-0.295,0.383-0.654l-3.601-6.622c-0.196-0.36-0.196-0.949-0.001-1.309 l3.626-6.71c0.195-0.36,0.021-0.655-0.385-0.654L6.345,1.999z"/><path class="code-part-2" d="M14.401,1.999c0.406,0,0.911,0.288,1.121,0.639l4.065,6.784c0.211,0.351,0.212,0.927,0.004,1.279l-3.9,6.605 c-0.208,0.352-0.711,0.641-1.117,0.641h-1.619c-0.406,0-0.579-0.295-0.383-0.654l3.601-6.622c0.196-0.36,0.196-0.949,0.001-1.309 l-3.626-6.71c-0.195-0.36-0.021-0.655,0.385-0.654L14.401,1.999z"/></g></svg></div>';
	        }
	        // add items to panel
	        panel.innerHTML = panelHtml;
					// add panel to editor
					cm.addWidget({line:0,ch:0},panel);
					// select elements
					panel = editor.getElementsByClassName('edit-options')[0];
					// add events
					panel.addEventListener('click', function(e)
					{
						// run function
						var params = e.target.getAttribute('data-parameters');
						if( e.target.getAttribute('data-format') === 'quote' && ( panel.classList.contains('quote-1') || panel.classList.contains('quote-2')) )
						{
							params = '{"level":2}';
						}
						else if( e.target.getAttribute('data-format') === 'code' && ( panel.classList.contains('code-1') || panel.classList.contains('code-2')) )
						{
							params = '{"level":2}';
						}
						_toggleFormat(cm, e.target.getAttribute('data-format'), JSON.parse( params ));
						panel.classList.toggle(e.target.getAttribute('data-class'));
						// set focus
						cm.focus();
					});
				}
				// check which elements are active
				// normal elements
                ['strong','em','link'].forEach(function(item){
                    if(_hasFormat(cm, item)){
                        panel.classList.add(item);
                    }
                    else {
                        panel.classList.remove(item);
                    }
                });
                // elements for multi-level icons
                ['quote'].forEach(function(item){
                    if(_hasFormat(cm, item) === 1){
                        panel.classList.add(item+'-1');
                    }
                    else {
                        panel.classList.remove(item+'-1');
                    }
                    if(_hasFormat(cm, item) === 2){
                        panel.classList.add(item+'-2');
                    }
                    else {
                        panel.classList.remove(item+'-2');
                    }
                });
                ['header'].forEach(function(item){
                    if(_hasFormat(cm, item) === 1){
                        panel.classList.add(item+'1');
                    }
                    else {
                        panel.classList.remove(item+'1');
                    }
                    if(_hasFormat(cm, item) === 2){
                        panel.classList.add(item+'2');
                    }
                    else {
                        panel.classList.remove(item+'2');
                    }
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
            // remove selection
            editor.setCursor({ch: editor.getCursor(true).ch,line: editor.getCursor(true).line});
            // hide panel
            var cmPanel = editor.display.wrapper.querySelector('.edit-options');
            if( cmPanel !== undefined ){
                cmPanel.classList.remove('active');
            }
		});
	};
	return mark;
	//
}));
