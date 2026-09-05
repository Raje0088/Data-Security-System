import styles from "./AdminDashboard.module.css";
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import socket from "../../../socketio/socket";
import { useEffect } from "react";
import axios from "axios";
import MessagePortal from "../../../UI/MessagePortal";
import { AuthContext } from "../../../context-api/AuthContext";
import { useContext } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { base_url } from "../../../config/config";
import Remainder from "../../../Pages/Remainder";
import { IoMenu } from "react-icons/io5";
import AssignWork from "../../AssignWork";
import CreateTaskForm from "../../CreateTaskForm";
import UserConfiguration from "../../UserConfiguration";
import ScheduleOptima from "../DashboardComponent/ScheduleOptima";
import QuickTeritoryFlash from "../../QuickTeritoryFlash";
import ReportDashboard from "../../Reports/ReportDashboard";

const AdminDashboard = () => {
  const { userLoginId } = useContext(AuthContext);
  console.log("adminpage", userLoginId);
  const navigate = useNavigate();

  const fileRef = useRef(null);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [selectRawFile, setSelectRawFile] = useState(null);
  const [importButtonRawDB, setImportButtonRawDB] = useState(false);
  const [portalMsg, setPortalMsg] = useState("");
  const [portalMsg2, setPortalMsg2] = useState("");
  const [portalType, setPortalType] = useState("");
  const [filteredBy, setFilteredBy] = useState({
    member: "",
    state: "",
    district: "",
    businessName: "",
    mobile: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgess] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isImport, setIsImport] = useState(false);
  const [isAssignTask, setIsAssignTask] = useState(false);
  const [isRemainder, setIsRemainder] = useState(false);
  const [isReport, setIsReport] = useState(false);
  const [remainder, setRemainder] = useState([]);
  const [remainderTotalCount, setRemainderTotalCount] = useState(0);
  const [buttonTranverseId, setButtonTranverseId] = useState("quickTeritory");
  const [selectedClients, setSelectedClients] = useState([]);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [assigntaskNotify, setAssignTaskNotify] = useState(0);
  const [taskList, setTaskList] = useState([]);
  const [checkExtraTask, setCheckExtraTask] = useState(false);

  // useEffect(() => {
  //   if (!userLoginId) return;
  //   socket.on("connect", () => {
  //     // console.log("✅ Socket connected:", socket.id);

  //     socket.emit("joinRoom", {userId:userLoginId?.userId,roleType:userLoginId?.roleType});
  //     console.log("✅ joinRoom emitted with:", userLoginId?.userId,);
  //   });

  //   socket.on("adminReminder",(data)=>{
  //     alert("data", data.length);
  //     setRemainderTotalCount(data.length);
  //     setRemainder(data);
  //   })

  //   socket.on("taskAssigned", (data) => {
  //     console.log("🔥 Received taskAssigned:", data);
  //     setTaskList((prev) => ({ ...prev, ...data }));
  //     alert(data.message);
  //   });

  //   return () => {
  //     socket.off("adminReminder")
  //     socket.off("taskAssigned");
  //     socket.off("connect");
  //   };
  // }, [userLoginId]);

  useEffect(() => {
    console.log("userid", userLoginId?.userId);
    const fetchTask = async () => {
      const result = await axios.get(
        `${base_url}/task/get-clientids-assign-by-to/${userLoginId?.userId}`
      );
      const datas = result.data.result;
      console.log("task data", datas);
      setTaskList(datas);
    };
    fetchTask();
  }, []);

  const goToClientPage = () => {
    const userId = "A1_SA";
    navigate("/client-page", { state: { userId, taskList } });
  };

  const fetchRemainder = async () => {
    try {
      const result = await axios.get(`${base_url}/remainders/remainder`,
        {
          params:{userId:userLoginId.userId,roleType :userLoginId.roleType}
        }
      );
      console.log("remainder", result.data.result);
      setRemainder(result.data.result);
      setRemainderTotalCount(result.data.result.length);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  
  useEffect(() => {
    fetchRemainder();
  }, [userLoginId?.userId]);

  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log("✅ Socket connected:", socket.id);

  //     socket.emit("joinRoom", userLoginId?.userId);
  //     console.log("✅ joinRoom emitted with:", userLoginId?.userId);
  //   });

  //   socket.on("assignTask", (data) => {
  //     console.log("🔥 Received taskAssigned:", data);
  //     setTaskList((prev) => ({ ...prev, ...data }));
  //     alert(data.message);
  //   });

  //   socket.on("remainder", (data) => {
  //     console.log("data", data.length);
  //     setRemainderTotalCount(data.length);
  //     setRemainder(data);
  //   });

  //   return () => {
  //     socket.off("assignTask");
  //     socket.off("connect");
  //   };
  // }, []);

  //fetching members

  // const goToClientPage = () => {
  //   const userId = "SA";
  //   navigate("/client-page", { state: { userId } });
  // };
  const goToSearchPage = () => {
    navigate("/search-client");
  };
  const goToReportPage = () => {
    navigate("/report");
  };

  const handleCheckExtraTask = () => {
    setShowExtraTask(true); // this will show pop up
  };

  // const handleChange = (e, name) => {
  //   console.log("heelo", name, e.target.value);
  //   setFilteredBy((prev) => ({
  //     ...prev,
  //     [name]: e.target.value,
  //   }));
  // };

  // const assignTaskTo = async () => {
  //   try {
  //     const result = await axios.post(
  //       `${base_url}/task/task-assign`,
  //       {
  //         assignBy: userLoginId?.userId,
  //         assignTo: filteredBy.member,
  //       },
  //       {
  //         params: {
  //           state: filteredBy.state || undefined,
  //           district: filteredBy.district || undefined,
  //           businessName: filteredBy.businessName.trim() || undefined,
  //           mobile: filteredBy.mobile || undefined,
  //         },
  //       }
  //     );
  //     console.log(
  //       `task is assigned to ${filteredBy.member} sucessfully`,
  //       result
  //     );
  //   } catch (err) {
  //     console.log("internal error", err.response?.data?.message);
  //     if (err.response?.data?.message === "No matching raw data found") {
  //       alert(err.response?.data?.message);
  //     }
  //   }
  // };

  // const handleViewExcel = async()=>{
  //   try{
  //     const result = await axios.post("")
  //   }
  // }

  const handleImportFile = async () => {
    if (!selectRawFile) {
      setPortalMsg("Please select a file first");
      setPortalType("error");
      return;
    }

    const formData = new FormData();
    formData.append("uploadExcelSheet", selectRawFile);
    setIsUploading(true);
    setStatusMessage("Uploading file...");
    setUploadProgess(0);
    setImportButtonRawDB(true);
    console.log("setSelectRawFile", selectRawFile?.name);
    try {
      // STEP 1: Upload the file
      const uploadRes = await axios.post(
        `${base_url}/raw-data/raw-data-dump`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const filename = uploadRes.data.filename;
      setStatusMessage("Processing data...");

      // ✅ STEP 2: Use full backend URL for EventSource
      const eventSource = new EventSource(
        `${base_url}/raw-data/stream-insert/${filename}?userId=${
          userLoginId?.userId
        }&originalName=${encodeURIComponent(selectRawFile?.name)}`
      );

      eventSource.addEventListener("progress", (event) => {
        const data = JSON.parse(event.data);
        setUploadProgess(data.progress); // optional
        setStatusMessage(`Processing: ${data.progress}%`);
        console.log(`Progress: ${data.progress}%`);
      });

      eventSource.addEventListener("complete", (event) => {
        const data = JSON.parse(event.data);
        console.log("Upload Complete!", data);
        setStatusMessage("Upload Complete!");
        setPortalMsg(`Imported  Successfully`);
        setPortalMsg2(`Total Records: ${data.total}`);
        setPortalType("success");
        alert("Upload Complete");
        eventSource.close();
      });

      eventSource.addEventListener("error", (event) => {
        try {
          const data = JSON.parse(event.data);
          const stateErrors = data.errorsState?.length
            ? `Invalid States at row(s): ${data.errorsState.join(", ")}`
            : "No state errors";

          const distErrors = data.errorsDist?.length
            ? `Invalid Districts at row(s): ${data.errorsDist.join(", ")}`
            : "No district errors";

          setPortalMsg(distErrors);
          setPortalMsg2(stateErrors);
          console.error("Error during insert:", data);
        } catch {
          console.error("Unknown error during insert.");
        }
        eventSource.close();
        setStatusMessage("Upload failed during processing.");
      });

      fileRef.current.value = "";
    } catch (err) {
      console.error("Upload error", err);
      setPortalMsg(err.message);
      setPortalType("error");
    }
  };

  // console.log("import", importButtonRawDB);

  const goToExcelView = () => {
    navigate("/view-excel");
  };
  const handleSampleFile = () => {
    try {
      const link = document.createElement("a");
      link.href = `${base_url}/raw-data/samplefile`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("file downloaded Successfully");
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const goToBackupPage = () => {
    navigate("/backup");
  };
  return (
    <div className={styles.main}>
      <div className={styles["main-content"]}>
        <div className={styles.menu}>
          <IoMenu
            className={styles.menuicon}
            onClick={() => {
              setToggleMenu((prev) => !prev);
            }}
          />
        </div>
        <header className={styles.header}>
          <h3>Dashboard For {userLoginId?.userName} </h3>
        </header>
        <div className={styles["box-div"]}>
          <div className={`${styles.box1} ${toggleMenu ? styles.open : ""}`}>
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "Import" ? "hsl(241, 100%, 81%)" : "",
              }}
              onClick={() => {
                setIsImport((prev) => !prev);
                setButtonTranverseId("Import");
              }}
            >
              Import
            </button>
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
            <button
              style={{
                position: "relative",
                backgroundColor:
                  buttonTranverseId === "Assign Task"
                    ? "hsl(241, 100%, 81%)"
                    : "",
              }}
              onClick={() => {
                setIsAssignTask((prev) => !prev);
                setButtonTranverseId("Assign Task");
              }}
            >
              Assign Task
            </button>
            <button>Master Data</button>
            <button
              style={{
                backgroundColor:
                  isReport === true && buttonTranverseId === "Report"
                    ? "hsl(241, 100%, 81%)"
                    : "",
              }}
              onClick={() => {
                goToReportPage();
                setButtonTranverseId("Report");
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
            {/* ===========================Schedule Optima=============================== */}
            {buttonTranverseId === "Schedule Optima" && (
              <>
                <ScheduleOptima
                  userLoginId={userLoginId?.userId}
                  onCheckExtraTask={handleCheckExtraTask}
                  onShowOpenRequest={checkExtraTask}
                />
              </>
            )}

            {/* ===========================Assign Work=============================== */}
            {buttonTranverseId === "Assign Work" && (
              <div>
                <AssignWork taskList={taskList} setTaskList={setTaskList} />
              </div>
            )}
            {/* ===========================ADD BUTTON=============================== */}

            {buttonTranverseId === "Assign Task" && (
              <>
                <CreateTaskForm />
              </>
            )}
            {/* ===========================ADD BUTTON=============================== */}
            {buttonTranverseId === "Import" && (
              <>
                <div>
                  <span className={styles.sample}>
                    <h4>Import Excel Sheet (.csv / .xlsx format only) </h4>
                    <p>Sample file for upload </p>
                    <MdOutlineFileDownload
                      onClick={handleSampleFile}
                      className={styles["download-icon"]}
                    />
                  </span>
                  <div className={styles.dumpdata}>
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      ref={fileRef}
                      onChange={(e) => {
                        setSelectRawFile(e.target.files[0]);
                      }}
                    />

                    <button
                      disabled={importButtonRawDB}
                      onClick={(e) => {
                        handleImportFile(e);
                        setImportButtonRawDB(true);
                      }}
                    >
                      Import
                    </button>
                    {portalMsg && (
                      <MessagePortal
                        message1={portalMsg}
                        message2={portalMsg2}
                        onClose={() => {
                          setPortalMsg("");
                          setImportButtonRawDB(false);
                        }}
                        type={portalType}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    {isUploading && (
                      <div className={styles["progress-bar"]}>
                        <div
                          className={styles.progress}
                          style={{ width: `${uploadProgress}%` }}
                        >
                          <p>{statusMessage}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ===========================QUICK TERITORY=============================== */}

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

            {/* ===========================UserConfiguration=============================== */}
            {buttonTranverseId === "UserConfiguration" && (
              <div className={styles.remainderdiv}>
                <UserConfiguration />
              </div>
            )}
            {/* ===========================Report=============================== */}

            {buttonTranverseId === "Report" && (
              <div className={styles["generate-report-div"]}>
                <div className={styles.btndiv}>
                  <ReportDashboard />
                </div>
              </div>
            )}
          </div>
          <div className={`${styles.box2} ${toggleMenu ? styles.open : ""}`}>
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "Search" ? "hsl(241, 100%, 81%)" : "",
              }}
              onClick={() => {
                goToSearchPage();
                setButtonTranverseId("Search");
              }}
            >
              Search
            </button>
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
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "UserConfiguration"
                    ? "hsl(241, 100%, 81%)"
                    : "",
              }}
              onClick={() => {
                setIsImport((prev) => !prev);
                setButtonTranverseId("UserConfiguration");
              }}
            >
              User Configuration
            </button>
            <button>Calender</button>
            <button>Upload</button>
            <button>Download</button>
            <button>print</button>
            <button>Save</button>
            <button>Update</button>
            <button
              style={{
                backgroundColor:
                  buttonTranverseId === "View Excel"
                    ? "hsl(241, 100%, 81%)"
                    : "",
              }}
              onClick={() => {
                goToExcelView();
                setButtonTranverseId("View Excel");
              }}
            >
              View Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
