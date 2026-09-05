import React from "react";
import styles from "./ReportDashboard.module.css";
import DataReport from "./DataReport.jsx";
import EmployeeReport from "./EmployeeReport.jsx";
import ProgressReport from "./ProgressReport.jsx";
import PaymentReport from "./PaymentReport.jsx";
import { useState } from "react";

const ReportDashboard = () => {
  const [selectComponent, setSelectComponent] = useState("data");
  return (
    <div className={styles.main}>
      <div className="heading-div">
        <h2>Report</h2>
      </div>
      <div className={styles["report-option"]}>
        <button
          style={selectComponent === "data" ? { background: "blue" } : {}}
          onClick={() => {
            setSelectComponent("data");
          }}
        >
          Data
        </button>
        <button
          style={selectComponent === "progress" ? { background: "blue" } : {}}
          onClick={() => {
            setSelectComponent("progress");
          }}
        >
          Progress
        </button>
        <button
          style={selectComponent === "employee" ? { background: "blue" } : {}}
          onClick={() => {
            setSelectComponent("employee");
          }}
        >
          User
        </button>
        <button
          style={selectComponent === "payment" ? { background: "blue" } : {}}
          onClick={() => {
            setSelectComponent("payment");
          }}
        >
          Payment
        </button>
      </div>
      <div>
        {selectComponent === "data" && <DataReport />}
        {selectComponent === "progress" && <ProgressReport />}
        {selectComponent === "employee" && <EmployeeReport />}
        {selectComponent === "payment" && <PaymentReport />}
      </div>
    </div>
  );
};

export default ReportDashboard;
