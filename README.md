![Cyclops](docs/images/cyclops_logo.png "Cyclops")

---

[Minified JS](https://github.com/Instrument/cyclops/raw/master/js/cyclops.min.js) | [AE Script](https://github.com/Instrument/cyclops/raw/master/aftereffects scripts/cyclops.jsx) | [Documentation](https://github.com/Instrument/cyclops/docs)

---

A tool to export AfterEffects motion for use in JavaScript.  Cyclops aims to solve the following problems commonly associated with motion on the web:

1. As a developer it's difficult to implement motion designs with perfect accuracy.
2. Due to the difficulty, the original motion design seldom survives implementation.
3. Because of #2, motion designers either have to accept that their work won't survive the development process, or end up hounding developers to endlessly tweak the animation code until it's as close to the original design as possible.

This process is not ideal, and in the end it causes needless time spent on re-working animation code rather than letting everybody focus on their area of expertise and artistry with the knowledge that the final product will reflect the original design intention as closely as possible.


### Architecture

Cyclops is comprised of two parts, a script for AfterEffects, and a JavaScript library.  The AfterEffects script is used to export frame data for any animated property in AfterEffects.  The data exported from AfterEffects is then used by the Cyclops JavaScript library to re-create the motion in the browser.

AfterEffects --> **Cyclops AE Script** --> JSON Data --> **Cyclops JavaScript** --> Motion!

The motion data is stored as a JSON that captures individual per-frame values for animated properties.  This frame data is read by the Cyclops JavaScript and is used to dyncamically generate a function which will return the same motion dynamics as normalized values.  This function can be dropped into most commonly used animation tools like jQuery's `animate` method, as well as most other popular libraries that support custom tweening functions.


### Cyclops != AfterEffects Player


> Cyclops is meant to create bite-sized pieces of motion like roll-over, loading, and transition effects for use througout a website.

It's important to note that the purpose of Cyclops is to export the _dynamics_ of the motion from AfterEffects for use in code.  It's not built for use as a playback engine for complex and lenghty sequences of animation.  If that is what you need, there are existing tools much better suited for that sort of thing, like [Flash](http://www.adobe.com/products/flash.html), [Swiffy](https://www.google.com/doubleclick/studio/swiffy/) or just use pre-rendered video.

Once loaded in JavaScript, curves can be adjusted dynamically and applied to any property via JavaScript, but the dynamics (the change over time) will match the original animation from AfterEffects.  Think of Cyclops curves just like the handful of standard easing functions, but the behavior of the easing is completely customizable using AfterEffects as the content creation tool.


### Usage

While this will vary greatly depending on the specifics of your team structure, project, and deployment process, the basics are as follows:

1. Install the [Cyclops AfterEffects script](docs/instructions_aftereffects.md).
2. Create some motion
3. Export the motion
4. [Load the motion data via JavaScript](docs/instructions_javascript.md).
5. Animate HTML elements using the motion.