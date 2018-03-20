const electron = require('electron');
const fs = require("fs");
const path = require("path");
const ipc = electron.ipcRenderer;
const shell = electron.shell;

//Opens web links in external browser.
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

let currentWindow = electron.remote.getCurrentWindow();
let passedIn = global.location.search;
let fPath = passedIn.substring(passedIn.indexOf('?') + 1).replace(/%20/g, " ");
let fileArray = [];
let conversationArray = [];
let messagesArray = {};
let beginningTags = [];
let endTags = [];
let content;
let counter = 0;
let dateObject = {};
let finalObject = {};

//jstree intialization.
$(function () {
	let data = [];
	$("#jstree").jstree({
		"core" : {
			"check_callback" : true,
			"data": data,
			"themes": { "icons": false }
		},
		"plugins" : [ "contextmenu",  "dnd", "sort"],
		onselect: function(n, t) {
         t.toggle_branch(n);
    	},
		'sort' : function(a, b) {
			monthObject = { "Conversation": -1, "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5, "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11 };
			a1 = this.get_node(a);
			b1 = this.get_node(b);
			aSplit = a1.text.split(' ');
			bSplit = b1.text.split(' ');
			aMonth = aSplit[0];
			bMonth = bSplit[0];
            
			if (a1.icon == b1.icon) {
				if (monthObject[aMonth] == monthObject[bMonth]) {
					return (a1.text > b1.text)  ? 1 : -1;
				} else {
					return (monthObject[aMonth] > monthObject[bMonth])  ? 1 : -1;
				}
			} else {
            	return (a1.icon > b1.icon) ? 1 : -1;
            }
    	}
		   
	})
});

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function cleanString(input) {
	if (input === "" || input === null) {
		return input;
	}
    if (isLetter(input.substring(input.length - 1))) {
		return input;
	} else {
		return input.substring(0, input.length - 1);
	}
}

Array.prototype.contains = function(element) {
    return this.indexOf(element) > -1;
};

Object.size = function(obj) {
    let size = 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
			size++;
		}
    }
    return size;
};

document.getElementById('refresh').addEventListener('click', _ => {
    ipc.send('refresh-clicked');
});

//To search for messages by pressing submit button.
document.getElementById('submit').addEventListener('click', _ => {
		let matchString = document.getElementById('textfield').value.toLowerCase();
		let v = $("#jstree").jstree(true).get_json('#', {'flat': true});
		let idArray = [];
		let parentSizes = {};
		let parentIDs = [];

		for (let i = 0; i < v.length; i++) {
			let z = v[i];
			let text = z["text"].toLowerCase();
			let id = z["id"];
			idArray.push(id);
			let hideNode = $('#jstree').jstree(true).get_node(id);
			if (text != matchString) {
				$("#jstree").jstree(true).show_node(hideNode);
			}
		}	
		idArray = [];
		parentSizes = {};
		parentIDs = [];

		for (let i = 0; i < v.length; i++) {
    		let z = v[i];
    		let text = z["text"].toLowerCase();
			let id = z["id"];
			idArray.push(id);
			let hideNode = $('#jstree').jstree(true).get_node(id);
			
			if (!text.includes(matchString) && text.includes("conversation with")) {
				let parent = $('#jstree').jstree(true).get_parent(id);
				if (parentIDs.indexOf(parent) <= -1) {
    				parentIDs.push(parent);
				}				
				$("#jstree").jstree(true).hide_node(hideNode);

				if (!parentSizes.hasOwnProperty(parent)) {
					parentSizes[parent] = 1;
				} else {
					parentSizes[parent]++;
				}
			}
		}
		let officialCount = {};
		for (let i = 0; i < Object.size(dateObject); i++) {
			let numInnerArrays = Object.size(dateObject[parentIDs[i]]);
			officialCount[parentIDs[i]] = numInnerArrays;
		}

		for (let i = 0; i < parentIDs.length; i++) {
			let parent = parentIDs[i];
			let parentNode =  $('#jstree').jstree(true).get_node(parent);
			let children = $('#jstree').jstree(true).get_children_dom(parentNode);
			
			if (parentSizes[parent] == officialCount[parent]) {
				$("#jstree").jstree(true).hide_node(parentNode); 
			}
		}
});

let masterEventHandler = function() {
    document.getElementById('messages').innerHTML = finalObject[this.getAttribute('id')];
};


document.getElementById('nav').addEventListener('mouseover', (event) => {
		let matchString = document.getElementById('textfield').value.toLowerCase();
		let v = $("#jstree").jstree(true).get_json('#', {'flat': true});
		let idArray = [];
		let parentSizes = {};
		let parentIDs = [];
		if (matchString == "") {
			for (let i = 0; i < v.length; i++) {
				let z = v[i];
				let text = z["text"].toLowerCase();
				let id = z["id"];
				idArray.push(id);
				let hideNode = $('#jstree').jstree(true).get_node(id);
				if (text != matchString) {
					$("#jstree").jstree(true).show_node(hideNode);
				}
			}	
		}
});

