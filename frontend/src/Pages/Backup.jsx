import React, { useState, useEffect } from "react";
import styles from "./Backup.module.css";
import { base_url } from "../config/config";
import axios from "axios";
import socket from "../socketio/socket";

const Backup = () => {
  const [progress, setProgress] = useState("");
  const [userId, setUserId] = useState("");
  const [userPassword, setUserPassword] = useState("");

  useEffect(() => {
    console.log("socket start")
    socket.on("restoreProgress", (data) => {
      console.log("restoreProgress",data)
      setProgress(
        `Progress: ${data.restoredMB} MB/${data.totalMB} MB (${data.percent}%)`
      );
      console.log(
        `Progress-----: ${data.restoredMB}/${data.totalMB} MB (${data.percent}%)`
      );
    });

    socket.on("restoreComplete", (msg) => {
      setProgress(msg.message);
      console.log("✅ Restore complete:", msg.message);
    });

    return () => {
      socket.off("restoreProgress");
      socket.off("restoreComplete");
    };
  }, [socket]);

  const openInput = () => {
    if (!userId || !userPassword) {
      return alert("UserId and Password must required");
    }
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (event) => {
      const selectedFile = event.target.files[0];
      if (!selectedFile) return;
      // console.log("file name", selectedFile);

      const formdata = new FormData();
      formdata.append("restore", selectedFile);
      formdata.append("userId", userId);
      formdata.append("password", userPassword);
      try {
        const result = await axios.post(
          `${base_url}/backup/restoreBackup`,
          formdata,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Restore", result.data);
        setProgress(result.data.message);
      } catch (err) {
        console.log("internal error", err);
        alert(
          err && err.response && err.response.data && err.response.data.message
        );
      }
    };
    input.click();
  };

  const handleTakeBackup = async () => {
    if (!userId || !userPassword) {
      return alert("UserId and Password must required");
    }
    try {
      const result = await axios.post(
        `${base_url}/backup/takeBackup`,
        { userId: userId, password: userPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
      alert(
        err && err.response && err.response.data && err.response.data.message
      );
    }
  };
  // const handleResetDatabase = async () => {
  //   try {
  //     window.confirm("Are you sure to Delete Entire Database. Make sure you already have backup files")
  //     const result = await axios.delete(`${base_url}/backup/delete-entire-db`);
  //     alert(result.data.message);
  //   } catch (err) {
  //     console.log("internal error", err);
  //     alert(err);
  //   }
  // };

  const handleReset = () => {
    setUserId("");
    setUserPassword("");
  };
  return (
    <div className={styles.main}>
      <div className={styles["backup-box"]}>
        <div className={styles.content}>
          <h2 className={styles.header}>Backup Data</h2>
        </div>
        <div className={styles.content}>
          <span className={styles["span-content"]}>
            <label htmlFor="">UserId</label>
            <input
              type="text"
              className={styles["input-box"]}
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
              }}
            />
          </span>
          <span className={styles["span-content"]}>
            <label htmlFor="">Password</label>
            <input
              type="password"
              className={styles["input-box"]}
              value={userPassword}
              onChange={(e) => {
                setUserPassword(e.target.value);
              }}
            />
          </span>
        </div>
        <div>
          <button
            className={styles["input-button"]}
            onClick={() => {
              openInput();
            }}
          >
            Restore
          </button>
          <button className={styles["input-button"]} onClick={handleTakeBackup}>
            Backup
          </button>
          <button className={styles["input-button"]} onClick={handleReset}>
            Reset
          </button>
        </div>
        {progress.length > 0 && (
          <div className={styles.progressbar}> {progress}</div>
        )}
      </div>
    </div>
  );
};

export default Backup;
