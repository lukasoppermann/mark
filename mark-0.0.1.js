var editor = ace.edit("mark");
editor.renderer.setShowGutter(true);
editor.setShowPrintMargin(false);
editor.getSession().setUseWrapMode(true);

editor.setTheme("ace/theme/mark");
editor.getSession().setMode("ace/mode/markdown");