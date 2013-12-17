## JavaScript Library

To use cyclops on your page, include the `cyclops.js` script.  This script will create a global `cyclops` object which will expose all of the cyclops related functionality.  You will also need to include any JavaScript files or JSON curve data (exported from the AfterEffects script).

Once you have all the scripts included on you page, you must tell cyclops which curves to load, and decide how you would like to use them.

### Loading Curve Data

To load curves into Cyclops, simply invoke `cyclops.loadCurves( <curve data> )` and pass in the JavaScript curve data that was exported from AfterEffects.  This will load all named curves into Cyclops.  

For example:

	function initPage() {
	
		var myCurveJson = { ... a lot of json data from cyclops ... };
		cyclops.loadCurves( myCurveJson );
		
	}

### Using Curves

To get a curve from cyclops, use the following method:

`var curveFunc = cyclops.getCurve( <curve name>, <parameter index> );`

**Arguments:**

1. `Curve Name` - The curve name is set in the Cyclops AfterEffects UI so you will need to coordinate with the motion artist if you are't the one working on the motion.
2. `Parameter Index` _(optional)_ - Many properties in AfterEffects are multi-dimensional (for example, position data includes an x, y, and z component).  As a result, there may be more than one property of interest for a given curve.  By default the zeroth property will be used.

The function returned from `cyclops.getCurve` accepts a single floating point value from zero to one representing time, and returns a normalized value representing the curve value at that point in time.  By using normalized values, the result of the curve function can be scaled to any arbitrary range, including scaling the value back to the original range from the AfterEffects composition (see `min` and `max` values in the Curve Properties list below).

Example:

	cyclops.loadCurves( myCurveData );
	
	var func = cyclops.getCurve("some_curve");
	
	alert("The value of some_curve half-way through the tween: " + func(0.5));


### Curve Properties

In many cases, it is helpful to know a little more about the source curve, such as the duration, original minimum and maximum values, etc.  These properties are stored in the curve JSON and can be easily referenced in your code.

For reference, here are the various properties associated with each JSON blob exported from AfterEffects:

* `duration` - the duration of the entire curve, in milliseconds
* `startTime` - the time within the AfterEffects composition of the first key frame, in milliseconds
* `min` - An array of values that represent the minimum for each value component (remember, values in AfterEffects can be multi-dimensional).  These values are not normalized and represent the values as they appear in aftereffects.  Units will vary depending on the property (position may be in pixels, scale in percentage, etc).
* `max` - Just like `min` but is the list of the maximum values.
* `begin` - Just like `min` but is the list of values at the **start** of the curve.
* `end` - Just like `min` but is the list of values at the **end** of the curve.
* `_comp_bounds` - Used internally, this is an array of two values that represents the dimensions of the original AfterEffects composition.

The most common use of the curve properties is to adjust the timing of an animation to match the original duration.  For example:


	$.easing.myCurve = cyclops.getCurve("myCurve");
	$("#myElement").animate( {"width" : 400}, curveData["myCurve"].duration, "myCurve");

### Complete Example

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