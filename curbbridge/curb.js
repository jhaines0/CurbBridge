
var curbAccessToken;
var curbRefreshToken;

var profileLink;
var profile;

var historical;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var FormData = require('form-data');
var btoa = require('btoa');
var mqtt = require('mqtt');

var smartThings;

function getCurbToken(username, password, st, accessTokenCb)
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
                                
                                accessTokenCb(curbAccessToken);
                                
                                getCurbProfile();
                            });
                        }
                        else
                        {
                            console.log("Something Went Wrong while submitting form data to Curb");
                            if(err) throw err;
                        }
                    });
}

function useCurbToken(token, st)
{
    curbAccessToken = token;
    smartThings = st;
    getCurbProfile();
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
                console.log("Something went wrong while getting curb profile");
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
                //getCurbHistoricalMeta();
            }
            else
            {
                console.log("Something went wrong while getting curb metadata");
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + btoa(curbAccessToken));
    
    req.send(null);
}

function getCurbHistoricalMeta()
{
    console.log("Requesting Curb Historical Metadata");
    
    var url = "https://app.energycurb.com";

    var req = new XMLHttpRequest();
    
    var historicalLink = profile._embedded.profiles[0]._links.historical.href;
    
    req.open('GET', url + historicalLink, true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                //console.log("Curb Historical: " + req.responseText);
                
                historical = JSON.parse(req.responseText);
                
                getCurbHistorical();
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


function getCurbHistorical()
{
    console.log("Requesting Curb Historical Data");
    
    var url = "https://app.energycurb.com";

    var req = new XMLHttpRequest();
    
    var link = historical._links.minutes.href;
    
    var now = Math.floor(Date.now() / 1000);
    
    var since = now - 60*60;// Start of window
    var until = now;// End of window
    
    req.open('GET', url + link + "&since=" + since + "&until=" + until + "&unit=w", true);

    req.onreadystatechange = function (e)
    {
        if (req.readyState == 4)
        {
            if(req.status == 200)
            {
                console.log("Curb Historical Data: " + req.responseText);
                
                connectCurb();
            }
            else
            {
                console.log("Something went wrong: " + req.responseText);
            }
        }
    };
    
    req.setRequestHeader("Authorization","Bearer " + btoa(curbAccessToken));
    
    req.send(null);
}


function connectCurb()
{
    console.log("Subscribing to streaming data");
    
    profile._embedded.profiles[0].real_time.forEach(
        function(rt)
        {
            var topic = rt.topic;
            
            var client  = mqtt.connect(rt._links.ws.href);
         
            var prefix = rt.prefix;
         
            client.on('connect', function ()
            {
                console.log("Connected, subscribing to " + topic);
                client.subscribe(topic)
            })
             
            client.on('message', function (topic, message)
            {
                //console.log(message.toString())
                
                var parsedMessage = JSON.parse(message.toString());
                parsedMessage.prefix = prefix;

                var reconstitutedMessage = JSON.stringify(parsedMessage);
                console.log("Sending: " + reconstitutedMessage);
                
                smartThings.send("data", reconstitutedMessage);
            })
        }
    );
    

}


module.exports.connect = getCurbToken;
module.exports.reconnect = useCurbToken;

