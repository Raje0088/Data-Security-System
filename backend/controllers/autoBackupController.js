const { autoBackupEmailModel } = require("../models/autoBackupModel")
const mongoose = require("mongoose")
const fs = require("fs");
const cron = require('node-cron');
const _ = require("lodash");
const { exec } = require("child_process")
const unzipper = require("unzipper")
const path = require("path")
const nodemailer = require("nodemailer")
const archiver = require("archiver")
const { spawn } = require("child_process")
const { getIO } = require("../socketio/socketio")
const dotenv = require("dotenv");
dotenv.config();



const creatAutoBackupEmails = async (req, res) => {
    try {
        const { email, userId = "SA", senderEmail, password } = req.body;
        console.log("emai", email)
        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (senderEmail && senderEmail.trim() !== "") {
            if (!emailValidation.test(senderEmail)) return res.status(400).json({ message: "Invalid Email, email must contain @" })

            const isShutEmailExist = await autoBackupEmailModel.findOne({ issender_db: true })
            if (isShutEmailExist) return res.status(400).json({ message: "Only One Sender Email can create" })
            await autoBackupEmailModel.create(
                {
                    email_db: senderEmail,
                    pass_db: password,
                    userId_db: userId,
                    issender_db: true,
                }
            )
        } else {
            if (!emailValidation.test(email)) return res.status(400).json({ message: "Invalid Email, email must contain @" })

            await autoBackupEmailModel.create(
                {
                    email_db: email,
                    userId_db: userId
                }
            )
        }
        console.log("email successfully loaded")
        res.status(200).json({ message: "email successfully loaded" })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const updateAutoBackupEmails = async (req, res) => {
    try {
        const id = req.params.id;
        const { email, userId, senderEmail, password } = req.body;

        if (senderEmail && senderEmail.trim() !== "") {
            await autoBackupEmailModel.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        email_db: senderEmail,
                        pass_db: password,
                        userId_db: userId,
                        issender_db: true,
                    }
                },
                { new: true },
            )
        } else {
            await autoBackupEmailModel.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        email_db: email,
                        userId_db: userId,
                    }
                },
                { new: true },
            )
        }
        console.log("email successfully loaded")
        res.status(200).json({ message: "email successfully loaded" })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const deleteAutoBackupEmails = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await autoBackupEmailModel.deleteOne({ _id: id })
        console.log("email successfully loaded", result)
        res.status(200).json({ message: "email successfully found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const getAutoBackupEmails = async (req, res) => {
    try {
        const shutEmail = await autoBackupEmailModel.find({ issender_db: true })
        const result = await autoBackupEmailModel.find({ issender_db: false })
        console.log("email successfully loaded", shutEmail, result)
        res.status(200).json({ message: "email successfully found", shutEmail, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

// const takeBackup = async (req, res) => {
//     try {
//         const date = new Date()
//         const backupDir = `D:/project/MongoBackUp/mongoDump-${date.toISOString().split("T")[0]}`;

//         const url = process.env.MONGODB_URL
//         const cmd = `mongodump --uri="${url}" --out="${backupDir}"`

//         exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//                 console.error("backup error", error.message);
//                 return;
//             }
//             console.log("✅ MongoDB Backup Completed:", backupDir);

//             const zipFile = `${backupDir}.zip`
//             const safeZipFile = `${backupDir}.backup`;

//             const output = fs.createWriteStream(zipFile);
//             const archive = archiver("zip", {
//                 zlib: { level: 9 },
//                 encryptionMethod: "zip20",
//                 password: "123"
//             })
//             archive.pipe(output);
//             archive.directory(backupDir, false)
//             archive.finalize()
//             output.on("close", async () => {
//                 console.log("✅ Backup compressed & encrypted:", zipFile, archive.pointer(), "bytes");

//                 // if (fs.existsSync(zipFile)) {
//                 //     fs.renameSync(zipFile, safeZipFile);
//                 //     console.log("Renamed to safe extension", safeZipFile)
//                 // } else {
//                 //     console.error("Zip file not found, cannot rename.");
//                 //     return;
//                 // }



//                 const emails = await autoBackupEmailModel.find({}, { email_db: 1, _id: 0 })
//                 const emailSender = await autoBackupEmailModel.find({ issender_db: true })

//                 const hostEmail = emailSender.map((e) => e.email_db)
//                 const hostPass = emailSender.map((e) => e.pass_db)


//                 const BackupEmails = emails.map((e) => e.email_db)

//                 const transporter = nodemailer.createTransport({
//                     service: "gmail",
//                     auth: {
//                         // user: "rajchincholkar22@gmail.com",
//                         // pass: 'syzf oklo woui qqaz',
//                         user: hostEmail,
//                         pass: hostPass,
//                     }

//                 })
//                 const mailOptions = {
//                     from: "rajchincholkar22@gmail.com",
//                     to: [...BackupEmails],
//                     subject: "Data Secure Backup",
//                     text: `Dear Customer, Your daily auto backup file is attached with this mail.
// Please find as an attachment.
// The backup was taken on ${date}.`,
//                     attachments: [
//                         {
//                             filename: path.basename(zipFile),
//                             path: zipFile
//                         }
//                     ]
//                 }

//                 transporter.sendMail(mailOptions, (error, info) => {
//                     if (error) {
//                         return console.error("Email Error", error.message)
//                     }
//                     console.log("Email sent Successfully", info.response)
//                 })

//             })
//             archive.on("error", (err) => {
//                 throw err;
//             })
//         })
//         res.status(200).json({ message: "Backup sent to email successfully" })
//     } catch (err) {
//         console.log('internal eror', err)
//         res.status(500).json({ message: "internal error", err: err.message })
//     }

// }



const takeBackup = async (req, res) => {
    try {
        const { userId, password } = req.body;
        if (userId !== process.env.BACKUP_USERID || password !== process.env.BACKUP_PASS) {
            return res.status(401).json({ message: "Unavthorized Access: Invalid credentials" })
        }

        const date = new Date()
        const folderPath = "C:/Data Secure Backup/";
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
            console.log("folder path", folderPath)
        }
        const backupDir = path.join(folderPath, `mongoDump-${date.toISOString().split("T")[0]}`);

        const url = process.env.MONGODB_URL
        const cmd = `mongodump --uri="${url}" --out="${backupDir}"`

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("backup error", error.message);
                return;
            }
            console.log("✅ MongoDB Backup Completed:", backupDir);

            const zipFile = `${backupDir}.zip`
            const safeZipFile = `${backupDir}.backup`;

            const output = fs.createWriteStream(zipFile);
            const archive = archiver("zip", {
                zlib: { level: 9 },
                encryptionMethod: "zip20",
                password: "123"
            })
            archive.pipe(output);
            archive.directory(backupDir, false)
            archive.finalize()
            output.on("close", async () => {
                console.log("✅ Backup compressed & encrypted:", zipFile, archive.pointer(), "bytes");

                // if (fs.existsSync(zipFile)) {
                //     fs.renameSync(zipFile, safeZipFile);
                //     console.log("Renamed to safe extension", safeZipFile)
                // } else {
                //     console.error("Zip file not found, cannot rename.");
                //     return;
                // }



                const emails = await autoBackupEmailModel.find({}, { email_db: 1, _id: 0 })
                const emailSender = await autoBackupEmailModel.find({ issender_db: true })

                const hostEmail = emailSender.map((e) => e.email_db)
                const hostPass = emailSender.map((e) => e.pass_db)


                const BackupEmails = emails.map((e) => e.email_db)

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        // user: "rajchincholkar22@gmail.com",
                        // pass: 'syzf oklo woui qqaz',
                        user: hostEmail,
                        pass: hostPass,
                    }

                })
                const mailOptions = {
                    from: "rajchincholkar22@gmail.com",
                    to: [...BackupEmails],
                    subject: "Data Secure Backup",
                    text: `Dear Customer, Your daily auto backup file is attached with this mail.
Please find as an attachment.
The backup was taken on ${date}.`,
                    attachments: [
                        {
                            filename: path.basename(zipFile),
                            path: zipFile
                        }
                    ]
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.error("Email Error", error.message)
                    }
                    console.log("Email sent Successfully", info.response)
                })

            })
            archive.on("error", (err) => {
                throw err;
            })
        })
        res.status(200).json({ message: "Backup sent to email successfully" })
    } catch (err) {
        console.log('internal eror', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }

}


 

