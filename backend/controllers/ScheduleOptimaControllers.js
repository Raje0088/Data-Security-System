const cron = require('node-cron');
const { scheduleOptimaModel } = require("../models/ScheduleOptima");
const { userProgressSummaryModel } = require("../models/userProgressSummaryModel")
const todayDate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = now.getDate()
  return `${yyyy}-${mm}-${dd}`;
}


const setGoals = async (req, res) => {
  try {
    const { userId, date, deadline, goals, time } = req.body;


    if (!userId || !date || !time || !goals) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // console.log("goals bolte", goals);

    let goalsMap = new Map([
      ["New Data Add", "new_data_db"],
      ["No of New Calls", "new_calls_db"],
      ["Leads", "leads_db"],
      ["Demo" , "demo_db"],
      ["Follow Up" , "followUp_db"],
      ["Target", "target_db"],
      ["Training", "training_db"],
      ["Installation", "installation_db"],
      ["Recovery", "recovery_db"],
      ["Support", "support_db"],
    ])

    const transformGoals = {};
    for (const prod in goals) {
      transformGoals[prod] = {};
      for (const taskLabel in goals[prod]) {
        const mappedField = goalsMap.get(taskLabel)
        if (mappedField) {
          transformGoals[prod][mappedField] = {
            assigned_db: Number(goals[prod][taskLabel]),
            completed_db: 0,
          }
        }
      }
    }
    // console.log("transfrom", transformGoals)

    const alreadyExists = await scheduleOptimaModel.findOne({ userId_db: userId, date_todo_db: date })

    if (alreadyExists) return res.status(409).json({ message: "goal Schedule already" })

    const [timee, modifier] = deadline.split(" ");
    const [hh, mm, ss] = timee.split(":")

    if (!["AM", "PM"].includes(modifier)) {
      return res.status(400).json({ message: "Time format wrong selected" });
    }

    let hour = parseInt(hh, 10);
    if (modifier === "PM" && hour !== 12) {
      hour += 12;
    }
    if (modifier === "AM" && hour === 12) {
      hour = 0;
    }
    const newDeadline = `${String(hour).padStart(2, "0")}:${mm}:${ss}`;
    const [hr, min, sec] = newDeadline.split(":").map(Number);

    const utcDeadline = new Date(`${date}T${newDeadline}Z`);


    // Just for logging / optional storage (local date)
    const fullDeadline = new Date(date + "T" + newDeadline); // local time (might vary by server)

    console.log("Deadline (user input):", deadline);
    console.log("Parsed 24hr:", newDeadline);
    console.log("cron_deadline_db (UTC):", utcDeadline.toISOString());


    console.log("fulldeadline", fullDeadline)
    const finalSchedule = await scheduleOptimaModel.create({
      userId_db: userId,
      date_todo_db: date,
      deadline_db: deadline || "23:59:00",
      cron_deadline_db: utcDeadline,
      goals_db: transformGoals,
      time_db: time,
      isLocked_db: false,
      goal_status_db: "active",
    })
    res.status(200).json({ message: "goals schedule", data: finalSchedule })
  } catch (err) {
    console.log("internal error", err)
    res.status(500).json({ message: "internal error", err: err.message })
  }
}

// USER SCHEDULE GOALS LOCKS AFTER DEADLINE
cron.schedule('* * * * *', async () => {
  const now = new Date();

  const result = await scheduleOptimaModel.updateMany({
    isLocked_db: false,
    cron_deadline_db: { $lt: now },
  },
    { $set: { isLocked_db: true } }
  )
  if (result.modifiedCount > 0) {
    console.log(`✅ Cron: Locked ${result.modifiedCount} expired schedules.`);
  }
});


//GET REQUEST USED TO DISPLAY ASSING AND COMPLETED TASK ON FRONTEND
const getScheduleOptima = async (req, res) => {
  try {
    const userId = req.params.id;
    const curr_date = new Date().toISOString().split("T")[0]

    const result = await scheduleOptimaModel.findOne({ userId_db: userId,date_todo_db:curr_date})
    res.status(200).json({ message: `${userId} todays  goals report`, result })
  } catch (err) {
    console.log("internal  error", err)
    res.status(500).json({ message: "internal error", err: err.message })
  }
}

// USER COMPLETED COUNT UPDATE AND SHOW ON FRONTEND 
cron.schedule("0 23 * * *", async () => {
  try {
    const today = new Date().toLocaleDateString("en-GB");
    const today_todo = todayDate()

    const userProgressDoc = await userProgressSummaryModel.find({ date_db: today })
    // console.log("userProgressDoc", userProgressDoc)
    for (const userDoc of userProgressDoc) {
      // console.log("userDoc", userDoc)
      const userId = userDoc.userId_db;
      const product = userDoc.product_db;
      const totalDemo = userDoc.demo_completed_db
      const totalInstallation = userDoc.installation_completed_db
      const totalNewCall = userDoc.no_of_new_calls_completed_db
      const totalRecovery = userDoc.recovery_completed_db
      const totalSupport = userDoc.support_completed_db
      const totalTarget = userDoc.target_completed_db
      // console.log("=>", userId, product, totalDemo, totalInstallation,
      //   totalNewCall, totalRecovery, totalSupport, totalTarget)


      const updateSchema = await scheduleOptimaModel.updateOne(
        {
          userId_db: userId,
          date_todo_db: today,
          // [`goals_db.${goalProd}`]: { $exists: true },
        },
        {
          $set: {
            [`goals_db.${product}.no_of_new_calls_db.completed_db`]: totalNewCall,
            [`goals_db.${product}.demo_db.completed_db`]: totalDemo,
            [`goals_db.${product}.installation_db.completed_db`]: totalInstallation,
            [`goals_db.${product}.target_db.completed_db`]: totalTarget,
            [`goals_db.${product}.recovery_db.completed_db`]: totalRecovery,
            [`goals_db.${product}.support_db.completed_db`]: totalSupport,
          }
        },
        { new: true }
      )

      // console.log("updateSchema", updateSchema)
      // }
    }

    console.log("✅ CRON completed goal Status update at", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ CRON error:", err.message);
  }
});
module.exports = { setGoals, getScheduleOptima }