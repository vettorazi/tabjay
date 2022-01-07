const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let broadcaster;
let userList = [];
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/controller", (req, res) => {
    res.sendFile(__dirname + "/controller.html");
});

io.on("connection", (socket) => {

    console.log('NEW USER CONNECTED', socket.id);
    io.to(socket.id).emit("screenRequest");
    
    socket.on('screenSize', (data) => {
        console.log(data.width)
        socket.broadcast.emit('newScreen', { id: socket.id, width: data.width, height: data.height });
    });

    socket.on("disconnect", (id) => {
        console.log("A screen got unplugged!", socket.id);
        socket.to(broadcaster).emit("disconnectPeer", socket.id);
        io.emit("removeScreen", socket.id);
    });

    //WEBRTC
    socket.on("watcher", () => {
        console.log("watcher connected");
        socket.to(broadcaster).emit("watcher", socket.id);
      });
    socket.on("broadcaster", () => {
      broadcaster = socket.id;
      console.log('broadcaster', broadcaster);
      socket.broadcast.emit("broadcaster");
    });  
    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
      });
    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
      });
      socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
      });


});




server.listen(3000, () => {
    console.log("listening on *:3000");
});



 /*
//viewer entra na pagina e manda um sinal com a sua proporcao de tela
//server manda de volta o sinal cropado da canvas ja na proporcao da tela do viewer
//viewer recebe o sinal cropado e desenha na canvas em full screen

*/