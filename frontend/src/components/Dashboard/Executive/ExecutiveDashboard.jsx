import React, { Fragment, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ExecutiveDashboard.module.css";
import { useState } from "react";
import socket from "../../../socketio/socket";
import { useEffect } from "react";
import axios from "axios";
import AssignWork from "../../AssignWork";
import ScheduleOptima from "../DashboardComponent/ScheduleOptima";
import ExtraTaskRequest from "../DashboardComponent/ExtraTaskRequest";
import { AuthContext } from "../../../context-api/AuthContext";
import { base_url } from "../../../config/config";
import { RequestModalContext } from "../../../context-api/GlobalModalContext";
import Remainder from "../../../Pages/Remainder";
import QuickTeritoryFlash from "../../QuickTeritoryFlash";

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { userLoginId } = useContext(AuthContext);
  const { handleOpenModal, handleCloseModal, modalContent } =
    useContext(RequestModalContext);
  const [checkAssignWork, setCheckAssignWork] = useState(false);
  const [checkScheduleOptima, setCheckScheduleOptima] = useState(true);
  const [extraTask, setExtraTask] = useState([]);
  const [checkExtraTask, setCheckExtraTask] = useState(false);
  const [showExtraTask, setShowExtraTask] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [assigntaskNotify, setAssignTaskNotify] = useState(0);
  const [buttonTranverseId, setButtonTranverseId] = useState("quickTeritory");
  const [isRemainder, setIsRemainder] = useState(false);
  const [remainderTotalCount, setRemainderTotalCount] = useState(0);
  const [remainder, setRemainder] = useState([]);

  // useEffect(() => {
  //   if (!userLoginId) return;
  //   socket.on("connect", () => {
  //     // console.log("✅ Socket connected:", socket.id);
  //     socket.emit("joinRoom",  {userId:userLoginId?.userId,roleType:userLoginId?.roleType});
  //     // console.log("✅ joinRoom emitted with:", executiveId);
  //   });

  //   socket.on("userReminder", (data) => {
  //     alert("data", data.length);
  //     setRemainderTotalCount(data.length);
  //     setRemainder(data);
  //   });

  //   socket.on("assignTask", (data) => {
  //     console.log("🔥 Received taskAssigned:", data);
  //     setAssignTaskNotify(data.totalTask);
  //     setTaskList(data.result);
  //   });

  //   socket.on("extra-task-assigned", (data) => {
  //     console.log("🔥 Received Extra-taskAssigned:", data);
  //     setExtraTask(data.newTask);
  //     setCheckExtraTask(true);
  //     alert(data.message);
  //   });
  //   return () => {
  //     socket.off("userReminder");
  //     socket.off("assignTask");
  //     socket.off("extra-task-assigned");
  //     socket.off("connect");
  //   };
  // }, [userLoginId]);




  useEffect(() => {
    const fetchTask = async () => {
      try {
        const result = await axios.get(
          `${base_url}/task/get-assign-task/${userLoginId?.userId}`
        );
        const data = result.data?.result;
        console.log("assing task", result);
        setTaskList(data);
        setAssignTaskNotify(data?.length);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchTask();
  }, [socket]);

  useEffect(() => {
    if(!userLoginId) return;
    const fetchExtraTask = async () => {
      const result = await axios.get(
        `${base_url}/users/searchuser-task-form/${userLoginId?.userId}`
      );
      if (result.data.result) {
        setExtraTask(result.data.result);
        setCheckExtraTask(true);
      }
      // console.log("result bolte", result.data.result);
    };
    fetchExtraTask();
  }, []);

  const handleCheckExtraTask = () => {
    setShowExtraTask(true); // this will show pop up
  };

  const fetchRemainder = async () => {
    try {
      const result = await axios.get(`${base_url}/remainders/remainder`, {
        params: { userId: userLoginId?.userId, roleType: userLoginId?.roleType },
      });
      console.log("remainder", result.data.result);
      setRemainder(result.data.result);
      setRemainderTotalCount(result.data.result.length);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  useEffect(() => {
    fetchRemainder();
  }, [userLoginId]);

  const goToClientPage = (taskdata) => {
    const userId = "E02_SA";
    navigate("/client-page", { state: { userId, taskdata } });
  };
  const goToReportPage = () => {
    navigate("/report");
  };
  return (
    <div className={styles.main}>
      <div className={styles["main-content"]}>
        <header className={styles.header}>
          <h3>Dashboard For {userLoginId?.userName} </h3>
        </header>
        <div className={styles["box-div"]}>
          <div className={styles.box}>
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "Schedule Optima"
                    ? "hsl(241, 100%, 81%)"
                    : "",
              }}
              onClick={() => {
                setButtonTranverseId("Schedule Optima");
              }}
            >
              Schedule Optima
            </button>
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "Assign Work"
                    ? "hsl(241, 100%, 81%)"
                    : "",
                position: "relative",
              }}
              onClick={() => {
                setButtonTranverseId("Assign Work");
              }}
            >
              Assign Work
              {assigntaskNotify > 0 && (
                <span className={styles.highlight}>{assigntaskNotify}</span>
              )}
            </button>
            <button>Master Data</button>
            <button
              onClick={() => {
                goToReportPage();
              }}
            >
              Report
            </button>
            <div className={styles.notification}>
              <button
                style={{
                  backgroundColor:
                    isRemainder === true && buttonTranverseId === "Remainder"
                      ? "hsl(241, 100%, 81%)"
                      : "",
                }}
                onClick={() => {
                  setIsRemainder((prev) => !prev);
                  setButtonTranverseId("Remainder");
                }}
              >
                Reminder
                {remainderTotalCount > 0 && (
                  <span className={styles["notification-icon"]}>
                    {remainderTotalCount}
                  </span>
                )}
              </button>
            </div>
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "quickTeritory"
                    ? "hsl(241, 100%, 81%)"
                    : "",
              }}
              onClick={() => {
                setButtonTranverseId("quickTeritory");
              }}
            >
              Quick Overview
            </button>
          </div>

          <div className={styles["show-content"]}>
            {buttonTranverseId === "Assign Work" && (
              <div>
                <AssignWork taskList={taskList} setTaskList={setTaskList} />
              </div>
            )}
            {buttonTranverseId === "Schedule Optima" && (
              <>
                <ScheduleOptima
                  userLoginId={userLoginId?.userId}
                  onCheckExtraTask={handleCheckExtraTask}
                  onShowOpenRequest={checkExtraTask}
                />
              </>
            )}
            {buttonTranverseId === "quickTeritory" && (
              <>
                <QuickTeritoryFlash
                  isOpen={buttonTranverseId}
                  onClose={() => {
                    setButtonTranverseId("");
                  }}
                />
              </>
            )}
            {/* ===========================REMAINDER=============================== */}
            {buttonTranverseId === "Remainder" && (
              <div className={styles.remainderdiv}>
                <Remainder
                  remainder={remainder}
                  setRemainder={setRemainder}
                  refreshRemainder={fetchRemainder}
                />
              </div>
            )}
          </div>

          <div className={styles.box}>
            <button>Search</button>
            <button>Add</button>
            <button>Delete</button>
            <div className={styles.selects}>
              <select name="" id="">
                <option value="All Data">All Data</option>
                <option value="Follow-ubutton">Follow-up</option>
                <option value="Demo">Demo</option>
                <option value="Hot">Hot</option>
                <option value="buttonayment Due">payment Due</option>
                <option value="buttonroduct">product</option>
                <option value="Won Or Client">Won Or Client</option>
                <option value="Near To Close">Near To Close</option>
                <option value="Defaulter">Defaulter</option>
                <option value="Installation/Hosting">
                  Installation/Hosting
                </option>
              </select>
            </div>
            <button>Calender</button>
            <button>Upload</button>
            <button>Download</button>
            <button>print</button>
            <button>Save</button>
            <button>Update</button>
          </div>
        </div>
        <div>Report</div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
