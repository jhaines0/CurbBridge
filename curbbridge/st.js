
var accessToken;
var stEndpoint;

var onConnect = function(){console.log("Default onConnect");};
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getAccessToken(authCode, clientID, clientSecret, onConnectCb)
{
    onConnect = onConnectCb;

    var url = "https://graph.api.smartthings.com/oauth/token";
    url += "?grant_type=authorization_code";
    url += "&redirect_uri=http://localhost:8000/authSuccess.html";
    url += "&client_id=" + clientID;
    url += "&code=" + authCode;
    url += "&client_secret=" + clientSecret;

    console.log("Sending request to: " + url);
    
    var req = new XMLHttpRequest();
    
    req.open('GET', url, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Response from ST: " + req.responseText);
                
                accessToken = JSON.parse(req.responseText).access_token;
                console.log("Access Token: " + accessToken);
                getEndpoints();
            }
            else
            {
                console.log("Something went wrong: ", req.status);
                console.log("Response: " + req.responseText);
            }
        }
    };
    
    req.send(null);
}


function getEndpoints()
{
    console.log("Getting Endpoints");
    
    var url = "https://graph.api.smartthings.com/api/smartapps/endpoints";

    var req = new XMLHttpRequest();
    
    req.open('GET', url, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Endpoint Response from ST: " + req.responseText);
                
                stEndpoint = JSON.parse(req.responseText)[0].uri;
                console.log("ST Endpoint: " + stEndpoint);
                
                onConnect();
            }
            else
            {
                console.log("Something went wrong: " + req.status);
                console.log("Response: " + req.responseText);
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + accessToken);
    
    req.send(null);
}


function sendDataToST(endpoint, data)
{
    var req = new XMLHttpRequest();
    
    req.open('PUT', stEndpoint+"/"+endpoint, true);

    req.setRequestHeader("Authorization","Bearer " + accessToken);
    
    req.send(data);
}

module.exports.connect = getAccessToken;
module.exports.send = sendDataToST;

