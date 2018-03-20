// This file contains js code for the about dialog, it is loaded from about.html
const remote = require('electron').remote;

$('#btnClose').on('click', function(e) {
	remote.getCurrentWindow().close();
})