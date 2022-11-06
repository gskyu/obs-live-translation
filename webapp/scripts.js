// #region SPEECH RECOGNITION
const defaultSourceLangage = "fr-FR"
const defaultTargetLangage = "en-US"

const sourceLangageParameterName = "source-langage"
const targetLangageParameterName = "target-langage"
const googleScriptDeploymentIdParameterName = "google-script-deployment-id"

// Lookup right lib.
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
var sourceLangage = getQueryParameterValue(sourceLangageParameterName) || defaultSourceLangage;
var targetLangage = getQueryParameterValue(targetLangageParameterName) || defaultTargetLangage; 

// Speech recognition starts when window is loaded
window.onload = function () {
    setupSpeechRecognition();
}

function setupSpeechRecognition() {
    // Settings for voice recognition
    var recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.lang = sourceLangage;

    // Events, official documentation at https://developer.mozilla.org/fr/docs/Web/API/SpeechRecognition#event_handlers
    recognition.onend = function(event) {
        recognition.start();
    }
    recognition.onerror = function () { 
        recognition.stop();
    };
    recognition.onspeechend = () => { 
        recognition.stop();
    };
    recognition.onsoundend = () => { 
        recognition.stop();
    };
    recognition.onresult = function(event) {
        translateSpeechText(
            event, 
            sourceLangage, 
            targetLangage, 
            getQueryParameterValue(googleScriptDeploymentIdParameterName) || undefined);
    };
    recognition.start();
}

function translateSpeechText(event, sourceLangage, targetLangage, googleScriptDeploymentId) {
    if (googleScriptDeploymentId == undefined) {
        throw new InvalidOperationException("googleScriptDeploymentId parameters should not be undefined, please provide a value to parameter named google-script-deployment-id.")
    }
    var results = event.results;
    for (var i = event.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
            var googleScriptUri = 'https://script.google.com/macros/s/' + googleScriptDeploymentId + '/exec'
            var query = googleScriptUri + '?text=' + results[i][0].transcript + '&source=' + sourceLangage + '&target=' + targetLangage;

            var request = new XMLHttpRequest();
            request.open('GET', query, true);

            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    document.getElementById('translated-text').innerHTML = request.responseText;
                }
            }
            request.send(null);
        }
        else {
            document.getElementById('speech-text').innerHTML = "<< " + results[i][0].transcript + " >>";
        }
    }
}
// #endregion

// #region PARAMETERS PROCESSING
function getQueryParameterValue(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
// #endregion