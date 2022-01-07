const socket = io.connect(window.location.origin);
// var socket = io();

socket.on("screenRequest", ()=>{
socket.emit("screenSize", {width:window.innerWidth, height:window.innerHeight});
});

socket.on("newScreen", (id) => {
    console.log('new screen received:' + id.width,  id.height);
});




    ///WEBRTC
    let peerConnection;
    const config = {
      iceServers: [
          { 
            "urls": "stun:stun.l.google.com:19302",
          },
          // { 
          //   "urls": "turn:TURN_IP?transport=tcp",
          //   "username": "TURN_USERNAME",
          //   "credential": "TURN_CREDENTIALS"
          // }
      ]
    };
    const video = document.querySelector("video");
    
socket.on("offer", (id, description) => {
  console.log("offer received");
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    console.log("ontrack");
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  console.log("candidate received");
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  console.log("connected");
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};
