const socketIO = require("socket.io")
let io;

function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "*", // Your frontend port
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        //executive joins their personal room
        socket.on("joinRoom", ({ userId, roleType }) => {

            if (!userId) {
                console.log("❌ joinRoom rejected:", data);
                return;
            }

            socket.join(`userRoom:${userId}`);
            console.log(`${userId} joined their room`)

            if (roleType === "Admin") {
                socket.join("ADMIN")
                console.log("joined admin") 
            }

            if (roleType === "Superadmin") {
                socket.join("SUPERADMIN")
                console.log("joined superadmin")
            }
        })


        socket.on("remainder", (data) => {
            console.log("remdinder data============>", data)
            io.to(`userRoom:${data.userId}`).emit("userSpecificRemainder", data)
            io.to("ADMIN").emit("adminReminder", data);
            io.to("SUPERADMIN").emit("superadminReminder", data)
        })

        socket.on("remindUser", (data) => {
            console.log("Reminder requested for:", data);
            io.to(`userRoom:${data.assignTo}`).emit("userReminder", data)
        })

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        })
    })

    return io;
}

module.exports = { initializeSocket, getIO: () => io };