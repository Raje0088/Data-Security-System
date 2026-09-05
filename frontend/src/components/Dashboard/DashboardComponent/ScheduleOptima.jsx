import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./ScheduleOptima.module.css";
import TimePickerComponent from "../../../UI/TimePickerComponent";
import { AuthContext } from "../../../context-api/AuthContext";
import { useContext } from "react";
import { base_url } from "../../../config/config";

const ScheduleOptima = (props) => {
  const { userLoginId } = useContext(AuthContext);
  const [userProduct, setUserProduct] = useState([]);
  const [scheduleData, setScheduleData] = useState();
  const [showProgress, setShowProgress] = useState([]);
  const [showProgressMode, setShowProgressMode] = useState(false);
  const [ScheduleList, setScheduleList] = useState([
    "New Data Add",
    "No of New Calls",
    "Leads",
    "Demo",
    "Follow Up",
    "Target",
    "Training",
    "Installation",
    "Recovery",
    "Support",
  ]);
  const [getSelectedTime, setGetSelectedTime] = useState("");
  const [selectDate, setSelectDate] = useState("");
  const taskKeyMap = {
    "New Data Add": "new_data_db",
    "No of New Calls": "new_calls_db",
    Leads: "leads_db",
    Demo: "demo_db",
    "Follow Up": "followUp_db",
    Target: "target_db",
    Training: "training_db",
    Installation: "installation_db",
    Recovery: "recovery_db",
    Support: "support_db",
  };

  useEffect(() => {
    const fetch = async () => {
      const result = await axios.get(
        `${base_url}/users/search-by-user/${userLoginId?.userId}`
      );
      console.log("product list hai", result.data.result?.assignProduct);
      setUserProduct(
        result.data?.result?.assignProduct.map((item) => item.label)
      );
    };
    fetch();
  }, []);

  const handleGoalsShow = async () => {
    try {
      // Toggle on each click
      setShowProgressMode((prev) => !prev);

      if (!showProgressMode) {
        const result = await axios.get(
          `${base_url}/schedule/get-goals/${userLoginId?.userId}`
        );
        
        setSelectDate(result.data.result.date_todo_db)
        setGetSelectedTime(result.data.result.deadline_db)
        console.log("goals", result.data.result.goals_db);
        setShowProgress(result.data.result.goals_db);
      }
    } catch (err) {
      console.log("internal error", err);
    }
  };

  useEffect(() => {
    const initialState = userProduct?.reduce((acc, product) => {
      acc[product] = ScheduleList.reduce((colAcc, col) => {
        colAcc[col] = "";
        return colAcc;
      }, {});
      return acc;
    }, {});
    setScheduleData(initialState);
  }, [userProduct]);

  const handleTimeChange = (time) => {
    setGetSelectedTime(time);
    // console.log("Selected Time:", time);
  };

  const handleScheduleGoals = async () => {
    console.log("schedulegoals", scheduleData);
    try {
      const result = await axios.post(`${base_url}/schedule/goal`, {
        userId: props.userLoginId,
        date: selectDate,
        deadline: getSelectedTime,
        goals: scheduleData,
        time: new Date().toLocaleTimeString(),
      });
      console.log(`${props.userLoginId} schedule golas saved`, result);
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
      if (
        err.response &&
        err.response.data &&
        err.response.data.message === "Missing required fields"
      ) {
        alert("fields cannot be empty");
      }
      if (
        err.response &&
        err.response.data &&
        err.response.data.message === "goal Schedule already"
      ) {
        alert("Goals Schedule already");
      }
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.heading}>
        <span>
          <h4>{userLoginId?.userId}</h4>
        </span>
        <span>
          <h3 style={{ textAlign: "center" }}>Schedule Goal</h3>
        </span>
        <span style={{ textAlign: "end" }}>
          <h4>
           Select Date:{" "}
            <input
              type="date"
              value={selectDate}
              onChange={(e) => setSelectDate(e.target.value)}
            />
          </h4>
        </span>
      </div>

      {/* Grid */}
      <div className={styles.outerScroll}>
        <div
          className={styles.gridWrapper}
          style={{
            gridTemplateColumns: `150px repeat(${userProduct?.length}, 120px)`,
          }}
        >
          {/* Header Row */}
          <div className={`${styles.gridItem} ${styles.stickyCol}`}>
            Task Type
          </div>
          {userProduct?.map((product) => (
            <div className={styles.gridItem} key={product}>
              {product}
            </div>
          ))}

          {/* Data Rows */}
          {ScheduleList.map((task) => {
            const backendTaskKey = taskKeyMap[task];
            return (
              <React.Fragment key={task}>
                <div className={`${styles.gridItem} ${styles.stickyCol}`}>
                  {task}
                </div>
                {userProduct?.map((product) => {
                  const progress = showProgress?.[product]?.[backendTaskKey];
                  return (
                    <div className={styles.gridItem} key={`${task}-${product}`}>
                      <input
                        type={showProgressMode ? "text" : "number"}
                        value={
                          showProgressMode && progress
                            ? `${progress.completed_db}/${progress.assigned_db}`
                            : scheduleData?.[product]?.[task] || ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setScheduleData((prev) => ({
                            ...prev,
                            [product]: {
                              ...prev[product],
                              [task]: val,
                            },
                          }));
                        }}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.setterdiv}>
        <h4>Set Deadline:</h4>
        <span style={{ width: "auto" }}>
      {showProgressMode  ? ` ${getSelectedTime}` :   <TimePickerComponent onTimeChange={handleTimeChange} />}
        </span>
      </div>

      <div className={styles.btn}>
        <button className={styles.custombtn} onClick={handleScheduleGoals}>
          Save Schedule
        </button>
        <button className={styles.custombtn} onClick={handleGoalsShow}>
          Refresh
        </button>
        {/* {props.onShowOpenRequest && (
          <button onClick={props.onCheckExtraTask}>Open Request</button>
        )} */}
      </div>
    </div>
  );
};

export default ScheduleOptima;
