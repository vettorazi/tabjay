// let socket = io();
const socket = io.connect(window.location.origin);//webrtc
// const video = document.querySelector("video");

let canvas = document.getElementById('Viewer');
let ctx = canvas.getContext('2d');

let canvasVideo = document.getElementById('Video');
let ctxVideo = canvasVideo.getContext('2d');

let loadVideobt = document.getElementById('buttonid');
let video;
let cues=[
  {button:0, cue:0, set:false},
  {button:1, cue:0, set:false},
  {button:2, cue:0, set:false},
  {button:3, cue:0, set:false},
  {button:4, cue:0, set:false},
  {button:5, cue:0, set:false},
  {button:6, cue:0, set:false},
  {button:7, cue:0, set:false},
];
let factor = 20;
let screens = [
    // {x:450, y:100, width:2060, height:850},
];


function setCue (item){
  console.log(item)
    if(item.set){
      video.currentTime = item.cue
    }else{
      item.cue = video.currentTime
      item.set = true
      //TODO: screenshot canvas and use as bt image
    }
}

function setVideo(){
 //create video element and load video.
 video = document.createElement("video");
 video.setAttribute("id", "video");
 video.setAttribute("autoplay", "true");
 video.setAttribute("muted", "true");
 video.setAttribute("playsinline", "true");
 video.setAttribute("controls", "false");
 video.setAttribute("loop", "true");
 video.setAttribute("style", "width:550px;height:350px; display:none;");
 video.src='./videos/video2.mp4';
 document.body.appendChild(video);
//  socket.emit("broadcaster");
 //FIX VIDEO SIZE AND SHOW IN THE CANVAS:
 video.addEventListener('loadedmetadata', function() {
   canvasVideo.width = 560;//video.videoWidth;
   canvasVideo.height = 350;//video.videoHeight;
 });
 
 video.addEventListener('play', function() {
   var $this = this; //cache
   (function loop() {
     if (!$this.paused && !$this.ended) {
       //TODO: create state of pressing or not.
       ctxVideo.drawImage($this, 0, 0, 560, 350);
       setTimeout(loop, 1000 / 30);
     }
   })();
 }, 0);
}



loadVideobt.addEventListener('click', () => {
    console.log("load video");
 setVideo();
});

//assign all buttons and cues
let bt1 = document.getElementById('bt1');
let bt2 = document.getElementById('bt2');
let bt3 = document.getElementById('bt3');
let bt4 = document.getElementById('bt4');
let bt5 = document.getElementById('bt5');
let bt6 = document.getElementById('bt6');
let bt7 = document.getElementById('bt7');

bt1.addEventListener('click', ()=>{setCue(cues[0])});
bt2.addEventListener('click', ()=>{setCue(cues[1])});
bt3.addEventListener('click', ()=>{setCue(cues[2])});
bt4.addEventListener('click', ()=>{setCue(cues[3])});
bt5.addEventListener('click', ()=>{setCue(cues[4])});
bt6.addEventListener('click', ()=>{setCue(cues[5])});
bt7.addEventListener('click', ()=>{setCue(cues[6])});






socket.on('removeScreen', (id) => {
    // screens.splice(screens.indexOf(id), 1);
    pos = screens.map(function(obj) { return obj.id; }).indexOf(id);
    screens.splice(pos, 1);
    document.getElementById(id).remove();
    //delete div and all children:
    console.log("A screen got unplugged!", id, pos);
    draw();
})

socket.on("newScreen", (id) => {
console.log('new screen received:' + id.width,  id.height);
appendItemList(id);
addScreenToCanvas(id);
draw();
});

function addScreenToCanvas(id){
    screens.push({id:id.id, x:0, y:0, width:id.width, height:id.height})
}

function appendItemList(id){
let div = document.createElement("div");
div.setAttribute("class", "screen-user");
div.setAttribute("id", id.id);
document.getElementsByClassName("right-panel")[0].appendChild(div);

let socketName_txt = document.createElement("div");
socketName_txt.setAttribute("class", "text-block");
socketName_txt.innerHTML = id.id;
div.appendChild(socketName_txt);

let screenres_txt = document.createElement("div");
screenres_txt.setAttribute("class", "text-block");
screenres_txt.innerHTML = "y:"+id.width + " x:" + id.height;
div.appendChild(screenres_txt);

//create a button with the classname of "button w-button":
let button = document.createElement("button");
button.setAttribute("class", "button w-button");
button.setAttribute("id", "bt"+id.id);
button.innerHTML = "Move it";
div.appendChild(button);
}

//////CANVAS SCREEN MANIPULATION

let canvasSize = {width:560, height:350};


// variables used to get mouse position on the canvas
var $canvas = $("#Viewer");
var canvasOffset = $canvas.offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var scrollX = $canvas.scrollLeft();
var scrollY = $canvas.scrollTop();

var startX;
var startY;

function convertsizetoCanvas(width, height){
    return {width:width/factor, height:height/factor}
}

