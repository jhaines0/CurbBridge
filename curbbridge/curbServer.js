var http = require('http');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var url = require('url');

var st = require('./st');
var curb = require('./curb');

var stAuthCode;

var server = http.createServer(function (request, response)
{

    if(request.method == "GET")
    {
        console.log("Get: " + request.url);
        
        var parsedRequest = url.parse(request.url,true);
        
        if(parsedRequest.pathname == "/authSuccess.html")
        {
            stAuthCode = parsedRequest.query.code;
            console.log("Got ST Auth Code: " + stAuthCode);
        }
        
        var filePath = '.' + parsedRequest.pathname;
        if (filePath == './') filePath = './index.html';

        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname)
        {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;      
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }

        fs.readFile(filePath, function(error, content)
        {
            if(error)
            {
                response.writeHead(501);
                response.end('Something went wrong: '+error.code+' ..\n');
                response.end(); 
            }
            else
            {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
            
    }
    else if(request.method == "POST")
    {
        console.log("Post");
        
        var body = '';
        
        request.on('data', function (data)
        {
            body += data;
        });
        
        request.on('end', function ()
        {
            //console.log("Body: " + body);
            
            var userInfo = qs.parse(body);
            
            //console.log("Client ID: " + userInfo.client_id);
            //console.log("Client Secret: " + userInfo.client_secret);
            //console.log("Username: "+ userInfo.username);
            //console.log("Password: " + userInfo.password);
            
            var onConnect = function()
            {
                console.log("Curb onConnect");
                curb.connect(userInfo.username, userInfo.password, st);
            }
            
            st.connect(stAuthCode, userInfo.client_id, userInfo.client_secret, onConnect);
            
        });
        
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("Got it");
        response.end();
    }
    
});

server.listen(8000);
console.log("Server running at http://127.0.0.1:8000/");
