import React, { useContext, useEffect } from "react";
import { RequestModalContext } from "../context-api/GlobalModalContext";
import socket from "../socketio/socket";
import { AuthContext } from "../context-api/AuthContext";
import { base_url } from "../config/config";
import axios from "axios";

const SocketListner = () => {
  const {
    handleOpenModal,
    setRemainderTotalCount,
    setRemainder,
    setReminderPopup,
    setSocketOnline
  } = useContext(RequestModalContext);
  const { userLoginId } = useContext(AuthContext);
  // console.log("socket", userLoginId?.userId);

  useEffect(() => {
    if (!userLoginId?.userId) return;
    const handleConnect = () => {
       setSocketOnline(true);
      // console.log("✅ SocketListner connected:", socket.id);
      socket.emit("joinRoom", {
        userId: userLoginId.userId,
        roleType: userLoginId.roleType,
      });
      console.log("✅ joinRoom emitted with:", userLoginId?.userId);
    };
    const handleDisconnect = () => {
      setSocketOnline(false);
      console.log("🚨 Socket disconnected");
    };

    socket.on("disconnect", handleDisconnect);


    if (socket.connected) {
      // If the socket is already connected, call handleConnect immediately
      handleConnect();
    } else {
      // Otherwise, wait for the "connect" event and then call handleConnect
      socket.once("connect", handleConnect);
    }

    socket.on("assignTask", (data) => {
      console.log("Received AssignTask from socketListerner.jsx", data);
      //NOTE: IN HANDLEOPENMODAL I AM PASSING TWO PARAMETER, 1ST -> TEXT TO DISPLAY 2ND -> RESPONSE FROM CLIENT SIDE/RECEIVER SIDE LIKE ACCEPT/REJECT REQUEST AND SAVE TO DB
      handleOpenModal(
        {
          msg1: data.message,
          msg2: data.text,
          taskId: data.taskId,
        },
        async (status, taskId) => {
          const result = await axios.get(`${base_url}/task/task-request`, {
            params: { status: status, taskId: taskId },
          });
        }
      );
    });
    socket.on("userReminder", (data) => {
      console.log("data", data);
      handleOpenModal(
        {
          msg1: data.message,
          msg2: data.text,
          taskId: data.taskId,
        },
        async (status, taskId) => {
          const result = await axios.get(`${base_url}/task/task-request`, {
            params: { status: status, taskId: taskId },
          });
        }
      );
    });

    // ---- USER REMINDER ----
    socket.on("userSpecificRemainder", (data) => {
      console.log("👤 User Reminder:", data);

      setRemainder((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, data];
      });

      setRemainderTotalCount((prev) => prev + 1);
    });

    // ---- ADMIN REMINDER ----
    socket.on("adminReminder", (data) => {
      console.log("🛠 Admin Reminder:", data);

      setRemainder((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, data];
      });
      setRemainderTotalCount((prev) => prev + 1);
    });

    // ---- SUPERADMIN REMINDER ----
    socket.on("superadminReminder", (data) => {
      console.log("👑 Superadmin Reminder:", data);

      setRemainder((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, data];
      });
      setRemainderTotalCount((prev) => prev + 1);
    });

    socket.on("reminder-popup", (data) => {
      console.log("reminder-popup", data);
      setReminderPopup(data.message);
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("userReminder");
      socket.off("assignTask");
      socket.off("userSpecificRemainder");
      socket.off("adminReminder");
      socket.off("superadminReminder");
      socket.off("reminder-popup");
      socket.off("disconnect", handleDisconnect);
    };
  }, [handleOpenModal, userLoginId?.userId]);
  // useEffect(() => {
  //   if (!userLoginId?.userId) return;
  //   const handleConnect = () => {
  //     // console.log("✅ SocketListner connected:", socket.id);
  //     socket.emit("joinRoom", {
  //       userId: userLoginId.userId,
  //       roleType: userLoginId.roleType,
  //     });
  //     console.log("✅ joinRoom emitted with:", userLoginId?.userId);
  //   };
  //   if (socket.connected) {
  //     // If the socket is already connected, call handleConnect immediately
  //     handleConnect();
  //   } else {
  //     // Otherwise, wait for the "connect" event and then call handleConnect
  //     socket.on("connect", handleConnect);
  //   }

  //   socket.on("assignTask", (data) => {
  //     console.log("Received AssignTask from socketListerner.jsx", data);
  //     //NOTE: IN HANDLEOPENMODAL I AM PASSING TWO PARAMETER, 1ST -> TEXT TO DISPLAY 2ND -> RESPONSE FROM CLIENT SIDE/RECEIVER SIDE LIKE ACCEPT/REJECT REQUEST AND SAVE TO DB
  //     handleOpenModal(
  //       {
  //         msg1: data.message,
  //         msg2: data.text,
  //         taskId: data.taskId,
  //       },
  //       async (status, taskId) => {
  //         const result = await axios.get(`${base_url}/task/task-request`, {
  //           params: { status: status, taskId: taskId },
  //         });
  //       }
  //     );
  //   });
  //   socket.on("userReminder", (data) => {
  //     console.log("data", data);
  //     handleOpenModal(
  //       {
  //         msg1: data.message,
  //         msg2: data.text,
  //         taskId: data.taskId,
  //       },
  //       async (status, taskId) => {
  //         const result = await axios.get(`${base_url}/task/task-request`, {
  //           params: { status: status, taskId: taskId },
  //         });
  //       }
  //     );
  //   });

  //   // ---- USER REMINDER ----
  //   socket.on("userSpecificRemainder", (data) => {
  //     console.log("👤 User Reminder:", data);

  //     setRemainder((prev) => {
  //       const safePrev = Array.isArray(prev) ? prev : [];
  //       return [...safePrev, data];
  //     });

  //     setRemainderTotalCount((prev) => prev + 1);
  //   });

  //   // ---- ADMIN REMINDER ----
  //   socket.on("adminReminder", (data) => {
  //     console.log("🛠 Admin Reminder:", data);

  //     setRemainder((prev) => {
  //       const safePrev = Array.isArray(prev) ? prev : [];
  //       return [...safePrev, data];
  //     });
  //     setRemainderTotalCount((prev) => prev + 1);
  //   });

  //   // ---- SUPERADMIN REMINDER ----
  //   socket.on("superadminReminder", (data) => {
  //     console.log("👑 Superadmin Reminder:", data);

  //     setRemainder((prev) => {
  //       const safePrev = Array.isArray(prev) ? prev : [];
  //       return [...safePrev, data];
  //     });
  //     setRemainderTotalCount((prev) => prev + 1);
  //   });

  //   socket.on("reminder-popup",(data)=>{
  //     console.log("reminder-popup",data)
  //     setReminderPopup(data.message)
  //   })

  //   return () => {
  //     socket.off("connect", handleConnect);
  //     socket.off("userReminder");
  //     socket.off("assignTask");
  //     socket.off("userSpecificRemainder");
  //     socket.off("adminReminder");
  //     socket.off("superadminReminder");
  //     socket.off("reminder-popup")
  //   };
  // }, [handleOpenModal, userLoginId?.userId]);
  return null;
};

export default SocketListner;
