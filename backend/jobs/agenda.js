const Agenda = require("agenda");

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URL,
        collection: 'agendaJobs'
    },
    processEvery: "1 second",
    defaultLockLifetime: 300000
})


 
module.exports = agenda