cron.schedule('0 19 * * *', async () => {
    try {
        const date = new Date()

        const folderPath = "C:/Data Secure Backup/";
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
            console.log("folder path", folderPath)
        }
        const backupDir = path.join(folderPath, `mongoDump-${date.toISOString().split("T")[0]}`);

        const url = process.env.MONGODB_URL
        const cmd = `mongodump --uri="${url}" --out="${backupDir}"`

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("backup error", error.message);
                return;
            }
            console.log("✅ MongoDB Backup Completed:", backupDir);

            const zipFile = `${backupDir}.zip`
            const safeZipFile = `${backupDir}.backup`;

            const output = fs.createWriteStream(zipFile);
            const archive = archiver("zip", {
                zlib: { level: 9 },
                encryptionMethod: "zip20",
                password: "123"
            })
            archive.pipe(output);
            archive.directory(backupDir, false)
            archive.finalize()
            output.on("close", async () => {
                console.log("✅ Backup compressed & encrypted:", zipFile, archive.pointer(), "bytes");

                // if (fs.existsSync(zipFile)) {
                //     fs.renameSync(zipFile, safeZipFile);
                //     console.log("Renamed to safe extension", safeZipFile)
                // } else {
                //     console.error("Zip file not found, cannot rename.");
                //     return;
                // }



                const emails = await autoBackupEmailModel.find({}, { email_db: 1, _id: 0 })
                const emailSender = await autoBackupEmailModel.find({ issender_db: true })

                const hostEmail = emailSender.map((e) => e.email_db)
                const hostPass = emailSender.map((e) => e.pass_db)


                const BackupEmails = emails.map((e) => e.email_db)

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        // user: "rajchincholkar22@gmail.com", 
                        // pass: 'syzf oklo woui qqaz',
                        user: hostEmail,
                        pass: hostPass,
                    }

                })
                const mailOptions = {
                    from: "rajchincholkar22@gmail.com",
                    to: [...BackupEmails],
                    subject: "Data Secure Backup",
                    text: `Dear Customer, Your daily auto backup file is attached with this mail.
Please find as an attachment.
The backup was taken on ${date}.`,
                    attachments: [
                        {
                            filename: path.basename(zipFile),
                            path: zipFile
                        }
                    ]
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.error("Email Error", error.message)
                    }
                    console.log("Email sent Successfully", info.response)
                })

            })
            archive.on("error", (err) => {
                throw err;
            })
        })
    } catch (err) {
        console.log('internal eror', err)
    }

})

