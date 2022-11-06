var flag_speech = 0;

// #region SPEECH RECOGNITION
// Speech recognition starts when window is loaded
window.onload = function () {
    vr_function();
}

function vr_function() {
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;

    // Settings for voice recognition
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'en';
    recognition.interimResults = true;
    recognition.continuous = true;
    var recog_text = '';

    // Translation settings
    var trans_sourcelang = 'en';
    var trans_destlang = 'pt-BR';

    var gs_key = getParam('gs_key');
    var TRANS_URL = 'https://script.google.com/macros/s/' + gs_key + '/exec';
    var query = ''

    // Events, official documentation at https://developer.mozilla.org/fr/docs/Web/API/SpeechRecognition#event_handlers
    recognition.onsoundstart = function () {
        // document.getElementById('status').innerHTML = "Listening";
    };
    recognition.onspeechstart = function () {
        // document.getElementById('status').innerHTML = "Listening";
    };
    recognition.onnomatch = function () {
        // document.getElementById('status').innerHTML = "Please try again";
    };
    recognition.onerror = function () {
        // document.getElementById('status').innerHTML = "Error";
        vr_function();
    };
    recognition.onsoundend = function () {
        // document.getElementById('status').innerHTML = "Stopping";
        recognition.stop()
        vr_function();
    };
    recognition.onspeechend = function () {
        // document.getElementById('status').innerHTML = "Stopping";
        recognition.stop()
        vr_function();
    };

    
    // URL parameters
    arg_recog = getParam('recog');
    arg_trans = getParam('trans');

    // Language setting
    if (arg_recog != null) {
        recognition.lang = arg_recog;
        trans_sourcelang = recognition.lang;
    }
    if (arg_trans != null) {
        trans_destlang = arg_trans;
    }

    if (trans_sourcelang == trans_destlang) {
        alert("ERROR! Please set different language between recog and trans!\nYou set both [" + trans_sourcelang + "]!");
    }

    // API settings
    var request = new XMLHttpRequest();

    // When the recognition result is returned
    recognition.onresult = function (event) {
        var results = event.results;
        for (var i = event.resultIndex; i < results.length; i++) {
            if (results[i].isFinal) {
                recog_text = results[i][0].transcript;

                if (gs_key != null) {
                    query = TRANS_URL + '?text=' + recog_text + '&source=' + trans_sourcelang + '&target=' + trans_destlang;
                    request.open('GET', query, true);

                    request.onreadystatechange = function () {
                        if (request.readyState === 4 && request.status === 200) {
                            document.getElementById('translated-text').innerHTML = request.responseText;
                        }
                        vr_function();
                    }
                    request.send(null);
                } else {
                    document.getElementById('speech-text').innerHTML = recog_text;
                    vr_function();
                }
            }
            else {
                document.getElementById('speech-text').innerHTML = "<< " + results[i][0].transcript + " >>";
                flag_speech = 1;
            }
        }
    }
    flag_speech = 0;
    recognition.start();
}
// #endregion

// #region PARAMETERS PROCESSING
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
// #endregion