document.getElementById('left-panel').addEventListener('mouseover', (event) => {
		let matchString = document.getElementById('textfield').value.toLowerCase();
		let v = $("#jstree").jstree(true).get_json('#', {'flat': true});
		let idArray = [];
		let parentSizes = {};
		let parentIDs = [];
		if (matchString == "") {
			for (let i = 0; i < v.length; i++) {
				let z = v[i];
				let text = z["text"].toLowerCase();
				let id = z["id"];
				idArray.push(id);
				let hideNode = $('#jstree').jstree(true).get_node(id);
				if (text != matchString) {
					$("#jstree").jstree(true).show_node(hideNode);
				}
			}	
		}
});

//To search for messages by hitting enter on keyboard.
document.getElementById('textfield').addEventListener('keypress', (event) => {
    if (event.which === 13 || event.keyCode === 13) {
		event.preventDefault();
		let matchString = document.getElementById('textfield').value.toLowerCase();
		let v = $("#jstree").jstree(true).get_json('#', {'flat': true});
		let idArray = [];
		let parentSizes = {};
		let parentIDs = [];
		let officialCount = {};
		for (let i = 0; i < v.length; i++) {
			let z = v[i];
			let text = z["text"].toLowerCase();
			let id = z["id"];
			idArray.push(id);
			let hideNode = $('#jstree').jstree(true).get_node(id);
			if (text != matchString) {
				$("#jstree").jstree(true).show_node(hideNode);
			}
		}	
		idArray = [];
		parentSizes = {};
		parentIDs = [];

		for (let i = 0; i < v.length; i++) {
    		let z = v[i];
    		let text = z["text"].toLowerCase();
			let id = z["id"];
			idArray.push(id);
			let hideNode = $('#jstree').jstree(true).get_node(id);
			
			if (!text.includes(matchString) && text.includes("conversation with")) {
				let parent = $('#jstree').jstree(true).get_parent(id);
				if (parentIDs.indexOf(parent) <= -1) {
    				parentIDs.push(parent);
				}				
				$("#jstree").jstree(true).hide_node(hideNode);

				if (!parentSizes.hasOwnProperty(parent)) {
					parentSizes[parent] = 1;
				} else {
					parentSizes[parent]++;
				}
			}
		}

		for (let i = 0; i < Object.size(dateObject); i++) {
			let numInnerArrays = Object.size(dateObject[parentIDs[i]]);
			officialCount[parentIDs[i]] = numInnerArrays;
		}


		for (let i = 0; i < parentIDs.length; i++) {
			let parent = parentIDs[i];
			let parentNode =  $('#jstree').jstree(true).get_node(parent);
			let children = $('#jstree').jstree(true).get_children_dom(parentNode);
			
			if (parentSizes[parent] == officialCount[parent]) {
				$("#jstree").jstree(true).hide_node(parentNode);
			}
		}
	}
});

