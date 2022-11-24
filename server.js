const express = require("express")
const cors = require("cors")
const app = express()

const path = require('path')
app.use('/',express.static(path.join(__dirname, "/public")))
app.use(cors())

const http = require("http").createServer(app)

const port = process.env.PORT || 3000;

const server = app.listen(port)

console.log("Server is running on http://localhost:" + port)

const io = require("socket.io")(http, {'pingTimeout': 120000, 'pingInterval': 125000, 'upgradeTimeout': 60000}).listen(server)
let peers = {}
function main() {
    setupSocketServer()
    setInterval(() => {
        io.sockets.emit("positions", peers)
    }, 5)
}

main();

function setupSocketServer() {

    io.on("connection", (socket) => {
        console.log(
            "Peer joined with ID",
            socket.id,
            ". There are " +
            io.engine.clientsCount +
            " peer(s) connected."
          );

        peers[socket.id] = {
            position: [0, 0.5, 0],
            rotation: [0, 0, 0, 1]
        }

        socket.emit("introduction", Object.keys(peers))

        socket.emit("userPositions", peers)

        io.emit("newUserConnected", socket.id)

        socket.on("move", (data) => {
            if(peers[socket.id]) {
                peers[socket.id].position = data[0]
                peers[socket.id].rotation = data[1]
            }
        })

        socket.on("signal", (to, from, data) => {
            if(to in peers) {
                io.to(to).emit("signal", to, from, data)
            } else {
                console.log("Peer not found")
            }
        })

        socket.on("disconnect", () => {
            delete peers[socket.id]
            io.sockets.emit(
                "userDisconnected",
                io.engine.clientsCount,
                socket.id,
                Object.keys(peers)
              );
            console.log("A User " + socket.id + " has been disconnected")
        })
    })

}
