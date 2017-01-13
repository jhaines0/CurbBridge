
function getAuthorizationCode() {
    document.getElementById("stProgress").innerHTML = "Authorizing with Smartthings";
    
    var x = document.getElementById("clientIdForm");
    var text = x.action;
    
    var clientID = x.elements[0].value;
    
    text += "?client_id=" + clientID;
        
    text += "&response_type=code";
    text += "&scope=app";
    text += "&redirect_uri=http://localhost:8000/authSuccess.html";
    
    console.log("Making window for: " + text);
    
    document.getElementById("stIframe").src = text
    document.getElementById("stIframe").hidden = false;
}

