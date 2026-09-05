const agenda = require("./agenda.js")
const { getIO } = require("../socketio/socketInstance");

agenda.define(
    'send-reminder',
    { concurrency: 1 },
    async (job) => {
        const { assignTo, message } = job.attrs.data;
        console.log("sending reminder", message)
        const io = getIO()
        io.to(`userRoom:${assignTo}`).emit("reminder-popup", { message })

        await new Promise((resolve) => setTimeout(resolve, 2000))
    }
)


module.exports = agenda