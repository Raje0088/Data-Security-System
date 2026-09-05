// const UserModel = require('../models/user.js')
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.register = async (req, res) => {
//     try {

//         const { username, email, password, role, assignedBy } = req.body;
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) return res.status(400).json({ msg: "User already exist" })

//         const hashPass = await bcrypt.hash(password, 10);
//         const user = await UserModel.create({ username, email, password: hashPass, role, assignedBy });
//         await user.save();
//         res.status(201).json({ msg: "User registered Successfully" });
//     } catch (err) {
//         res.status(500).json({ msg: "Server error", error: err.message });
//     }
 
// } 

// exports.login = async (req, res) => {
//     try {
 
//         const { email, password } = req.body;
//         const user = await UserModel.findOne({ email });
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).json({ msg: 'Invalid credentials' })
//         }

//         if (user.status == 'denied') return res.status(403).json({ msg: "Access denied by superadmin" })

//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//             expiresIn: "1d",
//         });
//         res.status(200).json({
//             token,
//             user: { id: user._id, role: user.role, username: user.username },
//         });
//     } catch (err) {
//         res.status(500).json({ msg: "Server error", error: err.message });
//     }
// };

// // 🔹 Superadmin updates status (allow or deny)
// exports.updateStatus = async (req, res) => {
//     try {

//         const { userId, status } = req.body;
//         const user = await UserModel.findById(userId);
//         if (!user) return res.status(404).json({ msg: "User not found" })

//         user.status = status;
//         await user.save();
//         res.status(200).json({ msg: "Status updated", user });
//     } catch (err) {
//         res.status(500).json({ msg: "Server error", error: err.message });
//     }
// }

// // admin: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmIzMTdjZWUzNDE4NjU4ZmU0M2MxZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDUxODc4MywiZXhwIjoxNzQ0NjA1MTgzfQ.120yXNlt0U0tzk_84Vly7wBjX2mZQB_cB2kmAeCVIEA

// // User : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmIzYjU5M2M1ZGMzMDMyODhlNmQ3ZiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ0NTE4ODQzLCJleHAiOjE3NDQ2MDUyNDN9.pny5U_E-ESx9fZksxMKzT30VijC5VVogsEJaaWsGxfY