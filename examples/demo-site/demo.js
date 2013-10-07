function DnDFileController(selector, onDropCallback) {
	var el_ = document.querySelector(selector);

	this.dragenter = function(e) {
		e.stopPropagation();
		e.preventDefault();
		el_.classList.add('dropping');
	};

	this.dragover = function(e) {
		e.stopPropagation();
		e.preventDefault();
		el_.classList.add('dropping');
	};

	this.dragleave = function(e) {
		e.stopPropagation();
		e.preventDefault();
		el_.classList.remove('dropping');
	};

	this.drop = function(e) {
		e.stopPropagation();
		e.preventDefault();

		el_.classList.remove('dropping');

		onDropCallback(e.dataTransfer.files, e);
	};

	el_.addEventListener('dragenter', this.dragenter, false);
	el_.addEventListener('dragover', this.dragover, false);
	el_.addEventListener('dragleave', this.dragleave, false);
	el_.addEventListener('drop', this.drop, false);
};



var dropZone = new DnDFileController("#dropper", function(files, evt){
	var dt    = evt.dataTransfer;

	// only allow for one file at a time.
	if(files.length == 1) {
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			var reader = new FileReader();

			reader.onload = function(e) {
				console.log("READ FILE FINISHED.");
				console.log(e.target);
				try{

					var curve = JSON.parse(e.target.result);
					cyclops.loadCurves(curve);

				} catch(e){
					if(e instanceof SyntaxError){
						console.log("Invalid JSON file, syntax error occured.");
					} else {
						console.log("invalid JSON file, unknown error occured.");
					}
				}
			};

			reader.readAsText(file);
		}
	}
});

var ddCatcher = new DnDFileController("body", function(files, evt){
	console.log("Ignoring file.");
	return false;
});