//Parses over the hist files and creates date object and messages array to create tree later on.
function parser(callback)  {
	let finalCounter = 0;	
	fs.readdir(fPath, function (err, files) {
    	if (err) {
			alert("You entered an invalid username");
			console.log(p)
			ipc.send('invalidUsername')
		}
		files.map(function (file) {
        	return path.join(fPath, file);
		}).filter(function (file) {
			return fs.statSync(file).isFile();
		}).forEach(function (file) {
    		fileArray.push(path.basename(file));
    		fileArray.sort();
		});
		fileArray.forEach(function(file) {
        	fs.exists(fPath + file, function(fileok) {
            	if(fileok) {
                	fs.readFile(fPath + file, function(error, data) {
						let dataString = String(data);
                    	let indexOne = dataString.indexOf("Conversation with");
                    	let indexTwo = dataString.indexOf("Document generated by Office Communicator conversation history archiver");
                    	let conversationString = dataString.substring(indexOne, indexTwo).trim();
                    	let filelocation = fPath + file;
                    	let dateAndTime = "" + fs.statSync(filelocation).mtime;
                    	let peopleinConversationString = cleanString(conversationString.substring(0, conversationString.length - 77)).trim();
                    	let conversationWithString = cleanString(conversationString.substring(0, conversationString.length - 77)).trim() + " " + dateAndTime.substring(4, dateAndTime.lastIndexOf(":") + 3);
						
						let date = dataString.substring(0, dataString.indexOf("\n \n \n"));
						let main = dataString.substring(dataString.indexOf("<head"), dataString.lastIndexOf("</html>"));
						let head = dataString.substring(0, dataString.indexOf("<head"));

						if (head.includes("Missed")) {
							head = head.substring(head.indexOf("Missed"),(head.indexOf("<html") - 8));
							if (head.contains("conversation")) {
								head = "Conversation " + head.substring(head.indexOf("with"));
							}
						} else {
							head = head.substring(head.indexOf("Conversation"), (head.indexOf("<html") - 8));
						}
						head = head.trim();
						dataString = date + main;
						
						messagesArray[conversationWithString] = dataString;
                    	conversationArray.push(conversationWithString);
                   		let sorted = conversationArray.map(convoIndex => {
							let s = convoIndex.split(' ');
                        	let name = s.slice(2,-4).join(" ").trim();
                        	let d = s.splice(-4, 3);
                        	let join = d.join(' ');
                        	let date = moment(d.join(' '), 'MMMM do, YYYY h:mm').toDate();
                        	let text = s.join(' ');
                        	let people = peopleinConversationString.substring(18).trim();
							if (convoIndex.includes("Missed")) {
								convoIndex = convoIndex.substring(convoIndex.lastIndexOf("Missed"));
								name = name.substring(name.indexOf("with") + 5) + " (Missed)";
							}
                        	if (!dateObject.hasOwnProperty(join)) {
                            	dateObject[join] = {};
                            	if (!dateObject[join].hasOwnProperty(name)) {
                                	dateObject[join][name] = [];
                                	dateObject[join][name].push(convoIndex);
                            	} else {
                                	if (!dateObject[join][name].contains(convoIndex)) {
                                    	dateObject[join][name].push(convoIndex);
                                	}
                            	}
                        	} else {
                            	if (!dateObject[join].hasOwnProperty(name)) {
									dateObject[join][name] = [];
									dateObject[join][name].push(convoIndex);
                            	} else {
									if (!dateObject[join][name].contains(convoIndex)) {
										dateObject[join][name].push(convoIndex);
									}
                            	}
                        	}
                        	return { convoIndex, text, date };
                    	})
                    	.sort((a, b) => a.text.localeCompare(b.text) || (a.date - b.date))
                    	.map(convoIndex => convoIndex.convoIndex);
						conversationArray = sorted;
							
                	})
				} else {
					console.log("File not found.");
				}
       		});
    	});
	});
}
//Populates the JS tree using date object and messages array.
function populateTree() {
	let dateArray = [];
	let childArray = [];
	for (let y = 0; y < Object.size(dateObject); y++) {
		let object_z = dateObject[Object.keys(dateObject)[y]];
		for (let x = 0; x < Object.size(object_z); x++) {
			//Sort the inner date object first.
			let innerArr = object_z[Object.keys(object_z)[x]];
			let sorted2 = innerArr.map(item => {
				let s2 = item.split(' ');
				let d2 = s2.splice(-4);
				let date2 = moment(d2.join(' '), 'MMMM do, YYYY h:mm').toDate();
				let text2 = s2.join(' ');
				return { item, text2, date2 };
			})
			.sort((a, b) => a.text2.localeCompare(b.text2) || (a.date2 - b.date2))
			.map(item => item.item);
			object_z[Object.keys(object_z)[x]] = sorted2;
			let totalString = "";
			let i = 0;
			while ( i < innerArr.length) {
				if (!totalString.includes(messagesArray[innerArr[i]])) {
					totalString = totalString + messagesArray[innerArr[i]];
				}
				i++;
			}
			let tempArr = innerArr[0].split(" ");
			tempArr.pop();
			let innerText = tempArr.join(' ');
			finalObject[innerText] = totalString;


			//Add nodes to jstree.
			let existingIDs = [];
			for (let i = 0; i < Object.size(innerArr); i++) {
				let tempArr = innerArr[0].split(" ");
				tempArr.pop();
				let date = tempArr.slice(-3).join(" ");
				if (!dateArray.contains(date)) {
					$('#jstree').jstree().create_node('#' ,  { "id" : date, "text" : date } );
					dateArray.push(date);
				}
				let newTextArr = innerArr[i].split(" ");
				newTextArr.pop();
				let newTextStr = newTextArr.join(" ").trim();
				if (existingIDs.indexOf(newTextStr) <= -1) {
					existingIDs.push(newTextStr);
					let childTextArr = innerArr[i].split(" ");
					childTextArr.pop();
					let childTextStr = childTextArr.join(" ");
					$('#jstree').jstree().create_node(date ,  { "id" : innerArr[i], "text" : childTextStr  });
				}

			}

		}
	}
}

//Open the tree nodes when clicked.
$("#jstree").on("click", ".jstree-anchor", function(e) {
	let node = $("#jstree").jstree(true).get_node($(this));
	let id = node.id;
	if (id.includes(":")) {
		document.getElementById('messages').innerHTML = finalObject[id.substring(0, id.length - 9).trim()];
	} else {
		let isOpen = $("#jstree").jstree(true).get_json(node).state.opened;
		if (isOpen == false) {
			$("#jstree").jstree(true).open_node(node);
		} else {
			$("#jstree").jstree(true).close_node(node);
		}
	}
});

$.when(parser()).done(function() {
	console.log(messagesArray);
    setTimeout(populateTree, 300);
});