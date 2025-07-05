import {io, userSocketMap} from "../server"

export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user.id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password")

        const unseenMessages = {}
        const promises = filteredUsers.map(async () => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })

        await Promise.all(promises);
        res.status(200).json({
            users: filteredUsers,
            unseenMessages: unseenMessages,
            success: true
        });

    } catch (error) {
        console.error("Error in getUserForSidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params
        const myId = req.user.id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })

        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { $set: { seen: true } }
        );

        res.status(200).json({
            messages: messages,
            success: true
        });

    }
    catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params
        await Message.findbyIdAndUpdate(id, { seen: true });

        res.status(200).json({
            success: true,
            message: "Message marked as seen"
        });

    } catch (error) {
        console.error("Error in seenMessages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let imageUrl
        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image)
            imageUrl = uploadRes.secure_url
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        const receiverSocketId = userSocketMap[receiverId]
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessages", newMessage)
        }

        res.json({
            success: true,
            message: newMessage
        });

    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}