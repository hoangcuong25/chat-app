import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {origin: "*"}
})

export const userSocketMap = {}

io.on("connection", () => {
    const userId = socket.hanshake.query.userId

    if (userId) userSocketMap[userId] = socket.userId

    io.emit("getOnlineUser", Object.keys(userSocketMap))

    socket.on("disconnect", ()=> {
        delete userSocketMap[userId]
        io.emit("getOnlineUser", Object.keys(userSocketMap))
    })
})

app.use(express.json({ limit: '4mb' }));
app.use(cors())

app.use("/api/status", (req, res) => res.send("Server is running!"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));