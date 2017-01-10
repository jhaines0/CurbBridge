
var curbAccessToken;
var curbRefreshToken;

var profileLink;
var profile;


function getCurbToken()
{
    document.getElementById("curbProgress").innerHTML = "Logging in to Curb";

    var form = document.getElementById("curbLoginForm");
    
    var url = "https://app.energycurb.com/oauth2/token";
    
    
    var formData = new FormData();
    
    formData.append("grant_type", "password");
    for (var i = 0; i < form.length ;i++)
    {
        formData.append(form.elements[i].name, form.elements[i].value);
    }

    
    var req = new XMLHttpRequest();
    
    req.open('POST', url, true);
    
    req.setRequestHeader("Authorization", "Basic " + btoa("s1dfl7jbxov5pth1rxzsc0fl480zz6rwg4uo6bu0gzu1t89393csjwps6g5lsgcx:8dpdzm2a6mcyg3xocfqvfrajfin6yajjdoqmhj77ynvksmyaqw6rpvppn5srde6d"));
    
    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Response from Curb: " + req.response);
                
                curbAccessToken = JSON.parse(req.response).access_token;
                curbRefreshToken = JSON.parse(req.response).refresh_token;
                
                console.log("Curb Access Token: " + curbAccessToken);
                console.log("Curb Refresh Token: " + curbRefreshToken);
                
                getCurbProfile();
            }
            else
            {
                alert("Something went wrong");
            }
        }
    };
    
    req.send(formData);
}

function getCurbProfile()
{
    document.getElementById("curbProgress").innerHTML = "Requesting Curb Profile";
    
    var url = "https://app.energycurb.com/api";

    var req = new XMLHttpRequest();
    
    req.open('GET', url, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Curb API Entry Response: " + req.response);
                
                profileLink = JSON.parse(req.response)._links.profiles.href;
                console.log("Curb Profile: " + profileLink);
                
                getCurbMetadata();
            }
            else
            {
                alert("Something went wrong");
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + btoa(curbAccessToken));
    
    req.send(null);
}

function getCurbMetadata()
{
    document.getElementById("curbProgress").innerHTML = "Requesting Curb Metadata";
    
    var url = "https://app.energycurb.com";

    var req = new XMLHttpRequest();
    
    req.open('GET', url + profileLink, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Curb Profile: " + req.response);
                
                profile = JSON.parse(req.response);
                
                sendDataToST("metadata",req.response);
                
                connectCurb();
            }
            else
            {
                alert("Something went wrong");
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + btoa(curbAccessToken));
    
    req.send(null);
}


function connectCurb()
{
    document.getElementById("curbProgress").innerHTML = "Subscribing to streaming data";
    
    // Extract fields from profile
    var parser = document.createElement('a');
    parser.href = profile._embedded.profiles[0].real_time[0]._links.ws.href;

    console.log("Link Hostname: " + parser.hostname);
    console.log("Link Username: " + parser.username);
    console.log("Link Password: " + parser.password);

    // Create a client instance
    client = new Paho.MQTT.Client(parser.hostname, 443, "clientId");

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({onSuccess:onConnect, onFailure:onFailure, userName:parser.username, password:parser.password, useSSL:true});
}

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  
  var topic = profile._embedded.profiles[0].real_time[0].topic;
  console.log("Subscribing to " + topic);
  
  client.subscribe(topic,{onSuccess:onSubscribe, onFailure:onSubscribeFailure});
}

function onSubscribe(responseObject)
{
  console.log("onSubscribe");
}

function onSubscribeFailure(responseObject)
{
  console.log("onSubscribeFailure: " + responseObject.errorMessage);
}

function onFailure(responseObject) {
  console.log("onFailure: "+responseObject.errorMessage);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost: "+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived: "+message.payloadString);
  
  ts = JSON.parse(message.payloadString).ts;
  
  document.getElementById("curbProgress").innerHTML = "Data Streaming: " + ts;
  
  sendDataToST("data",message.payloadString);
}
