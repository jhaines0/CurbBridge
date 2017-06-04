/**
 *  Curb Power Meter
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
metadata {
	definition (name: "Curb Power Meter", namespace: "jhaines0", author: "Justin Haines") {
		capability "Power Meter"
		capability "Sensor"
	}

	simulator { }

	tiles
    {
		multiAttributeTile(name:"power", type: "lighting", width: 6, height: 4, canChangeIcon: true) {
        	tileAttribute ("device.power", key: "PRIMARY_CONTROL") {
 	    		attributeState "power", label:'${currentValue} W', icon: "st.Home.home2", backgroundColors: [
            		[value: 0,   color: "#00b000"],
            		[value: 100, color: "#ffcc00"],
                    [value: 1000, color: "#c00000"]
        		]
			}
        }
        
		main (["power"])
		details(["power"])
	}
}

def handleMeasurements(values)
{
	def val = values[0].w // For now just strip out the first (newest) reading and use it
    sendEvent(name: "power", value: Math.round(val))
}
