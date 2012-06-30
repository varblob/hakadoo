$(document).ready(function() {
    you = CodeMirror.fromTextArea(document.getElementById("user_code"), {
        lineNumbers: true,
        matchBrackets: true
    }),
    them = CodeMirror.fromTextArea(document.getElementById("opponent_code"), {
        lineNumbers: true,
        matchBrackets: true
    });

    //pad timer with zeros
    var lpad = function(value, padding) {
        var zeroes = "0";

        for (var i = 0; i < padding; i++) { zeroes += "0"; }

        return (zeroes + value).slice(padding * -1);
    }
    var remaining, elapsed = 0, limit = 300; //amount of time in seconds
    var timer = setInterval(function() {
        elapsed++;
        remaining = limit-elapsed;
        $("#timer").html(function() { //display time
            return Math.floor(remaining/60)+":"+lpad(remaining-(Math.floor(remaining/60)*60),2);
        });
        if (remaining == 0) { //timer finished
            clearInterval(timer);
            alert("timer finished");
        }
    }, 1000);

    // Disable Cut, Copy and Paste in the Code Mirror
    $(".CodeMirror*").live("cut copy paste", function(e) {
        e.preventDefault();
    });
    
	$.hakadoo.remote();
});
