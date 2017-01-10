
var accessToken;
var stEndpoint;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getAccessToken(authCode, clientID, clientSecret)
{
    var url = "https://graph.api.smartthings.com/oauth/token";
    var content = "grant_type=authorization_code";
    url += "&redirect_uri=http://localhost:8000";
    url += "&client_id=" + clientID;
    url += "&client_secret=" + clientSecret;
    url += "&code=" + authCode;
    

    console.log("Sending request to: " + url);
    
    var req = new XMLHttpRequest();
    
    req.open('POST', url, true);
    req.setRequestHeader("content-type","application/x-www-form-urlencoded");

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Request info: " + Object.getOwnPropertyNames(req));
                console.log("Response from ST: " + req.responseText);
                
                accessToken = JSON.parse(req.responseText).access_token;
                console.log("Access Token: " + accessToken);
                getEndpoints();
            }
            else
            {
                console.log("Something went wrong: " + req.status);
            }
        }
    };
    
    req.send(content);
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
                console.log("Endpoint Response from ST: " + req.response);
                
                stEndpoint = JSON.parse(req.response)[0].uri;
                console.log("ST Endpoint: " + stEndpoint);
            }
            else
            {
                alert("Something went wrong");
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