function drawScreen(x, y, width, height){
    ctx.beginPath();
    let proportionalScreen = convertsizetoCanvas(width, height);
    ctx.rect(x, y, proportionalScreen.width, proportionalScreen.height);
    var gradient = ctx.createLinearGradient(0, 0, 560, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5" ,"blue");
    gradient.addColorStop("1.0", "red");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.stroke();
}

var selectedScreen = -1;

draw();

// clear the canvas draw all screens in the canva
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < screens.length; i++) {
        let screen = screens[i];
        drawScreen(screen.x, screen.y, screen.width, screen.height);
    }
}

function textHittest(x, y, textIndex) {
    var area = screens[textIndex];
    return (x >= area.x && x <= area.x + (area.width/factor) && y <= area.y + area.height/factor && y >= area.y);
}


function handleMouseDown(e) {
    e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    for (var i = 0; i < screens.length; i++) {
        if (textHittest(startX, startY, i)) {
            selectedScreen = i;
        }
    }
}

function handleMouseUp(e) {
    e.preventDefault();
    selectedScreen = -1;
}

function handleMouseOut(e) {
    e.preventDefault();
    selectedScreen = -1;
}

let onMouseLeaveCommand={};
function handleMouseMove(e) {
    if (selectedScreen < 0) {
        onMouseLeaveCommand='';
        return;
    }
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    var dx = mouseX - startX;
    var dy = mouseY - startY;
    startX = mouseX;
    startY = mouseY;
    var screen = screens[selectedScreen];
    screen.x += dx;
    screen.y += dy;
    draw();
    onMouseLeaveCommand = {screen: screens[selectedScreen].id, width: screen.width/factor, height: screen.height/factor, x: screen.x, y: screen.y};
}

// listen for mouse events
$("#Viewer").mousedown(function (e) {
    handleMouseDown(e);
});
$("#Viewer").mousemove(function (e) {
    handleMouseMove(e);
});
$("#Viewer").mouseup(function (e) {
    handleMouseUp(e);
    if(onMouseLeaveCommand==''){
        return;
    }
    socket.emit("changeScreen", onMouseLeaveCommand);
    console.log(onMouseLeaveCommand)
});
$("#Viewer").mouseout(function (e) {
    handleMouseOut(e);
});

//webrtc

//broadcast
const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};


// Media contrains
const constraints = {
  video: { facingMode: "user" }
  // Uncomment to enable audio
  // audio: true,
};
let euvideo = document.getElementById("eu");
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    euvideo.srcObject = stream;
    socket.emit("broadcaster");
  })
  .catch(error => console.error(error));


socket.on("watcher", id => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;
  
    // let stream = video.captureStream();
    let stream = euvideo.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    // const videoTracks = stream.getVideoTracks();
    // console.log(videoTracks)
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  
    peerConnection
      .createOffer()
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", id, peerConnection.localDescription);
      });
  });
  
  socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
  });
  
  socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on("disconnectPeer", id => {
    peerConnections[id].close();
    delete peerConnections[id];
  });

  window.onunload = window.onbeforeunload = () => {
    socket.close();
  };
  

//////USELESS SHIT//////



//create video element and hide it
// var video = document.createElement("video");
// video.setAttribute("id", "video");
// video.setAttribute("autoplay", "true");
// video.setAttribute("muted", "true");
// video.setAttribute("playsinline", "true");
// video.setAttribute("style", "display:none");
// document.body.appendChild(video);


/// function to convert a stream of video to canvas:


//buttons need to load a video:
// var videoButton = document.getElementById("videoButton");
// videoButton.addEventListener("click", function() {
// });


// document.getElementById('buttonid').addEventListener('click', openDialog);
// function openDialog() {
//   inputElement.click();
// }

// inputElement.onchange = function(event) {
//   // fileList = inputElement.files;
//   document.getElementById('buttonid').style.display = 'none';
//   assignVideoToButton(inputElement.files[0], 0);
// }

// function assignVideoToButton(file, button){
  
//   var video = document.createElement("video");
//   video.setAttribute("id", "video");
//   video.setAttribute("autoplay", "true");
//   video.setAttribute("muted", "true");
//   video.setAttribute("playsinline", "true");
//   video.setAttribute("style", "width:100%;height:100%;");
//   video.src= URL.createObjectURL(file);
//   let videosbtn = document.getElementsByClassName('video-bt')[button];
//   console.log(videosbtn)
//   videosbtn.appendChild(video);
// // set canvas size = video size when known
//   video.addEventListener('loadedmetadata',videoToCanvas(video));
// }


// function changeSource(newVideoSource){
//     document.getElementById("Embeded_Video").removeAttribute("src");
//     document.getElementById("Embeded_Video").setAttribute("src", newVideoSource+".mp4");
//     document.getElementById("Embeded_Video").setAttribute("src", newVideoSource+".ogv");
//     document.getElementById("Embeded_Video").load();
//     document.getElementById("Embeded_Video").play();
//  });
//when tap on a button, the video element will change to the assigned video
