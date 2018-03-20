const electron = require('electron')

// Module to create native browser window.

const app = electron.app
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const shell = electron.shell;
const ipc = electron.ipcMain;

//default menu that we can modify
const defaultMenu = require('electron-default-menu')

const path = require('path')
const url = require('url')
const config = require('config')

//hot reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

//added so we can right-click inspect element for debugging
require('electron-context-menu')()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createMainWindow () {
  // Create the browser window, see this for properties: http://electron.atom.io/docs/api/browser-window/
  mainWindow = new BrowserWindow({
		height: 325,
		width: 325,
		resizable: false,
		title: "Lync Archive Viewer v.1.0"
	});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function createAboutWindow () {
  // Create the browser window, see this for properties: http://electron.atom.io/docs/api/browser-window/
  let aboutWindow = new BrowserWindow({ 
    title: 'About', 
    width: 600, 
    height: 200, 
    parent: mainWindow, 
    modal: true, 
    center: true, 
    resizable: false, 
    minimizable: false, 
    maximizable: false,
    autoHideMenuBar: true
  })

  // and load the about.html of the app.
  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/about.html'),
    protocol: 'file:',
    slashes: true
  }))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',  () => {

  //this will load a default menu we loaded from a node module, we can then customize it here:
  const menu = defaultMenu(app, shell);

  // Add custom menu 
  menu[3].submenu.push({
    label: 'About',
    click: (item, focusedWindow) => {
      createAboutWindow()
    }
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  createMainWindow()
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow()
  }
})
ipc.on('enter-clicked', (event, arg) => {
                chatWindow = new BrowserWindow({
                                height: 620,
                                width: 860,
                                title: "Lync Archive Viewer v.1.0"
                });
                chatWindow.setMenu(null);
                chatWindow.loadURL(`file://${__dirname}/app/chat.html?${arg}`);
                chatWindow.on('closed', _ => {
                  chatWindow = null;
                })
                mainWindow.close()
                //chatWindow.openDevTools();
                chatWindow.maximize();
                chatWindow.reload();
                chatWindow.show();
                chatWindow.reload();
})

ipc.on('invalidUsername', _ => {
                chatWindow.close();
                app.relaunch()
})

ipc.on('refresh-clicked', _ => {
  chatWindow.reload();
})
