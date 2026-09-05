import React, { useContext, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import socket from "../socketio/socket";
import { AuthContext } from "../context-api/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { RequestModalContext } from "../context-api/GlobalModalContext";

const ReminderToast = () => {
  const { userLoginId } = useContext(AuthContext);
  const { reminderPopup ,setReminderPopup} = useContext(RequestModalContext);
  console.log("reminderPopup", reminderPopup);
 
  useEffect(() => {
    if (!reminderPopup) return; // prevents first empty run

    // Play sound
    const audio = new Audio("/sounds/popchat.wav");
    audio.play().catch(() => {});

    // Show toast
    toast.info(reminderPopup, {
      style: {
        background: "linear-gradient(135deg,#6A11CB,#2575FC)",
        color: "#fff",
        fontWeight: 600,
        borderRadius: "12px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
      },
    //   icon: "🔔",
    });
    setReminderPopup(null)
  }, [reminderPopup]); 

  //   useEffect(() => {
  //     if (!userLoginId) return;
  //     const handleReminder = (data) => {
  //         console.log("reminder Socket")
  //       const audio = new Audio("/sounds/popchat.wav");
  //       audio.play().catch(() => {});

  //       toast.info(data.message, {
  //         style: {
  //           background: "linear-gradient(135deg, #6A11CB, #2575FC)",
  //           color: "#fff",
  //           fontWeight: "600",
  //           borderRadius: "10px",
  //           boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  //         },
  //         icon: "🔔",
  //       });
  //     };

  //     socket.on("reminder-popup", handleReminder);

  //     socket.emit("joinRoom", {
  //       userId: userLoginId.userId,
  //       roleType: userLoginId.roleType,
  //     });

  //     return () => {
  //       socket.off("reminder-popup", handleReminder);
  //     };
  //   }, [userLoginId]);

  return (
    <div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default ReminderToast;
