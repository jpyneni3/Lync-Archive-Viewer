const electron = require('electron')
const ipc = electron.ipcRenderer
const fs = require("fs");

document.getElementById('open').addEventListener('click', _ => {
    var userName = document.getElementById("form1").elements[0].value.trim();
    if (userName == "") {
        alert("Please enter valid username")
    } else {
         let lyncVersion = 0;
         let pathUser = `C:\\Users\\${userName}\\`;
          if(fs.existsSync(pathUser)) {
                checkLync(userName, lyncVersion)
            } else {
                alert("You entered an invalid username");
            }  
    }
});

function checkLync(userName, lyncVersion) {
     let pathLync = `C:\\Users\\${userName}\\AppData\\Local\\Microsoft\\Office\\${lyncVersion.toFixed(1)}\\Lync\\sip_${userName}@noblesys.com\\History` +  " Spooler\\";
     let correctPath = false;
     while(!correctPath) {
       if (fs.existsSync(pathLync)) {
           ipc.send('enter-clicked', pathLync);
           correctPath = true;
       } else {
           lyncVersion = lyncVersion + .1 
           pathLync = `C:\\Users\\${userName}\\AppData\\Local\\Microsoft\\Office\\${lyncVersion.toFixed(1)}\\Lync\\sip_${userName}@noblesys.com\\History` +  " Spooler\\";
       }
     }
   
}       
            
document.addEventListener('keypress', (e) => {
    if (e.which === 13 || e.keycode === 13) {
        e.preventDefault();
        var userName = document.getElementById("form1").elements[0].value.trim();
        if (userName == "") {
            alert("Please enter valid username")
        } else {
            let lyncVersion = 0;
            let pathUser = `C:\\Users\\${userName}\\`;
            if(fs.existsSync(pathUser)) {
                checkLync(userName, lyncVersion)
            } else {
                alert("You entered an invalid username");
            }       

        }
    }
});



