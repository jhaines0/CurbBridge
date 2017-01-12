
var curbAccessToken;
var curbRefreshToken;

var profileLink;
var profile;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var FormData = require('form-data');
var btoa = require('btoa');
var mqtt = require('mqtt');

var smartThings;

function getCurbToken(username, password, st)
{
    smartThings = st;
    console.log("Logging in to Curb");

    var url = "https://app.energycurb.com/oauth2/token";
    var formData = new FormData();
    
    var response = "";
    
    formData.append("grant_type", "password");
    formData.append("username", username);
    formData.append("password", password);
    
    
    formData.submit({
                        host: 'app.energycurb.com',
                        protocol: 'https:',
                        path: '/oauth2/token',
                        headers: {"Authorization" : "Basic " + btoa("s1dfl7jbxov5pth1rxzsc0fl480zz6rwg4uo6bu0gzu1t89393csjwps6g5lsgcx:8dpdzm2a6mcyg3xocfqvfrajfin6yajjdoqmhj77ynvksmyaqw6rpvppn5srde6d")}
                    },
                    function(err, res)
                    {
                        if(res && res.statusCode == 200)
                        {
                            res.on('data', (chunk) =>
                            {
                                response += chunk;
                            });
                            res.on('end', () =>
                            {
                                //console.log("Response: " + response);
                                
                                curbAccessToken = JSON.parse(response).access_token;
                                curbRefreshToken = JSON.parse(response).refresh_token;
                                
                                console.log("Curb Access Token: " + curbAccessToken);
                                console.log("Curb Refresh Token: " + curbRefreshToken);
                                
                                getCurbProfile();
                            });
                        }
                        else
                        {
                            console.log("Something Went Wrong...");
                        }
                    });
}

function getCurbProfile()
{
    console.log("Requesting Curb Profile");
    
    var url = "https://app.energycurb.com/api";

    var req = new XMLHttpRequest();
    
    req.open('GET', url, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Curb API Entry Response: " + req.responseText);
                
                profileLink = JSON.parse(req.responseText)._links.profiles.href;
                console.log("Curb Profile: " + profileLink);
                
                getCurbMetadata();
            }
            else
            {
                console.log("Something went wrong");
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + btoa(curbAccessToken));
    
    req.send(null);
}

function getCurbMetadata()
{
    console.log("Requesting Curb Metadata");
    
    var url = "https://app.energycurb.com";

    var req = new XMLHttpRequest();
    
    req.open('GET', url + profileLink, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Curb Profile: " + req.responseText);
                
                profile = JSON.parse(req.responseText);
                
                smartThings.send("metadata",req.responseText);
                
                connectCurb();
            }
            else
            {
                console.log("Something went wrong");
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + btoa(curbAccessToken));
    
    req.send(null);
}


function connectCurb()
{
    console.log("Subscribing to streaming data");
    
    var topic = profile._embedded.profiles[0].real_time[0].topic;
    
    var client  = mqtt.connect(profile._embedded.profiles[0].real_time[0]._links.ws.href);
 
    client.on('connect', function ()
    {
        console.log("Connected");
        client.subscribe(topic)
    })
     
    client.on('message', function (topic, message)
    {
        console.log(message.toString())
        smartThings.send("data", message.toString());
    })
}


module.exports.connect = getCurbToken;

