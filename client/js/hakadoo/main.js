$(document).ready(function() {
    you = CodeMirror.fromTextArea(document.getElementById("user_code"), {
        lineNumbers: true,
        matchBrackets: true
    }),
    them = CodeMirror.fromTextArea(document.getElementById("opponent_code"), {
        lineNumbers: true,
        matchBrackets: true
    });
    
    // Disable Cut, Copy and Paste in the Code Mirror
    $(".CodeMirror*").live("cut copy paste", function(e) {
        e.preventDefault();
    });
    
	$.hakadoo.remote();
});
