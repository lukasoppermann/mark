nodeList = document.getElementsByClassName('mark');

Array.prototype.slice.call(nodeList,0).forEach(function(editor){
	var myCodeMirror = CodeMirror.fromTextArea(editor, {
	  // value: "function myScript(){return 100;}\n",
		mode: {
			name: "gfm",
			highlightFormatting: true
		},
		lineNumbers: true,
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
		extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
		theme: "mark",
	});
});

