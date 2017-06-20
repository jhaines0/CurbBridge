
function getAuthorizationCode() {
    var clientID = document.getElementById("clientIdForm").elements["client_id"].value;
    
    var text = "https://graph.api.smartthings.com/oauth/authorize";
    text += "?client_id=" + clientID;
    text += "&response_type=code";
    text += "&scope=app";
    text += "&redirect_uri=http://localhost:8000/authSuccess.html";
    
    console.log("Making window for: " + text);
    
    document.getElementById("stIframe").src = text
    document.getElementById("stIframe").hidden = false;
}

