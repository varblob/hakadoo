$(document).ready(function() {
    you = CodeMirror.fromTextArea(document.getElementById("user_code"), {
        lineNumbers: true,
        matchBrackets: true
    }),
    them = CodeMirror.fromTextArea(document.getElementById("opponent_code"), {
        lineNumbers: true,
        matchBrackets: true
    });
	$.hakadoo.remote();
});
