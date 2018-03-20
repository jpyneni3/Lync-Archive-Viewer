const electron = require('electron');
const ipc = electron.ipcRenderer;


document.getElementById('cancel').addEventListener('click', _ => {
	ipc.send('cancel-clicked');
})