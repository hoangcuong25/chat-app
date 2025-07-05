import express from 'express';
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from '../controller/messageController.js';

const messageRouter = express.Router();

messageRouter.get("/users", getUserForSidebar)
messageRouter.get("/:id", getMessages);
messageRouter.get("/mark/:id", markMessageAsSeen);
messageRouter.post("/send/:id", sendMessage)
