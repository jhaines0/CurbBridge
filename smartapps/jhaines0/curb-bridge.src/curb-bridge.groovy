/**
 *  Curb Bridge
 *
 *  Copyright 2016 Justin Haines
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
definition(
    name: "Curb Bridge",
    namespace: "jhaines0",
    author: "Justin Haines",
    description: "App to receive data from Curb home energy monitor",
    category: "",
    iconUrl: "http://energycurb.com/wp-content/uploads/2015/12/curb-web-logo.png",
    iconX2Url: "http://energycurb.com/wp-content/uploads/2015/12/curb-web-logo.png",
    iconX3Url: "http://energycurb.com/wp-content/uploads/2015/12/curb-web-logo.png",
    oauth: true)


preferences {
	section("Settings") {
    	input "updatePeriod", "number", required: false, title: "Update Period (in seconds)", defaultValue: 10, range: "1..*"
    }
}

mappings {
  path("/data") {
    action: [
      PUT: "dataArrived"
    ]
  }
}

def installed() {
	log.debug "Installed with settings: ${settings}"

	initialize()
}

def updated() {
	log.debug "Updated with settings: ${settings}"

	unsubscribe()
	initialize()
}

def uninstalled() {
	log.debug "Uninstalling"
    removeChildDevices(getChildDevices())
}

private removeChildDevices(delete) {
    delete.each {
        deleteChildDevice(it.deviceNetworkId)
    }
}

def initialize() {
}

def dataArrived()
{
	//log.debug "Data Endpoint"
    def json = request.JSON
    if(json)
    {
        //log.debug "Got Data: ${json}"
        
        json.each
        {
        	def dni = "${it.id}"

            try
            {
                def existingDevice = getChildDevice(dni)

                if(!existingDevice)
                {
                    existingDevice = addChildDevice("jhaines0", "Curb Power Meter", dni, null, [name: "${dni}", label: "${it.label}"])
                }
                
                existingDevice.handleMeasurements(it.values)
            }
            catch (e)
            {
                log.error "Error creating or updating device: ${e}"
            }
        }
        
        
//		if(json.ts % updatePeriod == 0)
//        {
//            getChildDevices().each
//            {
//                //log.debug "Forwarding to ${it.name}"
//                it.handleMeasurements(json.measurements, json.prefix)
//            }
//        }
    }
}

