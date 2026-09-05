import React, { Fragment, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AssignWork.module.css";
import { IoMenu } from "react-icons/io5";
import axios from "axios";
import { base_url } from "../config/config";
import { AiTwotoneDelete } from "react-icons/ai";
import { AuthContext } from "../context-api/AuthContext";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import { BiSolidShow } from "react-icons/bi";
import { HiArrowRightStartOnRectangle } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import ExtraTaskRequest from "./Dashboard/DashboardComponent/ExtraTaskRequest";
import { IoCloseSharp } from "react-icons/io5";

const AssignWork = ({ taskList, setTaskList }) => {
  const navigate = useNavigate();
  const { userLoginId } = useContext(AuthContext);
  const [refresh, setRefresh] = useState(false);
  const [selectTaskIndex, setSelectTaskIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectTaskTabOption, setSelectTaskTabOption] = useState("task");
  const [showExcelList, setShowExcelList] = useState(false);
  const [veiwExcelData, setViewExcelData] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [assignDataList, setAssignDataList] = useState([]);

  const [filteredBy, setFilteredBy] = useState({
    taskStatus: "Pending",
    request: "",
    taskType: "",
    userId: "",
    dateFrom: "",
    dateTo: "",
  });
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const result = await axios.get(
          `${base_url}/task/get-assign-task/${userLoginId?.userId}`,
          {
            params: { ...filteredBy },
          }
        );
        console.log("result=============", result.data);
        const data = result.data.result;
        setTaskList(data);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchTask();
  }, [filteredBy, refresh]);

  const handleStartTask = (clientIds, assignBy, assignTo,taskId) => {
    console.log("clietnda");
    const idsArray = clientIds.map((ids) => ids.id);
    navigate("/client-page", {
      state: {
        from: "assignWork",
        ids: idsArray,
        assignBy: assignBy,
        assignTo: assignTo,
        taskId:taskId,
      },
    });
  };

  const handleChange = (name, value) => {
    setFilteredBy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequest = async (status, taskId) => {
    try {
      const confirmed = window.confirm("Would you like to proceed request?");
      if (!confirmed) return;
      const result = await axios.get(`${base_url}/task/task-request`, {
        params: {
          status: status,
          taskId: taskId,
        },
      });
    } catch (err) {
      console.log("internal error", err);
    }
    setRefresh((prev) => !prev);
  };
  const handleReset = () => {
    setFilteredBy({
      taskStatus: "",
      request: "",
      taskType: "",
      userId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleExcelView = async (value) => {
    try {
      const result = await axios.get(
        `${base_url}/users/search-by-user/${userLoginId?.userId}`
      );
      const data = result.data.result?.master_data_db;
      console.log("area", data);
      setAssignDataList(data);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const showExcelData = async (DumpId) => {
    // setIsLoading(true);
    console.log("dumpe", DumpId);
    try {
      const result = await axios.get(
        `${base_url}/raw-data/excel-data/${DumpId}`
      );

      console.log("jsonData", result.data);
      setExcelData(result.data.result);
    } catch (err) {
      console.log("internal error", err);
    }
    // setIsLoading(false);
  };

  const handleViewExcelSelectAll = () => {
    if (selectedClients.length === excelData?.length) {
      setSelectedClients([]);
    } else {
      // console.log("excelmap",excelData?.map((item) => item.ClientId))
      const allViewClientIds = excelData?.map((item) => item.client_id);
      setSelectedClients(allViewClientIds);
    }
  };
  const handleCheckboxChange = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter((id) => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
    console.log("clientId", clientId);
    console.log("selectedClient", selectedClients);
  };

  const handleRedirectClient = () => {
    try {
      if (selectedClients.length === 0) {
        return alert("Please select at least one client");
      }
      navigate("/client-page", {
        state: { selectedClients, from: "userConfiguration" },
      });

      console.log("jump to client page");
    } catch (err) {
      console.log("internal error", err);
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.assigndiv}>
          <span
            onClick={() => {
              setSelectTaskTabOption("task");
            }}
            style={{
              backgroundColor:
                selectTaskTabOption === "task" ? "hsl(241, 100%, 81%)" : "",
              borderTopLeftRadius: "5px",
              borderBottomLeftRadius: "5px",
              borderRight: "1px solid white",
              fontWeight: selectTaskTabOption === "task" ? "600" : "500",
            }}
          >
            Task
          </span>
          <span
            onClick={() => {
              setSelectTaskTabOption("assign");
              handleExcelView("true");
            }}
            style={{
              backgroundColor:
                selectTaskTabOption === "assign" ? "hsl(241, 100%, 81%)" : "",
              borderRight: "1px solid white",
              fontWeight: selectTaskTabOption === "assign" ? "600" : "500",
            }}
          >
            Assigned
          </span>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.header}>
          <span>
            <label htmlFor="">Request</label>
            <select
              name=""
              id=""
              value={filteredBy.request}
              onChange={(e) => {
                handleChange("request", e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="Accept">Accept</option>
              <option value="Reject">Reject</option>
              <option value="Pending">Pending</option>
            </select>
          </span>
          <span>
            <label htmlFor="">Task Type</label>
            <select
              name=""
              id=""
              value={filteredBy.taskType}
              onChange={(e) => {
                handleChange("taskType", e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="REMINDER">Remainder</option>
              <option value="EXCEL">Excel</option>
              <option value="">Bulk Data</option>
            </select>
          </span>
          <span>
            <label htmlFor="">Task Status</label>
            <select
              name=""
              id=""
              value={filteredBy.taskStatus}
              onChange={(e) => {
                handleChange("taskStatus", e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </span>

          <span>
            <label htmlFor="">From</label>
            <input
              type="date"
              value={filteredBy.dateFrom}
              onChange={(e) => {
                handleChange("dateFrom", e.target.value);
              }}
            />
          </span>
          <span>
            <label htmlFor="">To</label>
            <input
              type="date"
              value={filteredBy.dateTo}
              onChange={(e) => {
                handleChange("dateTo", e.target.value);
              }}
            />
          </span>
        </div>
        <div className={styles.btndiv}>
          <button
            onClick={() => {
              handleReset();
            }}
          >
            Reset
          </button>
        </div>
        {selectTaskTabOption === "task" && (
          <div className={styles.content}>
            {taskList?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Request Status</th>
                    <th> Assign By</th>
                    <th> Assign To</th>
                    <th>Task Mode</th>
                    <th>Task Type</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Total Client</th>
                    <th>Status</th>
                    <th>View</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <thead>
                  {(taskList || []).map((item, idx) => (
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{item.createdAt.split("T")[0]}</td>
                      <td>{item.createdAt.split("T")[1].split(".")[0]}</td>
                      <td style={{ textAlign: "center" }}>
                        {item.request_status_db === "Pending" ? (
                          <div className={styles.requestlayer}>
                            <button
                              onClick={() => {
                                handleRequest("Accept", item._id);
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                handleRequest("Reject", item._id);
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          item.request_status_db
                        )}
                      </td>
                      <td>{item.assignBy_db}</td>
                      <td>{item.assignTo_db}</td>
                      <td>{item.taskMode_db}</td>
                      <td
                        title={`${item.excelId_db?.title}`}
                        style={{ cursor: "pointer" }}
                      >
                        {item.taskType_db}
                      </td>
                      <td>{item.completed_db}</td>
                      <td>{item.pending_db}</td>
                      <td>{item.total_task_db} </td>
                      <td
                        title={
                          item.task_status_db === "Cancel"
                            ? "Cancel by SA/Admin"
                            : ""
                        }
                        className={styles.align}
                      >
                        {item.task_status_db === "Completed" ? (
                          <MdOutlineDownloadDone />
                        ) : item.task_status_db === "Pending" ? (
                          <IoHourglassOutline />
                        ) : (
                          <IoMdClose
                            style={{ color: "red", fontSize: "20px" }}
                          />
                        )}
                      </td>
                      <td>
                        <button
                          style={{ border: "none" }}
                          disabled={
                            item.request_status_db === "Pending" ||
                            item.request_status_db === "Reject" ||
                            item.task_status_db === "Cancel"
                          }
                          onClick={() => {
                            handleStartTask(
                              item.task_client_id,
                              item.assignBy_db,
                              item.assignTo_db,
                              item._id
                            );
                          }}
                        >
                          <HiArrowRightStartOnRectangle
                            className={
                              item.request_status_db === "Pending" ||
                              item.request_status_db === "Reject" ||
                              item.task_status_db === "Cancel"
                                ? { color: "gray" }
                                : styles.icon
                            }
                          />
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <BiSolidShow
                          onClick={() => {
                            setSelectTaskIndex(idx);
                            handleOpenModal(true);
                          }}
                          className={styles.icon1}
                        />
                      </td>
                    </tr>
                  ))}
                </thead>
              </table>
            ) : (
              <div className={styles.nocontent}>
                <h2>Assign Work Not Found</h2>
              </div>
            )}
          </div>
        )}
        {selectTaskTabOption === "assign" && (
          <div className={styles.tablediv}>
            <div>
              <h4>Assign Excel Sheet</h4>
            </div>
            {assignDataList?.excelId &&
            assignDataList?.excelId !== "NA" ? (
              <table>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Excel Name</th>
                    <th>Excel Title</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{1}</td>
                    <td>{assignDataList?.excelId?.title}</td>
                    <td>{assignDataList?.excelId?.excelId}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => {
                          setShowExcelList(true);
                          showExcelData(assignDataList?.excelId?.excelId);
                        }}
                        className={styles.custombtn}
                      >
                        Show
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <h2 style={{ width: "100%", textAlign: "center" }}>
                No Data Found
              </h2>
            )}
            <div style={{ marginTop: "10px" }}>
              <h4>Assign Area</h4>
            </div>
            {assignDataList.productPermissions?.length > 0 ? (
             <div className={styles.regionWrapper}>
                {assignDataList.productPermissions?.map((place, i) => (
                  <div key={i} className={styles.innerWrapper}>
                    <span
                      // style={{ fontSize: "10px", fontWeight: "700" }}
                      className={styles.prodCellWrapper}
                    >
                      {place.productName}
                    </span>
                    <div className={styles.areadiv}>
                      <span style={{textAlign:"center",padding:"4px",borderBottom:"1px solid black"}} className={styles.stateCellWrapper}>State</span>
                      <span style={{textAlign:"center",padding:"4px",borderBottom:"1px solid black"}} className={styles.districtCellWrapper}>District</span>
                    </div>
                    {place.region.map((area, idx) => (
                      <div className={styles.areadiv}>
                        <span className={styles.stateCellWrapper}>
                          {area.stateName}{" "}
                          <sup className={styles.distnotify}>
                            {area.totalCnt}
                          </sup>
                        </span>
                        <span className={styles.districtCellWrapper}>
                          <div className={styles.districtCell}>
                            {area?.districts?.slice(0, 10)?.map((item, j) => (
                              <span key={j} className={styles.districtItem}>
                                {item.districtName}
                                <sup className={styles.distnotify}>
                                  {item.totalDistCnt}
                                </sup>
                                {" ,  "}
                              </span>
                            ))}
                          </div>

                          <div className={styles.distbox}>
                            {area?.districts?.map((dist, k) => (
                              <span key={k} className={styles.distboxItem}>
                                {dist.districtName}
                                <sup className={styles.distnotify}>
                                  {dist.totalDistCnt}
                                </sup>
                                {", "}
                              </span>
                            ))}
                          </div>
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <h2 style={{ width: "100%", textAlign: "center" }}>
                No Data Found
              </h2>
            )}
          </div>
        )}
        {isModalOpen === true && (
          <ExtraTaskRequest
            onTaskData={taskList[selectTaskIndex]}
            onClose={handleCloseModal}
          />
        )}
      </div>
      {showExcelList && (
        <div className={styles.popupdiv}>
          <div className={styles.popupinner}>
            <div
              className={styles["align-end"]}
              onClick={() => {
                setShowExcelList(false);
              }}
            >
              <IoCloseSharp
                style={{ width: "30px", height: "30px", color: "red" }}
              />
            </div>
            <div
              style={{
                width: "100%",
                height: "100%",
                padding: "20px 10px",
                color: "red",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {excelData?.length > 0 && (
                <div className={styles.tablediv}>
                  <div className={styles["table-content"]}>
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <span id={styles.selectAll}>
                              <input
                                type="checkbox"
                                className={styles["checkbox-input-table"]}
                                checked={
                                  selectedClients?.length ===
                                    excelData?.length && excelData?.length > 0
                                }
                                onChange={handleViewExcelSelectAll}
                              />
                              Select All ({selectedClients.length})
                            </span>
                          </th>
                          <th>SrNo</th>
                          <th>Client Id</th>
                          <th>Shop Name</th>
                          <th>Client Name</th>
                          <th>Email 1</th>
                          <th>Email 2</th>
                          <th>Address</th>
                          <th>Pincode</th>
                          <th>District</th>
                          <th>State</th>
                          <th>Mobile 1</th>
                          <th>Mobile 2</th>
                          <th>Mobile 3</th>
                          <th>FollowUp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(excelData || []).map((item, idx) => [
                          <tr
                            style={{
                              backgroundColor:
                                item.database_status_db === "user_db"
                                  ? "#ffe5ac"
                                  : item.database_status_db === "client_db"
                                  ? "#00ff2673"
                                  : "",
                            }}
                            onClick={() => {
                              handleCheckboxChange(item.client_id);
                            }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                className={styles["checkbox-input-table"]}
                                checked={selectedClients.includes(
                                  item.client_id
                                )}
                                onChange={() => {
                                  handleCheckboxChange(item.client_id);
                                }}
                              />
                            </td>
                            <td>{idx + 1}</td>
                            <td>{item.client_id}</td>
                            <td>{item.optical_name1_db}</td>
                            <td>{item.client_name_db}</td>
                            <td>{item.email_1_db}</td>
                            <td>{item.email_2_db}</td>
                            <td>{item.address_1_db}</td>
                            <td>{item.pincode_db}</td>
                            <td>{item.district_db}</td>
                            <td>{item.state_db}</td>
                            <td>{item.mobile_1_db}</td>
                            <td>{item.mobile_2_db}</td>
                            <td>{item.mobile_3_db}</td>
                            <td>{item.Followup}</td>
                          </tr>,
                        ])}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className={styles["align-end"]} onClick={() => {}}>
                <button
                  className={styles.custombtn}
                  onClick={() => {
                    handleRedirectClient();
                  }}
                >
                  {" "}
                  view
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignWork;
