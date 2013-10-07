var cyclops = function() {
  function plus(a, b) {
    var len = Math.min(a.length, b.length);
    var c = new Array(len);
    for (var l = 0; l < len; l++) {
      c[l] = a[l] + b[l];
    }
    return c;
  }

  function minus(a, b) {
    var len = Math.min(a.length, b.length);
    var c = new Array(len);
    for (var l = 0; l < len; l++) {
      c[l] = a[l] - b[l];
    }
    return c;
  }

  function scale(a, n) {
    var len = a.length;
    var c = new Array(len);
    for (var l = 0; l < len; l++) {
      c[l] = n * a[l];
    }
    return c;
  }

  function magnitude(c) {
    var sum = 0;
    for (var l = 0; l < c.length; l++) {
      sum += c[l] * c[l];
    }
    return Math.sqrt(sum);
  }

  function normalize(d) {
    var length = magnitude(d);
    return scale(d, 1 / length);
  }

  function zeros(n) {
    var zero = new Array(n);
    for (var z = 0; z < n; z++) {
      zero[z] = 0;
    }
    return zero;
  }

  function integrate(f, a, b, dx) {
    var u, c = 0;
    dx = dx ? dx : (b-a) * 0.001;
    var halfdx = dx * 0.5;
    for (var t = a; t < b; t += dx) {
      u = f(t);
      c += u * dx;
    }

    return c;
  }

  function arcLength(f, a, b, dx) {
    var u, v, m, l = 0;
    dx = dx ? dx : (b-a) * 0.001;
    for (var t = a; t < b; t += dx) {
      u = f(t);
      v = f(t+dx);
      m = magnitude(minus(v, u));
      l += m;
    }

    return l;
  }

  function interpolateLinear(index, left, right) {
    var dx = right.x - left.x;
    var t = (index - left.x) / dx;
    var s = 1 - t;

    var A = scale(left.y, s);
    var D = scale(right.y, t);

    return plus(A, D);
  }

  function interpolateCubic(index, left, right) {
    var dx = right.x - left.x;
    var t = (index - left.x) / dx;
    var s = 1 - t;

    var leftP = plus(left.y, left.tangent);
    var rightP = plus(right.y, right.tangent);

    var A = scale(left.y, s*s*s);
    var B = scale(leftP, 3*s*s*t);
    var C = scale(rightP, 3*s*t*t);
    var D = scale(right.y, t*t*t);

    return plus(A, plus(B, plus(C, D)));
  }

  function interpolateCatmullRom(index, left, right) {
    var dx = right.x - left.x;
    var t = (index - left.x) / dx;
    var s = 1 - t;

    var p0 = left.tangent;
    var p1 = left.y;
    var p2 = right.y;
    var p3 = right.tangent;

    var A = scale(plus(scale(p0, -0.5), plus(scale(p1, 1.5), plus(scale(p2, -1.5), scale(p3, 0.5)))), t*t*t);
    var B = scale(plus(scale(p0, 1.0), plus(scale(p1, -2.5), plus(scale(p2, 2.0), scale(p3, -0.5)))), t*t);
    var C = scale(plus(scale(p0, -0.5), scale(p2, 0.5)), t);
    var D = p1;

    return plus(A, plus(B, plus(C, D)));
  }

  function interpolateQuintic(index, left, right) {
    var dx = right.x - left.x;
    var t = (index - left.x) / dx;
    var s = 1 - t;

    var leftP = plus(left.y, left.tangent);
    var leftQ = plus(left.y, left.control);
    var rightQ = plus(right.y, right.control);
    var rightP = plus(right.y, right.tangent);

    var A = scale(left.y, s*s*s*s*s);
    var B = scale(leftP, 5*s*s*s*s*t);
    var C = scale(leftQ, 10*s*s*s*t*t);
    var D = scale(rightQ, 10*s*s*t*t*t);
    var E = scale(rightP, 5*s*t*t*t*t);
    var F = scale(right.y, t*t*t*t*t);

    return plus(A, plus(B, plus(C, plus(D, plus(E, F)))));
  }

  function interpolateHermite(index, left, right) {
    var dx = right.x - left.x;
    var t = (index - left.x) / dx;
    var s = 1 - t;
    
    var leftP = plus(left.y, left.tangent);
    var rightP = plus(right.y, right.tangent);

    var A = scale(left.y, s*s*(1 + 2*t));
    var D = scale(right.y, t*t*(1 + 2*s));
    var U = scale(leftP, s*s*t);
    var V = scale(rightP, s*t*t);

    return plus(A, plus(D, minus(U, V)));
  }

  function findIndex(t, v) {
    var n = v.length;
    var p, q, mid;
    p = 0;
    q = n-1;
    while(q-p>1) {
      mid = Math.floor((p+q)/2);
      if(v[mid] <= t) p = mid;
      else q = mid;
    }
    
    return p;
  }

  function buildCurve(values) {
    values.position = {left: [], right: []};
    values.speed = {left: [], right: []};
    values.arcLength = [];

    for (var p = 0; p < values.x.length - 1; p++) {
      var a = values.x[p];
      var b = values.x[p+1];
      var dx = b - a;
      var dy = minus(values.y[p+1], values.y[p]);

      var positionLeft = {
        x: a,
        y: values.y[p],
        tangent: values.left.tangent[p]
      }
      var positionRight = {
        x: b,
        y: values.y[p+1],
        tangent: values.right.tangent[p+1]
      }
      values.position.left.push(positionLeft);
      values.position.right.push(positionRight);

      // var f = function(t) {
      //   // return interpolateCubic(t, positionLeft, positionRight);
      //   return interpolateLinear(t, positionLeft, positionRight);
      // }

      // values.arcLength = arcLength(f, a, b);
      // values.pixelsPerSecond = values.arcLength / values.duration;
    }

    return function(t) {
      var p = findIndex(t, values.x);

      if (values.left.type && values.left.type[p] == "linear") {
        return interpolateLinear(t, 
                                 values.position.left[p], 
                                 values.position.right[p]);
      } else {
        // return interpolateLinear(t, 
        return interpolateCatmullRom(t, 
        // return interpolateCubic(t, 
                                values.position.left[p], 
                                values.position.right[p]);
      }
    }
  }

  function findBounds(input) {
    var min = 1000000000;
    var max = 0;
    for(var i = 0; i < input.length; i++){
      if(min > input[i]){
        min = input[i];
      }
      if(max < input[i]){
        max = input[i];
      }
    }

    return [min, max];
  }

  function boundData(input, bounds) {
    var output = [];
    var min = bounds[0];
    var max = bounds[1];

    for(var i = 0; i < input.length; i++){
      output.push( (input[i] - min) / (max - min) );
    }

    return output;
  }

  function boundVectorData(input, bounds) {
    var output = [];
    var min = bounds[0];
    var max = bounds[1];

    for(var i = 0; i < input.length; i++){
      output.push( (input[i] - min[i]) / (max[i] - min[i]) );
    }

    return output;
  }

  function scaleData(input, bounds) {
    var output = [];
    var scale = 1.0 / (bounds[1] - bounds[0]);

    for(var i = 0; i < input.length; i++){
      output.push(input[i] * scale);
    }

    return output;
  }

  function normalizeData(input) {
    var bounds = findBounds(input);
    return boundData(input, bounds);
  }

  function gatherValues(data) {
    function buildDirectional() {
      return {
        type: [],
        influence: [],
        speed: [],
        tangent: []
      };
    }

    function pushDirectionals(collector, directionals) {
      collector.influence.push(directionals.influence * 0.01);
      collector.type.push(directionals.type);
      collector.speed.push(directionals.speed);
      collector.tangent.push(directionals.tangent);
      return collector;
    }

    var keys = data.keys;
    var xs = [];
    var ys = [];
    var left = buildDirectional();
    var right = buildDirectional();
    var min = data.min;
    var max = data.max;
    var bounds = [min, max];
    var i, j;

    for (i = 0; i < keys.length; i++) {
      var keyframe = keys[i];
      xs.push(keyframe.time);
      ys.push(keyframe.value.length ? keyframe.value : [keyframe.value]);
      pushDirectionals(right, keyframe.in);
      pushDirectionals(left, keyframe.out);
    }

    return {
      x: xs,
      y: ys,
      left: left,
      right: right,
      bounds: bounds,
      start: data.startTime,
      duration: data.duration
    };
  }

  function gatherFrameValues(data) {
    var frames = data.frameData;
    var xs = [];
    var ys = [];
    for (var j = 0; j < frames.length; j++) {
      var frame = frames[j];
      xs.push(frame.t);
      ys.push(frame.val.length ? frame.val : [frame.val]);
    }

    var min = data.begin;
    var max = data.end;
    var bounds = [min, max];

    return {
      x: xs,
      y: ys,
      start: data.startTime,
      duration: data.duration,
      bounds: bounds
    }
  }

  function placeTangents(values) {
    var left = {tangent: []};
    var right = {tangent: []};
    var influence = 0;
    var length = values.y.length;
    var slope, rightHalf, rightTangent, leftHalf, leftTangent;

    // find all the tangents in the middle
    for (var k = 1; k < length-1; k++) {
      left.tangent[k] = values.y[k-1];
      right.tangent[k] = values.y[k+1];
    }

    // now do the extremes
    left.tangent[0] = minus(scale(values.y[0], 2), values.y[1]);
    right.tangent[length-1] = minus(scale(values.y[length-1], 2), values.y[length-2]);

    return {
      left: left,
      right: right
    }
  }

  function constructTangents(values) {
    var left = {tangent: []};
    var right = {tangent: []};
    var influence = 0;
    var length = values.y.length;
    var slope, rightHalf, rightTangent, leftHalf, leftTangent;

    // find all the tangents in the middle
    for (var k = 1; k < length-1; k++) {
      slope = normalize(minus(values.y[k+1], values.y[k-1]));
      console.log("before: " + values.x[k-1] + ":" + values.y[k-1] + ", during: " + values.x[k] + ":"  + values.y[k] + ", after: " + values.x[k+1] + ":"  + values.y[k+1] + ", slope: " + slope);

      rightHalf = (values.x[k] - values.x[k-1]) * influence;
      rightTangent = scale(slope, -rightHalf);

      leftHalf = (values.x[k+1] - values.x[k]) * influence;
      leftTangent = scale(slope, leftHalf);

      right.tangent[k] = rightTangent;
      left.tangent[k] = leftTangent;
    }

    // now do the extremes
    slope = normalize(minus(values.y[1], values.y[0]));
    leftHalf = (values.x[1] - values.x[0]) * influence * 0.5;
    left.tangent[0] = scale(slope, leftHalf);

    slope = normalize(minus(values.y[length-1], values.y[length-2]));
    rightHalf = (values.x[length-1] - values.x[length-2]) * influence * 0.5;
    right.tangent[length-1] = scale(slope, -rightHalf);

    console.log(values);
    console.log("" + left.tangent);
    console.log("" + right.tangent);

    return {
      left: left,
      right: right
    }
  }

  function dimensionalInterpolation(values, epsilon) {
    var curve = buildCurve(values);
    var func = function(t) {
      var index = t * values.duration + values.start;
      return curve(index);
    }

    values.original = curve;
    values.func = func;
    values.normalizedFunc = function(t) {
      var un = func(t);
      var bounded = boundVectorData(un, values.bounds);
      return bounded;
    }

    return values;
  }

  function gatherProperty(data) {
    var values = gatherValues(data);
    var generate = dimensionalInterpolation(values);
    return generate;
  }

  function gatherFrameProperty(data) {
    var values = gatherFrameValues(data);
    // var tangents = constructTangents(values);
    var tangents = placeTangents(values);
    values.left = tangents.left;
    values.right = tangents.right;
    var generate = dimensionalInterpolation(values);
    return generate;
  }

  function loadVectorCurve(data) {
    var curve = {};
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var generate = gatherFrameProperty(data[key]);
        curve[key] = generate;
      }
    }

    return curve;
  }

  var curves = {};

  function loadCurves(data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var generate = gatherFrameProperty(data[key]);
        curves[key] = generate;
      }
    }
  }

  function getCurve(curveName, index) {
    if (!index) index = 0;

    return function(t) {
      return curves[curveName].normalizedFunc(t)[index];
    }
  }

  return {
    plus: plus,
    minus: minus,
    scale: scale,
    zeros: zeros,
    magnitude: magnitude,
    arcLength: arcLength,
    interpolateLinear: interpolateLinear,
    interpolateCubic: interpolateCubic,
    interpolateQuintic: interpolateQuintic,
    interpolateHermite: interpolateHermite,
    buildCurve: buildCurve,
    normalizeData: normalizeData,
    gatherValues: gatherValues,
    gatherProperty: gatherProperty,
    dimensionalInterpolation: dimensionalInterpolation,
    loadVectorCurve: loadVectorCurve,
    loadCurves: loadCurves,
    getCurve: getCurve
  }
} ();








  // function buildCurve(values) {
  //   values.position = {left: [], right: []};
  //   values.speed = {left: [], right: []};
  //   values.arcLength = [];

  //   function findIndex(t) {
  //     var n = values.x.length;
  //     var p, q, mid;
  //     p = 0;
  //     q = n-1;
  //     while(q-p>1) {
  //       mid = Math.floor((p+q)/2);
  //       if(values.x[mid] <= t) p = mid;
  //       else q = mid;
  //     }
      
  //     return p;
  //   }

  //   var speedMin = 1000000;
  //   var speedMax = 0;

  //   for (var p = 0; p < values.x.length - 1; p++) {
  //     var a = values.x[p];
  //     var b = values.x[p+1];
  //     var dx = b - a;
  //     var dy = minus(values.y[p+1], values.y[p]);

  //     var positionLeft = {
  //       x: a,
  //       y: values.y[p],
  //       tangent: values.left.tangent[p]
  //     }
  //     var positionRight = {
  //       x: b,
  //       y: values.y[p+1],
  //       tangent: values.right.tangent[p+1]
  //     }
  //     values.position.left.push(positionLeft);
  //     values.position.right.push(positionRight);

  //     var f = function(t) {
  //       return interpolateCubic(t, positionLeft, positionRight);
  //     }

  //     values.arcLength = arcLength(f, a, b);
  //     values.pixelsPerSecond = values.arcLength; // / values.duration;

  //     var speedL = values.left.speed[p];
  //     var speedR = values.right.speed[p+1];
  //     var tanL = dx * values.left.influence[p];
  //     var tanR = -dx * values.right.influence[p+1];

  //     var speedLeft = {
  //       x: a,
  //       y: [a, speedL],
  //       tangent: [tanL, 0],
  //       control: [tanL, 0]
  //     }

  //     var speedRight = {
  //       x: b,
  //       y: [b, speedR],
  //       tangent: [tanR, 0],
  //       control: [tanR, 0]
  //     }

  //     function controlSpeed(w, x, y, z) {
  //       speedLeft.tangent[1] = w;
  //       speedLeft.control[1] = x;
  //       speedRight.control[1] = y;
  //       speedRight.tangent[1] = z;
  //     }

  //     // find a match between integral of speed curve and arclength of position curve
  //     var g = function(t) {
  //       return interpolateQuintic(t, speedLeft, speedRight)[1];
  //     }

  //     function guessControl(previous, w, x, y, z) {
  //       controlSpeed(w, x, y, z);
  //       var newTarget = integrate(g, a, b);
  //       var dnew = values.pixelsPerSecond - newTarget;
  //       var dold = values.pixelsPerSecond - previous;
        
  //       return Math.abs(dnew) < Math.abs(dold) ? dnew : -dnew;
  //     }

  //     var target = integrate(g, a, b);

  //     var w = 0, x = 0, y = 0, z = 0;
  //     var df = values.pixelsPerSecond - target;
  //     var step = 0.1;

  //     var searching = true;
  //     var v = 0;
  //     while (searching && v < 30) {
  //       v++;
  //       var dw = guessControl(target, w + df * step, x, y, z);
  //       var dx = guessControl(target, w, x + df * step, y, z);
  //       var dy = guessControl(target, w, x, y + df * step, z);
  //       var dz = guessControl(target, w, x, y, z + df * step);
  //       w += dw;
  //       x += dx;
  //       y += dy;
  //       z += dz;
  //       controlSpeed(w, x, y, z);
  //       target = integrate(g, a, b);
  //       df = values.pixelsPerSecond - target;
  //       // console.log("guesses: " + dw + "," + dx + "," + dy + "," + dz);

  //       // console.log("speed: " + speedL + ":" + values.left.influence[p] + ", " + speedR + ":" + values.right.influence[p+1]);
  //       console.log("arclength: " + values.pixelsPerSecond + ", target: " + target + ", difference: " + (values.pixelsPerSecond - target));
  //     }

  //     var u, c = 0;
  //     var dx = (b-a) * 0.001;
  //     var halfdx = dx * 0.5;
  //     for (var t = a; t < b; t += dx) {
  //       u = g(t);
  //       speedMax = Math.max(speedMax, u);
  //       speedMin = Math.min(speedMin, u);
  //     }

  //     console.log(speedLeft);
  //     console.log(speedRight);

  //     values.speed.left.push(speedLeft);
  //     values.speed.right.push(speedRight);
  //   }

  //   console.log(values.speed.left);
  //   console.log(values.speed.right);

  //   console.log(speedMin);
  //   console.log(speedMax);

  //   values.speedMin = speedMin;
  //   values.speedMax = speedMax;

  //   values.speedCurve = function(t) {
  //     var p = findIndex(t);
  //     return interpolateQuintic(t, values.speed.left[p], values.speed.right[p]);
  //   }

  //   values.normalizedSpeedCurve = function(t) {
  //     var index = t * values.duration + values.start;
  //     var un = values.speedCurve(index)[1];
  //     return (un - speedMin) / (speedMax - speedMin);
  //   }

  //   return function(t) {
  //     var p = findIndex(t);
  //     var index = interpolateQuintic(t, 
  //                                    values.speed.left[p], 
  //                                    values.speed.right[p])[1];

  //     // var index = t;
  //     if (values.left.type[p] == "linear") {
  //       return interpolateLinear(index, 
  //                                values.position.left[p], 
  //                                values.position.right[p]);
  //     } else {
  //       return interpolateCubic(index, 
  //                               values.position.left[p], 
  //                               values.position.right[p]);
  //     }
  //   }
  // }

