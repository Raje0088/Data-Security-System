const mongoose = require("mongoose")

const goalsSchema = new mongoose.Schema({
    assigned_db: { type: Number, required: true },
    completed_db: { type: Number, default: 0 },

}, { _id: false }) //avoids unnecessary subdocument_id


const productTaskSchema = new mongoose.Schema({
  new_calls_db: goalsSchema,
  new_data_db: goalsSchema,
  leads_db: goalsSchema,
  demo_db: goalsSchema,
  installation_db: goalsSchema,
  training_db: goalsSchema,
  target_db: goalsSchema,
  recovery_db: goalsSchema,
  support_db: goalsSchema,
  followUp_db: goalsSchema,
}, { _id: false });

const scheduleOptimaSchema = new mongoose.Schema({
  userId_db: String,
  date_todo_db: String,
  time_db: String,
  deadline_db: String,
  cron_deadline_db: Date,
  isLocked_db: { type: Boolean, default: false },
  goal_status_db: { type: String, default: "active" },
  goals_db: {
    type: Map,
    of: productTaskSchema,
  }
}, { timestamps: true });


const scheduleOptimaModel = mongoose.model("ScheduleOptimaModel", scheduleOptimaSchema)
module.exports = { scheduleOptimaModel }
