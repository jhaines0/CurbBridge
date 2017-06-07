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
		multiAttributeTile(name:"power", type: "lighting", width: 2, height: 2, canChangeIcon: true) {
        	tileAttribute ("device.power", key: "PRIMARY_CONTROL") {
 	    		attributeState "power", label:'${currentValue} W', icon: "st.Home.home2", backgroundColors: [
            		[value: 0,   color: "#00b000"],
            		[value: 100, color: "#ffcc00"],
                    [value: 1000, color: "#c00000"]
        		]
			}
        }
        
		htmlTile(name:"graph",
				 action: "generateGraph",
				 refreshInterval: 10,
				 width: 6, height: 4,
				 whitelist: ["www.gstatic.com"])        
        
		main (["power"])
		details(["power", "graph"])
	}
}

mappings {
	path("/generateGraph") {action: [GET: "generateGraphHTML"]}
}

def handleMeasurements(values)
{
	// For some reason they show up out of order
    values.sort{a,b -> a.t <=> b.t}
    
	state.values = values;
    
    def val = values[0].w // For now just strip out the first (newest) reading and use it
    sendEvent(name: "power", value: Math.round(val))
}

String getDataString()
{
	def dataString = ""

	state.values.each() {
    	def ts = (long)it.t * 1000.0
        def theDate = new Date(ts + location.timeZone.getOffset(ts))
        def theTime = [theDate.getHours(), theDate.getMinutes(), theDate.getSeconds()].toString()
        
		dataString += [theTime, it.w].toString() + ","
	}
    //log.debug "Datastring: '${dataString}'"
    
	return dataString
}

def getStartTime()
{
    def ts = (long)state.values[0].t * 1000.0
    def theDate = new Date(ts + location.timeZone.getOffset(ts))
    def theTime = [theDate.getHours(), theDate.getMinutes(), theDate.getSeconds()].toString()
    //log.debug("TheTime: ${theTime}")
    
	return theTime
}

def generateGraphHTML() {
	def html = """
		<!DOCTYPE html>
			<html>
				<head>
					<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
					<script type="text/javascript">
						google.charts.load('current', {packages: ['corechart']});
						google.charts.setOnLoadCallback(drawGraph);
						function drawGraph() {
							var data = new google.visualization.DataTable();
							data.addColumn('timeofday', 'time');
							data.addColumn('number', 'Power');
							data.addRows([
								${getDataString()}
							]);
							var options = {
								fontName: 'San Francisco, Roboto, Arial',
								height: 240,
								hAxis: {
									format: 'h:mm aa',
									minValue: [${getStartTime()}],
									slantedText: false
								},
								series: {
									0: {targetAxisIndex: 0, color: '#FFC2C2', lineWidth: 1}
								},
								vAxes: {
									0: {
										title: 'Power (W)',
										format: 'decimal',
										textStyle: {color: '#004CFF'},
										titleTextStyle: {color: '#004CFF'},
                                        minValue: 0
									},
								},
								legend: {
									position: 'none'
								},
								chartArea: {
									width: '72%',
									height: '85%'
								}
							};
							var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
							chart.draw(data, options);
						}
					</script>
				</head>
				<body>
					<div id="chart_div"></div>
				</body>
			</html>
		"""
	render contentType: "text/html", data: html, status: 200
}