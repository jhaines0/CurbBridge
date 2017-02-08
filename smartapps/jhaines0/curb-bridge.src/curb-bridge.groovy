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
	section("Title") {
		// TODO: put inputs here
	}
}

mappings {
  path("/metadata") {
    action: [
      PUT: "metadataArrived"
    ]
  }
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
    removeChildDevices(getChildDevices())
}

private removeChildDevices(delete) {
    delete.each {
        deleteChildDevice(it.deviceNetworkId)
    }
}

def initialize() {
}

def metadataArrived()
{
	log.debug "Metadata Endpoint"
    def json = request.JSON
    if(json)
    {
    	//log.debug "Got Metadata ${json}"
        
        json._embedded.profiles.each { profile ->
            def prefix = profile.real_time[0].prefix
            log.debug "Profile Prefix: ${prefix}"
        
            profile._embedded.registers.registers.each
            {
                //log.debug "ID: ${it.id}"
                //log.debug "Label: ${it.label}"
                //log.debug "Flip: ${it.flip_domain}"
                //log.debug "Multiplier: ${it.multiplier}"

                def register = it.id.substring(prefix.size()+1)
                //log.debug "Register: ${register}"

                def dni = "${it.id}"

                try
                {
                    def existingDevice = getChildDevice(dni)

                    if(!existingDevice)
                    {
                        existingDevice = addChildDevice("jhaines0", "Curb Power Meter", dni, null, [name: "${dni}", label: "${it.label}"])
                    }

                    def mult = it.multiplier
                    if(it.flip_domain)
                    {
                        mult = mult * -1
                    }

                    existingDevice.configure(mult, register, prefix)
                } 
                catch (e)
                {
                    log.error "Error creating device: ${e}"
                }
            }
        }
    }
}

def dataArrived()
{
	//log.debug "Data Endpoint"
    def json = request.JSON
    if(json)
    {
        log.debug "Got Data: ${json}"
		//if(json.ts % 5 == 0)
        //{
            getChildDevices().each
            {
                //log.debug "Forwarding to ${it.name}"
                it.handleMeasurements(json.measurements, json.prefix)
            }
        //}
    }
}

