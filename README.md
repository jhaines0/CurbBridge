# Options
This repository contains two options for integration between SmartThings and Curb.  Option 1 (Curb Connect) is preferred.  It operates entirely in the SmartThings cloud and is very easy to set up.  Option 2 (CurbBridge) was the original version which requires a standalone server running node.js.  It is kept here for reference.  The only reason to use CurbBridge is if you absolutely must have usage data at 1 second intervals.  The Curb Connect version is limited to 4 seconds, with 1 minute as the default.

You must not install both SmartApps in the same SmartThings location.

# Curb Connect
Direct connection between the SmartThings cloud and the Curb cloud.

This integration adds a new power meter in SmartThings for each sensor on your Curb.

## Installation
- Publish both the Curb (Connect) SmartApp and CurPowerMeter DeviceHandler to your account.  Either copy-paste into the IDE or use the GitHub integration.
- Use the SmartThings mobile app to add the Curb (Connect) SmartApp.
- During installation you will see a link "Click to enter Curb credentials", click it and log in with the credentials you use to access your Curb account.
- After logging in, click "Done"
- You will be directed to a page that says "You are connected to Curb".  Click "Done" again.
- You should now see a new device for each of your curb sensors.
- You may not see updates immediately after installation.  Wait five minutes for the ST scheduler to catch up after initial installation.

## Notes
- The default sample rate updates each reading once a minute. You can change the sample rate by clicking on Curb (Connect) in your installed SmartApps and changing the Sample Rate input.  This should *not* be done during initial installation as it may cause duplicate devices to be created.
- If you do end up with duplicate devices, try re-installing the Curb (Connect) SmartApp.




# CurbBridge
Bridge between Curb Energy Monitor and SmartThings

This integration adds a new power meter in SmartThings for each sensor on your Curb.  They will all update at about 1Hz with only a few seconds latency.

Use of this integration requires an independent server running the bridge software.  This is required since the SmartThings API does not provide support for Socket.io.  Any computer should work, as long as you can install Node.js and it has access to the internet.  The server does not need access to your LAN, so it should even be able to run in a cloud computing environment.

## Installation:

### SmartThings:
- Publish both the CurbBridge SmartApp and CurbPowerMeter DeviceHandler to your account.  Either copy-paste into the IDE or use the GitHub integration.
- Go to the SmartApp settings for the Curb Bridge in the IDE.  Verify that OAuth is turned on and the redirect uri is set to http://localhost:8000
- Take note of the Client ID and Client Secret, they will be required later
- Use the mobile app to install the Curb Bridge SmartApp.  After install, it won't appear to do anything other than show up on the list of SmartApps.

### Bridge Server:
- Install Node.js on the computer you intend to use for the bridge server.  I have tested it on an Ubuntu 16.04 x64 desktop and an original Raspberry Pi.  It should work for Windows and Mac too.  Installers are available [here](https://nodejs.org/en/download/)
- Clone or download this repo to the server.
- In the curbbridge folder (containing package.json), run <pre>npm install .</pre> in a terminal window.
- Run the server with the command <pre>node .</pre>
- You should see "Server running at http://127.0.0.1:8000/" in the console
- Open a browser and direct it to http://127.0.0.1:8000/
- Enter your SmartThings Client ID in the text box
- Click Connect to SmartThings.  A new frame should appear.  Log in to your SmartThings account, select your location and click Authorize.  The frame should now indicate "Authorization Success" and your browser redirected to a second form.
- Complete the form on the page with your SmartThings Client ID (same as above), Client Secret, Curb username (probably your email address) and Curb password.
- Click Submit.  The page should redirect to a blank page with the text "Got It".
- Close the browser and you should see that the node application reporting that it has connected.
- Open your SmartThings app and verify that there are several new power meters added.
- You can stop the server by pressing ctrl+c in the terminal window.
- The server will store the access tokens in a file (CurbBridgeData.json) and will automatically connect on subsequent launches.
- If the tokens expire you will need to re-authenticate in the browser. The expired tokens in the file will be replaced automatically.

## Notes:
- The browser used for authentication must be running on the same computer as the server.
- The graphing feature in the SmartThings app is experimental.  It relies on an undocumented feature of ST and does not always work.  Hopefully ST improves support for htmlTile in the future.

## Troubleshooting:
- If you get an error "client ID is not associated with any smartapps at this location", just reload the authentication page and try again.  This probably means you just installed the SmartApp and it hasn't percolated all the way through the ST auth system.