// RESTORE BACKUP
const restoreBackup = async (req, res) => {
    const io = getIO();

    try {
        const { userId, password } = req.body;
        if (userId !== process.env.BACKUP_USERID || password !== process.env.BACKUP_PASS) {
            return res.status(401).json({ message: "Unavthorized Access: Invalid credentials" })
        }

        console.log("req.file:", req.file);
        const zipFilePath = req.file.path;
        const filePath = path.join(process.cwd(), "tempFile");


        if (fs.existsSync(filePath)) { //check tempFile folder exist
            fs.readdirSync(filePath).forEach(f => {
                fs.rmSync(path.join(filePath, f), { recursive: true, force: true }) //delete all file inside tempFile folder
            })
        } else {
            fs.mkdirSync(filePath, { recursive: true }); //creating  tempFile folder
        }
        console.log("================== restore")

        await new Promise((resolve, reject) => {
            console.log("Starting unzip:", zipFilePath);
            fs.createReadStream(zipFilePath)
                .pipe(unzipper.Extract({ path: filePath }))
                .on("close", () => {
                    console.log("Unzip complete");
                    resolve();
                })
                .on("error", (err) => {
                    console.error("Unzip error:", err);
                    reject(err);
                });
        });


        const dirs = fs.readdirSync(filePath);
        const restoreDir = path.join(filePath, dirs[0])
        const url = process.env.MONGODB_URL
        console.log("url", url)


        if (!dirs.length) {
            return res.status(400).json({ message: "Zip is empty or invalid format" });
        }


        const restore = spawn("mongorestore", [
            `--uri=${url}`,
            "--drop",
            // "--db=i2s2_Database",
            "--noIndexRestore",
            "--numInsertionWorkersPerCollection=16",
            "--numParallelCollections=16",
            restoreDir
        ]);
        restore.stdout.on("data", data => {
            const text = data.toString();
            io.emit("restoreProgress", text)
            console.log("Progress:", text);
        })
        restore.stderr.on("data", data => {
            const line = data.toString();

            // Match progress lines
            const match = line.match(/(\d+(\.\d+)?)MB\/(\d+(\.\d+)?)MB\s+\((\d+(\.\d+)?)%\)/);
            if (match) {
                const restoredMB = match[1];
                const totalMB = match[3];
                const percent = match[5];

                console.log(`Progress: ${restoredMB}/${totalMB} MB (${percent}%)`);
                io.emit("restoreProgress", { restoredMB, totalMB, percent });
            }
        })
        restore.on("close", () => {
            // delete extracted temp folder
            fs.rmSync(filePath, { recursive: true, force: true });

            // OPTIONAL: also delete uploaded zip file
            if (fs.existsSync(zipFilePath)) {
                fs.rmSync(zipFilePath, { force: true });
            }

            io.emit("restoreComplete", { message: "Restore finished" })
            console.log("Restore finished");
        })

        res.json({ success: true, message: "Restore started" });

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}


// const restoreBackup = async (req, res) => {
//     try {
//         console.log("req.file:", req.file);
//         const zipFilePath = req.file.path;
//         const filePath = path.join(process.cwd(), "tempFile");


//         if (fs.existsSync(filePath)) { //check tempFile folder exist
//             fs.readdirSync(filePath).forEach(f => {
//                 fs.rmSync(path.join(filePath, f), { recursive: true, force: true }) //delete all file inside tempFile folder
//             })
//         } else {
//             fs.mkdirSync(filePath, { recursive: true }); //creating  tempFile folder
//         }
//         console.log("================== restore")

//         await new Promise((resolve, reject) => {
//             console.log("Starting unzip:", zipFilePath);
//             fs.createReadStream(zipFilePath)
//                 .pipe(unzipper.Extract({ path: filePath }))
//                 .on("close", () => {
//                     console.log("Unzip complete");
//                     resolve();
//                 })
//                 .on("error", (err) => {
//                     console.error("Unzip error:", err);
//                     reject(err);
//                 });
//         });


//         const dirs = fs.readdirSync(filePath);
//         const restoreDir = path.join(filePath, dirs[0])
//         console.log("go go restore")
//         const url = process.env.MONGODB_URL
//         // const command = `mongorestore --uri="${url}" --drop --db=i2s2_Database --numInsertionWorkersPerCollection=8"${restoreDir}"`;
//        const command = `mongorestore --uri="${url}" --drop --db=i2s2_Database --numInsertionWorkersPerCollection=8 --numParallelCollections=8 "${restoreDir}"`;


//         console.log("Executing:", command);
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error("Restore error", stderr)
//                 return res.status(500).json({ success: false, error: stderr });
//             }
//             res.json({ success: true, message: "Database restored successfully" });
//         })
//         console.log("complete --------------------------- restore")
//     } catch (err) {
//         console.log("internal error", err)
//         res.status(500).json({ message: "internal error", err: err.message })
//     }
// }

// DONT DO THIS
const deleteEntireDatabase = async (req, res) => {
    // try {
    //     const url = process.env.MONGODB_URL;
    //     if (mongoose.connection.readyState === 0) {
    //         await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    //     }
    //     await mongoose.connection.dropDatabase();
    //     res.status(200).json({ message: 'Entire Database Successfully Deleted' })
    // } catch (err) {
    //     console.log("internal error", err)
    //     res.status(500).json({ message: 'internal error', err: err.message })
    // }
}


module.exports = { creatAutoBackupEmails, updateAutoBackupEmails, getAutoBackupEmails, deleteAutoBackupEmails, takeBackup, restoreBackup, deleteEntireDatabase }