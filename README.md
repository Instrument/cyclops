a tool to export AfterEffects motion for use in JavaScript

Setup
=====

There are two main components in Cyclops, a UI Panel for AfterEffects used to export motion data and a JavaScript file used to play back the exported motion data in the browser.

## AfterEffects Plugin

First, you will need to install the Cyclops script panel.  

### Install the Script
Copy `cyclops.jsx` folder into the `ScriptUI Panels` folder for AfterEffects.  By default, you can find the `ScriptUI Panels` folder in the following location:

##### Windows
`Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels`

##### Mac
`Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels`

**Note:** The `ScriptUI Panels` folder may or may not exist, if it doesn't exist you can simply create the folder yourself.

### Run the Script

After you have copied the script, restart AfterEffects.  Open the `Window` menu and select `cyclops.jsx` from the list.

### Select a Property for Export

Highlight one of the transform properties for any layer in your composition and click the `Add Property` button in the cyclops UI panel.

### Export Data

Click `Export Properties` to create a JavaScript file containing the data for your motion curves.  This JavaScript file will then be used to recreate the motion curves in the browser.  If you aren't a developer, you will need to work with whomever is writing the code for your project, it's important that you coordinate closely with them (especially when setting up the project for the first time).

The Cyclops script will save your export settings when the AfterEffects project is saved, so you will only need to configure the list of properties once and they will be there any time you open the project.

## JavaScript Library

To use cyclops on your page, include the `cyclops.js` script.  This script will create a global `cyclops` object which will expose all of the cyclops related functionality.  You will also need to include any JavaScript files or JSON curve data (exported from the AfterEffects script).

Once you have all the scripts included on you page, you must tell cyclops which curves to load, and decide how you would like to use them.

#### Loading Curve Data

To load curves into Cyclops, simply invoke `cyclops.loadCurves( <curve data> )` and pass in the JavaScript curve data that was exported from AfterEffects.  This will load all named curves into Cyclops.

#### Using Curves

After loading one or more curves into Cyclops, you can access them by invoking `cyclops.getCurve( <name> )` which will return a function.  The function accepts a single float between zero and one, and returns a normalized value which follows the curve from AfterEffects.

#### Example

The following example code will load some curve data, then use it with jQuery to animate the width of an element upon mouse roll-over and roll-out.

	<html>
	<head>
		<style>
		
		#buttonExample {
			background:#a0a0a0;
			position:absolute;
			width:300px;
			height:50px;
			text-align:center;
		}
	
		</style>
	
		<script src="roll-over-curve.js"></script>
		<script src="../../js/cyclops.js"></script>
		<script src="jquery.js"></script>
	
		<script>
	
		// Load the curve data into cyclops
		cyclops.loadCurves(rollovers);
	
		// Add the new curve to the jQuery easing object.
		$.easing.example = cyclops.getCurve("roll-over-scale");
	
		$(document).on("ready", function() {
	
			// Use the curve with the JQuery animate function.
			// Notice that the duration of the original curve is used as well.
			
			$("#buttonExample").on("mouseenter", function() {
				$("#buttonExample").stop().animate({"width" : 400}, rollovers["roll-over-scale"].duration, "example");
			});
	
			$("#buttonExample").on("mouseleave", function() {
				$("#buttonExample").stop().animate({"width" : 300}, rollovers["roll-over-scale"].duration, "example");
			});
	
		});
	
		</script>
	</head>
	
	<body>
		<div id="buttonExample"></div>
	</body>
	</html>