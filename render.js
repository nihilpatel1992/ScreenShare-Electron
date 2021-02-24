// JavaScript source code
const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

const currentWin = remote.BrowserWindow.getFocusedWindow();
const windowRect = currentWin.getBounds();
let frm;
let myTimer;
let localVideo;
var sourceoffset;

//let pageHeight = (document.querySelector("body").clientHeight);
//let html = document.querySelector("html");
//html.clientHeight = Math.ceil(pageHeight);
//let margin = 9;
//let electronWindowHt = Math.ceil(pageHeight) + margin;
//ipcRenderer.send('dom-ready-command', electronWindowHt);

const remoteCanvas = document.getElementById('remoteCanvas');
const ctx = remoteCanvas.getContext('2d');

const button = document.getElementById('startButton');
button.onclick = getVideoSources;

const stopButton = document.getElementById('stopButton');
stopButton.onclick = stopScreenSharing;

const partOfScreenBtn = document.getElementById('partOfScreenBtn');
partOfScreenBtn.onclick = showframe;

openSelectionWindow();

// Get the available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: {
            width: 150,
            height: 150
        }
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

function openSelectionWindow() {
    var displays = remote.screen.getPrimaryDisplay().bounds;

    frm = new remote.BrowserWindow({
        show: false,
        title: "windowselection",
        width: 300,
        height: 245,
        minWidth: 250,
        minHeight: 200,
        maxHeight: window.outerHeight,
        maxWidth: window.outerWidth,
        maximizable: false,
        minimizable: false,
        closable: false,
        titleBarStyle: "hidden",
        autoHideMenuBar: true,
        skipTaskbar: true,
        resizable: false,
        alwaysOnTop: true,
        //backgroundColor: "#a5abb0",
        //fullscreen:true,
        transparent: true,
        frame: false,
        //x: displays.x + 50,
        //y: displays.y + 50,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    })

    //frm.setPosition(0, 0);
    let previousBounds;

    frm.on('move', function (event) {
        sourceoffset = event.sender.getBounds();
        console.log(sourceoffset);

        let frmBounds = frm.getBounds();
        let seterBounds = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }

        if (frmBounds.x <= 0) {
            seterBounds = frmBounds;
            seterBounds.x = 0;
            frm.setBounds(seterBounds);
        }
        if (frmBounds.y <= 0) {
            seterBounds = frmBounds;
            seterBounds.y = 0;
            frm.setBounds(seterBounds);
        }

        let calWidth = frmBounds.x + frmBounds.width;
        let calHeight = frmBounds.y + frmBounds.height;

        if (calWidth >= displays.width) {
            seterBounds = previousBounds;
            seterBounds.x = previousBounds.x;
            frm.setBounds(seterBounds);
        } else {
            previousBounds = frmBounds;
        }

        if (calHeight >= displays.height) {
            seterBounds = previousBounds;
            seterBounds.y = previousBounds.y;
            frm.setBounds(seterBounds);
        } else {
            previousBounds = frmBounds;
        }

    });

    frm.on('resize', function (event) {
        sourceoffset = event.sender.getBounds();
        console.log(sourceoffset);

        let frmBounds = frm.getBounds();
        let seterBounds = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }

        if (frmBounds.x <= 0) {
            seterBounds = frmBounds;
            seterBounds.x = 0;
            frm.setBounds(seterBounds);
        }
        if (frmBounds.y <= 0) {
            seterBounds = frmBounds;
            seterBounds.y = 0;
            frm.setBounds(seterBounds);
        }

        let calWidth = frmBounds.x + frmBounds.width;
        let calHeight = frmBounds.y + frmBounds.height;

        if (calWidth >= displays.width) {
            seterBounds = previousBounds;
            seterBounds.x = previousBounds.x;
            frm.setBounds(seterBounds);
        } else {
            previousBounds = frmBounds;
        }

        if (calHeight >= displays.height) {
            seterBounds = previousBounds;
            seterBounds.y = previousBounds.y;
            frm.setBounds(seterBounds);
        } else {
            previousBounds = frmBounds;
        }
    });
}


async function showframe() {
    frm.loadFile('frame.html')
    frm.once('ready-to-show', () => {
        frm.show();
    });

    const inputSources = await desktopCapturer.getSources({
        types: ['screen'],
    });

    const entireScreenSource = inputSources.find(
        source => source.name === "Entire Screen" || source.name === "Screen 1"
    );
    selectSource(entireScreenSource);
}

// Change the videoSource window to record
async function selectSource(source) {

    button.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id,

            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    localVideo = document.createElement("video");
    localVideo.srcObject = stream;
    localVideo.autoplay = true;


    continuesStreamToCanvas();

    //// Preview the source in a video element
    //const remoteVideo = document.getElementById('remoteVideo');
    //remoteVideo.srcObject = stream;
    //remoteVideo.play();
}

function continuesStreamToCanvas() {
    myTimer = setInterval(() => {
        videoLoop();
    }, 1000 / 30);
}

function videoLoop() {
    if (localVideo.readyState >= 2) {
        //ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
        ctx.drawImage(localVideo, sourceoffset.x, sourceoffset.y, sourceoffset.width, sourceoffset.height, 0, 0, sourceoffset.width, sourceoffset.height - 95); //320, 0, 320, 180, 0, 0, 640, 360
    }
}

// Stop Screen Sharing
function stopScreenSharing() {
    frm.closable = true;
    frm.close();
    clearInterval(myTimer);
    ctx.clearRect(0, 0, remoteCanvas.width, remoteCanvas.height);
    openSelectionWindow();

}


