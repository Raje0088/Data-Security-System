import React, { useState, useEffect, useContext } from "react";
import styles from "./Remainder.module.css";
import socket from "../socketio/socket";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import { base_url } from "../config/config";
import { AuthContext } from "../context-api/AuthContext";
import { MdOutlineDeleteOutline } from "react-icons/md";

const Remainder = ({ remainder, setRemainder, refreshRemainder }) => {
  const { userLoginId } = useContext(AuthContext);
  console.log("remainder", remainder);
  const navigate = useNavigate();
  const [remainderDate, setRemainderDate] = useState(null);
  const [filterRemainder, setFilterRemainder] = useState(remainder);
  const [setter, setSetter] = useState(1);
  let Allcount = 0,
    DemoCount = 0,
    FollowUpCount = 0,
    HotCount = 0,
    InstallationCount = 0,
    TrainingCount = 0,
    SupportCount = 0,
    RecoveryCount = 0,
    AmcCount = 0;

  Allcount = remainder.length;
  DemoCount = remainder.filter((item) => item?.stage_db === "Demo").length;
  FollowUpCount = remainder.filter(
    (item) => item?.stage_db === "Follow up",
  ).length;
  HotCount = remainder.filter((item) => item?.stage_db === "Hot").length;
  InstallationCount = remainder.filter(
    (item) => item?.stage_db === "Installation",
  ).length;
  TrainingCount = remainder.filter(
    (item) => item?.stage_db === "Training",
  ).length;
  SupportCount = remainder.filter(
    (item) => item?.stage_db === "Support",
  ).length;
  RecoveryCount = remainder.filter(
    (item) => item?.stage_db === "Recovery",
  ).length;
  AmcCount = remainder.filter((item) => item?.stage_db === "Amc").length;
  console.log("rema", filterRemainder);


  useEffect(() => {
      const fetch = async () => {
    try {
      const result = await axios.get(`${base_url}/remainders/status`, {
        params: {
          date: remainderDate,
          userId: userLoginId?.userId,
          roleType: userLoginId?.roleType,
        },
      });
      setFilterRemainder(result.data.result);
      refreshRemainder();
    } catch (err) {
      console.log("interna error", err);
    }
    setRemainderDate(null);
  };
    if (remainderDate !== null) {
      fetch();
    }
  }, [remainderDate]);

  const distributeRemainders = (value, idx) => {
    console.log(value);
    let result = [];
    if (value === "All") {
      result = remainder;
      setSetter(idx);
    }
    if (value === "Demo") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Follow Up") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Hot") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Installation") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Training") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Support") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Recovery") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    if (value === "Amc") {
      result = remainder.filter((item) => item.stage_db === value);
      setSetter(idx);
    }
    setFilterRemainder(result);
  };

  const redirectToClientPage = (id, db, taskId) => {
    const filterId = filterRemainder.filter((item) => item.client_id === id);
    const stg = filterId.map((item) => item.stage_db);
    if (db === "Client") {
      navigate("/client-page", {
        state: { id, stg, from: "remainder", taskId: taskId },
      });
    } else {
      navigate("/userpage", {
        state: { id, stg, from: "remainder", taskId: taskId },
      });
    }
  };

  const handleDeleteReminder = async (id) => {
    const isConfirm = window.confirm("Are you sure to delete this reminder?");

    if (!isConfirm) return;
    try {
      const res = await axios.delete(`${base_url}/remainders/rem-del/${id}`);
      alert(res.data.message);
      const newRem = remainder.filter((item,idx)=>item._id !== id)
      console.log("newRem", newRem)
      setRemainder(newRem)
      setFilterRemainder(newRem)
    } catch (err) {
      console.log("internal error", err);
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1>Reminders</h1>
        <input
          type="date"
          value={remainderDate}
          onChange={(e) => {
            setRemainderDate(e.target.value);
          }}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 1 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("All", 1);
            }}
          >
            All
          </button>
          {Allcount > 0 && <span className={styles.highlight}>{Allcount}</span>}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 2 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Hot", 2);
            }}
          >
            Hot
          </button>
          {HotCount > 0 && <span className={styles.highlight}>{HotCount}</span>}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 3 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Follow Up", 3);
            }}
          >
            Follow Up
          </button>
          {FollowUpCount > 0 && (
            <span className={styles.highlight}>{FollowUpCount}</span>
          )}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 4 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Demo", 4);
            }}
          >
            Demo
          </button>
          {DemoCount > 0 && (
            <span className={styles.highlight}>{DemoCount}</span>
          )}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 5 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Training", 5);
            }}
          >
            Training
          </button>
          {TrainingCount > 0 && (
            <span className={styles.highlight}>{TrainingCount}</span>
          )}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 6 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Installation", 6);
            }}
          >
            Installation
          </button>
          {InstallationCount > 0 && (
            <span className={styles.highlight}>{InstallationCount}</span>
          )}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 7 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Support", 7);
            }}
          >
            Support
          </button>
          {SupportCount > 0 && (
            <span className={styles.highlight}>{SupportCount}</span>
          )}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 8 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Recovery", 8);
            }}
          >
            Recovery
          </button>
          {RecoveryCount > 0 && (
            <span className={styles.highlight}>{RecoveryCount}</span>
          )}
        </div>
        <div className={styles.btndiv}>
          <button
            style={{ background: setter === 9 ? "hsl(241, 100%, 50%)" : "" }}
            onClick={() => {
              distributeRemainders("Amc", 9);
            }}
          >
            Amc
          </button>
          {AmcCount > 0 && <span className={styles.highlight}>{AmcCount}</span>}
        </div>
      </div>
      <div className={styles.remainderdiv}>
        {filterRemainder.length > 0 && (
          <table className={styles.tables}>
            <tr>
              <th id={styles.ths}>Sr No</th>
              <th id={styles.ths}>Client Id</th>
              <th id={styles.ths}>Client Name</th>
              <th id={styles.ths}>Product</th>
              <th id={styles.ths}>Stage</th>
              <th id={styles.ths}>Date</th>
              <th id={styles.ths}>Time</th>
              <th id={styles.ths}>Action</th>
              <th id={styles.ths} className={styles.align}>
                Status
              </th>
              <th>User Id</th>
              <th>Delete</th>
            </tr>
            {filterRemainder.length > 0 &&
              filterRemainder.map((item, idx) => (
                <tr key={item._id}>
                  <td id={styles.tds}>{idx + 1}</td>
                  <td id={styles.tds} title="Click to view">
                    <strong
                      className={styles.text}
                      onClick={() => {
                        redirectToClientPage(
                          item.client_id,
                          item.database_db,
                          item.taskId_db,
                        );
                      }}
                    >
                      {item.client_id || "NA"}
                    </strong>
                  </td>
                  <td id={styles.tds}>{item.client_name_db || "NA"}</td>
                  <td id={styles.tds}>{item.product_db || "NA"}</td>
                  <td id={styles.tds}>{item.stage_db || "NA"}</td>
                  <td id={styles.tds}>{item.date_db || "NA"}</td>
                  <td id={styles.tds}>{item.time_db || "NA"}</td>
                  <td id={styles.tds}>{item.operation_db || "NA"}</td>
                  <td id={styles.tds} className={styles.align}>
                    {item.status_db == true ? (
                      <MdOutlineDownloadDone />
                    ) : (
                      <IoHourglassOutline />
                    )}
                  </td>
                  <td>{item.userId_db}</td>
                  {(userLoginId?.roleType === "Superadmin" ||
                    userLoginId?.roleType === "Admin") && (
                    <td className={styles.align}>
                      <MdOutlineDeleteOutline
                        onClick={() => {
                          handleDeleteReminder(item._id);
                        }}
                        style={{
                          fontSize: "16px",
                          cursor: "pointer",
                          color: "red",
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))}
          </table>
        )}
        {filterRemainder.length === 0 && (
          <div className={styles["noremainder-div"]}>
            <h2>No Remainder Set</h2>
          </div>
        )}
        {/* {filterRemainder.length > 0 ? (
          filterRemainder.map((item, idx) => (
            <div key={item._id} className={styles.remainders}>
              <p>{idx + 1}</p>
              <p title="Click to view">
                <strong
                  className={styles.text}
                  onClick={() => {
                    redirectToClientPage(item.client_id);
                  }}
                >
                  {item.client_id}
                </strong>
              </p>
              <p>{item.client_name_db}</p>
              <p>{item.stage_db}</p>
              <p>{item.date_db}</p>
              <p>{item.time_db}</p>
              <p>{item.operation_db}</p>
              <p>
                {item.status_db == true ? (
                  <MdOutlineDownloadDone />
                ) : (
                  <IoHourglassOutline />
                )}
              </p>
            </div>
          ))
        ) : (
          <div className={styles.header}>
            <h2>No Remainder Found</h2>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Remainder;
