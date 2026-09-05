import React, { useContext, useEffect, useState } from "react";
import { base_url } from "../config/config";
import axios from "axios";
import styles from "./UserConfiguration.module.css";
import { FaBell } from "react-icons/fa6";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import { AiTwotoneDelete } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import socket from "../socketio/socket";
import { RequestModalContext } from "../context-api/GlobalModalContext";
import { useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { AuthContext } from "../context-api/AuthContext";
import { IoMdRemoveCircle } from "react-icons/io";

const UserConfiguration = () => {
  const { userLoginId } = useContext(AuthContext);
  const navigate = useNavigate();
  const { handleOpenModal } = useContext(RequestModalContext);
  const [userConfigList, setUserConfigList] = useState();
  const [refresh, setRefresh] = useState(false);
  const [filteredBy, setFilteredBy] = useState({
    taskStatus: "",
    request: "",
    taskType: "",
    userId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectTaskTabOption, setSelectTaskTabOption] = useState("task");
  const [membersList, setMembersList] = useState([]);
  const [showExcelList, setShowExcelList] = useState(false);
  const [veiwExcelData, setViewExcelData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState({});
  const [assignAreaList, setAssignAreaList] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const userDetails = await axios.get(`${base_url}/users/search-all-user`);
      const users = userDetails.data.result;
      console.log("userIds==================", userDetails);

      const usersId = users?.map((ids) => ({
        id: ids.generateUniqueId,
        name: ids.name,
      }));
      setMembersList(usersId);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await axios.get(`${base_url}/task/get-task-userconfig`, {
          params: { ...filteredBy },
        });
        const data = result.data.result;
        setUserConfigList(data);
        // console.log("config", result);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchConfig();
  }, [filteredBy, refresh]);

  const handleChange = (name, value) => {
    setFilteredBy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBellClick = (data) => {
    const confirmed = window.confirm("Do you want to send request again?");
    if (!confirmed) return;
    socket.emit("remindUser", {
      taskId: data._id,
      assignTo: data.assignTo_db,
      message: "Reminder Alert!, You haven't responded yet",
      text: `Title: New Task, TaskType: ${data.taskType_db}, Total Record: ${data.total_task_db} from ${data.assignBy_db} to ${data.assignTo_db}`,
    });

    alert("Notification send Successfully");
    // console.log(data);
  };
  const handleReset = () => {
    setFilteredBy({});
  };
  const handleDeleteAssignTask = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure  to delete Assign Task");
      if (!confirmed) return;
      const result = await axios.delete(
        `${base_url}/task/delete-assign-task/${id}`
      );
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
    }
    setRefresh((prev) => !prev);
  };
  const handleCancelAssignTask = async (id) => {
    try {
      const confirmed = window.confirm("Are you  sure to Cancel Assign  Task");
      if (!confirmed) return;
      const result = await axios.get(
        `${base_url}/task/get-assign-task-cancel/${id}`
      );
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
    }
    setRefresh((prev) => !prev);
  };

  const handleExcelView = async (value) => {
    try {
      const result = await axios.get(`${base_url}/view-excel/get-allexcel`, {
        params: { assign: value },
      });
      const excelData = result.data.result;
      let filterData = [...excelData];
      if (filteredBy.userId) {
        filterData = filterData.filter(
          (item) => item.userId_db === filteredBy.userId
        );
      }
      if (filteredBy.fromDate) {
        const fromDatee = dateFormat(filteredBy.fromDate);
        console.log("Yo", fromDatee);
        filterData = filterData.filter((item) => item.date_db >= fromDatee);
      }
      if (filteredBy.toDate) {
        const toDatee = dateFormat(filteredBy.toDate);
        console.log(toDatee);
        filterData = filterData.filter((item) => item.date_db <= toDatee);
      }

      setViewExcelData(filterData);
      console.log("file", filterData);

      // ===================== GET USER ASSIGN AREA =====================================
      const data = await axios.get(`${base_url}/users/search-all-user`);
      const userArea = data.data.result;
      const area = userArea.filter(
        (item) =>
          item.generateUniqueId !== "SA" &&
          item?.master_data_db?.productPermissions?.length > 0
      );
      console.log("filters", area);
      setAssignAreaList(area);
      console.log("user area", area);
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
  const handleAssignExcelSheet = async (title, excelId, assignTo,idx) => {
    console.log("title, exec", title, excelId);
    try {
      const result = await axios.get(
        `http://localhost:3000/view-excel/assign-excel`,
        {
          params: {
            title: title,
            excelId: excelId,
            assignTo: assignTo,
            assignBy: userLoginId?.userId,
          },
        }
      );
      console.log("result", result.data.message);
      alert(result.data.message);
      setSelectedUserId((prev) => ({
        ...prev,
        [idx]: "", // idx must be passed in or captured via closure
      }));
    } catch (err) {
      console.log("internal error", err);
       alert(err?.response?.data?.message);
    }
  };

  const handleRemoveArea = async (userId) => {
    const isConfirmed = window.confirm(
      "Are you sure to remove Complete region?"
    );
    if (!isConfirmed) return;
    try {
      const result = await axios.put(
        `${base_url}/task/remove-assignarea/${userId}`
      );
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleRemoveExcel = async (userId, dumpId) => {
    console.log("userId and dumpId", userId, dumpId);
    try {
      const result = await axios.put(`${base_url}/task/remove-assignexcel`, {
        userId: userId,
        dumpId: dumpId,
      });
      alert(result.data.message);
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
          <span
            onClick={() => {
              setSelectTaskTabOption("notassign");
              handleExcelView("false");
            }}
            style={{
              backgroundColor:
                selectTaskTabOption === "notassign"
                  ? "hsl(241, 100%, 81%)"
                  : "",
              borderTopRightRadius: "5px",
              borderBottomRightRadius: "5px",
              fontWeight: selectTaskTabOption === "notassign" ? "600" : "500",
            }}
          >
            Not Assigned
          </span>
        </div>
      </div>
      {selectTaskTabOption === "task" && (
        <div className={styles.header}>
          <span>
            <label htmlFor="">User</label>
            <select
              name=""
              id=""
              value={filteredBy.userId}
              onChange={(e) => {
                handleChange("userId", e.target.value);
              }}
            >
              <option value="">All</option>
              {membersList.map((item, idx) => (
                <option>{item.id}</option>
              ))}
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
      )}
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
        <div className={styles.tablediv}>
          {userConfigList?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Request</th>
                  <th>Assign By</th>
                  <th>Assign To</th>
                  <th>Task Type</th>
                  <th>Completed</th>
                  <th>Total Client</th>
                  <th>Status</th>
                  <th>Alert</th>
                  <th>Cancel</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {(userConfigList || []).map((item, idx) => (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{item.createdAt.split("T")[0]}</td>
                    <td>{item.createdAt.split("T")[1].split(".")[0]}</td>
                    <td style={{ fontWeight: "600" }}>
                      {item.request_status_db}
                    </td>
                    <td>{item.assignBy_db}</td>
                    <td>{item.assignTo_db}</td>
                    <td
                      title={`${item.excelId_db?.title}`}
                      style={{ cursor: "pointer" }}
                    >
                      {item.taskType_db}
                    </td>
                    <td>{item.completed_db}</td>
                    <td>{item.total_task_db}</td>
                    <td className={styles.align}>
                      {item.task_status_db == "Completed" ? (
                        <MdOutlineDownloadDone />
                      ) : item.task_status_db == "Pending" ? (
                        <IoHourglassOutline />
                      ) : (
                        <IoMdClose style={{ color: "red", fontSize: "20px" }} />
                      )}
                    </td>
                    <td className={styles.align}>
                      <FaBell
                        className={styles.icon}
                        onClick={() => {
                          handleBellClick(item);
                        }}
                      />
                    </td>
                    <td className={styles.align}>
                      <IoMdClose
                        style={{ color: "red", strokeWidth: "0" }}
                        className={styles.icon}
                        onClick={() => {
                          handleCancelAssignTask(item._id);
                        }}
                      />
                    </td>
                    <td className={styles.align}>
                      <AiTwotoneDelete
                        className={styles.icon}
                        style={{ color: "red", strokeWidth: "0" }}
                        onClick={() => {
                          handleDeleteAssignTask(item._id);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <h2>No Task Assign</h2>
          )}
        </div>
      )}
      {selectTaskTabOption === "assign" && (
        <div className={styles.tablediv}>
          <div>
            <h4>Assign Excel Sheet</h4>
          </div>
          {veiwExcelData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Upload By</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Assign To</th>
                  <th>Assign By</th>
                  <th>Excel Name</th>
                  <th>Total</th>
                  <th>View</th>
                  <th>Remove </th>
                </tr>
              </thead>
              <tbody>
                {veiwExcelData.map((item, idx) => (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{item.userId_db}</td>
                    <td>{item.updatedAt.split("T")[0]}</td>
                    <td>{item.updatedAt.split("T")[1].split(".")[0]}</td>
                    <td>{item.assignTo_db}</td>
                    <td>{item.assignBy_db}</td>
                    <td>{item.excel_title_db}</td>

                    <td>{item.total_db}</td>
                    <td
                      style={{ textAlign: "center" }}
                      onClick={() => {
                        setShowExcelList(true);
                        showExcelData(item.dumpBy_db);
                      }}
                    >
                      <button className={styles.custombtn}>Show</button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <IoMdRemoveCircle
                        onClick={() => {
                          handleRemoveExcel(item.assignTo_db, item.dumpBy_db);
                        }}
                        className={styles.icon1}
                      />{" "}
                    </td>
                  </tr>
                ))}
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
          {assignAreaList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Area</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {assignAreaList.map((item, idx) => (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{item.generateUniqueId}</td>
                    <td>{item.updatedAt.split("T")[0]}</td>
                    <td>{item.updatedAt.split("T")[1].split(".")[0]}</td>
                    <td className={styles.regionWrapper}>
                      {/* {item.master_data_db.productPermissions.map(
                        (prod, idx) => (
                          <tr>
                            <td>{prod.productName}</td>
                            {prod.region.map(
                              (states) => (
                                <tr>
                                  <td>
                                    <h4>
                                      {" "}
                                      {states.stateName} ({states.totalCnt})
                                    </h4>
                                  </td>
                                  <td>
                                    {states?.districts?.map((dist, j) => (
                                      <span style={{ display: "flex" }}>
                                        <strong
                                          style={{
                                            background: [
                                              "MUMBAI",
                                              "KOLKATA",
                                              "CHENNAI",
                                              "DELHI",
                                            ].includes(dist.districtName)
                                              ? "yellow"
                                              : "",
                                          }}
                                        >
                                          {dist.districtName}(
                                          {dist.totalDistCnt})
                                        </strong>
                                        <span>
                                          {" — "}
                                          {dist.pincodes.length > 0 &&
                                            dist.pincodes.map((pin, k) => (
                                              <span>
                                                {pin.code}{" "}
                                                {k < dist.pincodes.length - 1 &&
                                                  ", "}
                                              </span>
                                            ))}
                                        </span>
                                      </span>
                                    ))}
                                  </td>
                                </tr>
                              )
                            )}
                          </tr>
                        )
                      )} */}

                      {/* =======================*/}
                      {item.master_data_db.productPermissions?.map(
                        (place, i) => (
                          <div key={i} className={styles.innerWrapper}>
                            <span
                              // style={{ fontSize: "10px", fontWeight: "700" }}
                              className={styles.prodCellWrapper}
                            >
                              {place.productName}
                            </span>

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
                                    {area?.districts
                                      ?.slice(0, 10)
                                      ?.map((item, j) => (
                                        <span
                                          key={j}
                                          className={styles.districtItem}
                                        >
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
                                      <span
                                        key={k}
                                        className={styles.distboxItem}
                                      >
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
                        )
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <IoMdRemoveCircle
                        onClick={() => {
                          handleRemoveArea(item.generateUniqueId);
                        }}
                        className={styles.icon1}
                      />{" "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <h2 style={{ width: "100%", textAlign: "center" }}>
              No Data Found
            </h2>
          )}
        </div>
      )}
      {selectTaskTabOption === "notassign" && (
        <div className={styles.tablediv}>
          <div>
            <h4>Excel Sheet</h4>
          </div>
          {veiwExcelData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Upload By</th>
                  <th>Excel Name</th>
                  <th>Assign To</th>
                  <th>Save</th>
                </tr>
              </thead>
              <tbody>
                {veiwExcelData.map((item, idx) => (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{item.userId_db}</td>
                    <td>{item.excel_title_db}</td>
                    <td>
                      <select
                        value={selectedUserId[idx]}
                        onChange={(e) => {
                          setSelectedUserId((prev) => ({
                            ...prev,
                            [idx]: e.target.value,
                          }));
                        }}
                      >
                        <option value="">--Select</option>
                        {membersList.map((item, idx) => (
                          <option
                            key={idx}
                          >{`${item.id} - ${item.name}`}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => {
                          handleAssignExcelSheet(
                            item.excel_title_db,
                            item.dumpBy_db,
                            selectedUserId[idx],
                            idx
                          );
                        }}
                        className={styles.custombtn}
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <h2 style={{ width: "100%", textAlign: "center" }}>
              No Data Found
            </h2>
          )}
          <div style={{ marginTop: "10px" }}>
            <h4>UnAssign Area</h4>
          </div>
          {assignAreaList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>State</th>
                  <th>District</th>
                </tr>
              </thead>
              <tbody>
                {assignAreaList.map((item, idx) => (
                  <tr>
                    <td>{idx + 1}</td>
                    <td>Sttate</td>
                    <td>District</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <h2 style={{ width: "100%", textAlign: "center" }}>
              No Data Found
            </h2>
          )}
        </div>
      )}
      {/* POP UP SHOW ASSIGN EXCEL SHEET DATA */}
      {showExcelList && (
        <div className={styles.popupdiv}>
          <div className={styles.popupinner}>
            <div
              className={styles["align-end"]}
              onClick={() => {
                setShowExcelList(false);
                setExcelData([]);
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
                  <div>
                    {/* <div className={styles.pagebtn}>
                      <button
                        disabled={page === 1}
                        onClick={() => {
                          handleSearchData(page - 1);
                        }}
                      >
                        Prev
                      </button>
                      <span>
                        {" "}
                        {page} of {totalPageSize}
                      </span>
                      <button
                        disabled={page === totalPageSize}
                        onClick={() => {
                          handleSearchData(page + 1);
                        }}
                      >
                        Next
                      </button>
                    </div> */}
                  </div>

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

export default UserConfiguration;
