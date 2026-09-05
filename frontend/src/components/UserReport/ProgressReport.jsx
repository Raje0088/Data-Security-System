import React from "react";
import styles from "./ProgressReport.module.css";
import CircularBar from "./CircularBar";
import Graph from "./Graph";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { base_url } from "../../config/config";

const ProgressReport = ({ userLoginId = "E02_SA" }) => {
  const [showDailyReport, setShowDailyReport] = useState([]);
  const [showInstallation, setShowInstallation] = useState(0);
  const [showDemo, setShowDemo] = useState(0);
  const [showTarget, setShowTarget] = useState(0);
  const [showRecovery, setShowRecovery] = useState(0);
  const [showNewCall, setShowNewCall] = useState(0);
  const [showSupport, setShowSupport] = useState(0);
  const [overAllPercentage, setOverAllPercentage] = useState(0);
  const [overAllToday, setOverAllToday] = useState(0);
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          `${base_url}/progress/getprogress/${userLoginId}`
        );
        console.log("repoert", result.data.result);
        setShowDailyReport(result.data.result);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchReport();
  }, []);

  useEffect(() => {
    if (showDailyReport && showDailyReport.length > 0) {
      setShowInstallation(
        calculatePercentage(
          showDailyReport[0].daily_installation_completed_db,
          showDailyReport[0].daily_installation_assigned_db
        )
      );
      setShowDemo(
        calculatePercentage(
          showDailyReport[0].daily_demo_completed_db,
          showDailyReport[0].daily_demo_assigned_db
        )
      );
      setShowTarget(
        calculatePercentage(
          showDailyReport[0].daily_target_completed_db,
          showDailyReport[0].daily_target_assigned_db
        )
      );
      setShowRecovery(
        calculatePercentage(
          showDailyReport[0].daily_recovery_completed_db,
          showDailyReport[0].daily_recovery_assigned_db
        )
      );
      setShowNewCall(
        calculatePercentage(
          showDailyReport[0].daily_no_of_new_calls_completed_db,
          showDailyReport[0].daily_no_of_new_calls_assigned_db
        )
      );
      setShowSupport(
        calculatePercentage(
          showDailyReport[0].daily_support_completed_db,
          showDailyReport[0].daily_support_assigned_db
        )
      );
      setOverAllPercentage(handleOverallDaily());
    }
  }, [showDailyReport]);


  const handleOverallDaily = () => {
    const Assign =
      showDailyReport[0].daily_demo_assigned_db +
      showDailyReport[0].daily_followup_assigned_db +
      showDailyReport[0].daily_installation_assigned_db +
      showDailyReport[0].daily_no_of_new_calls_assigned_db +
      showDailyReport[0].daily_recovery_assigned_db +
      showDailyReport[0].daily_support_assigned_db +
      showDailyReport[0].daily_target_assigned_db;
    const completed =
      showDailyReport[0].daily_demo_completed_db +
      showDailyReport[0].daily_followup_completed_db +
      showDailyReport[0].daily_installation_completed_db +
      showDailyReport[0].daily_no_of_new_calls_completed_db +
      showDailyReport[0].daily_recovery_completed_db +
      showDailyReport[0].daily_support_completed_db +
      showDailyReport[0].daily_target_completed_db;
    const percentage = ((completed / Assign) * 100).toFixed(0);
    setOverAllToday(completed);
    return percentage;
  };

  const calculatePercentage = (done, total) => {
    const percentage = ((done / total) * 100).toFixed(0);
    return percentage;
  };
  return (
    <div className={styles.main}>
      <div className={styles.sidebar}>d</div>
      <div className={styles.content}>
        <div className={styles.piediv}>
          <CircularBar
            targetProgress={showInstallation}
            barLabel={"Installation"}
            showDailyReport={showDailyReport}
            dailyGoals={"daily_installation_completed_db"}
          />
          <CircularBar
            targetProgress={showNewCall}
            barLabel={"New Call"}
            showDailyReport={showDailyReport}
            dailyGoals={"daily_no_of_new_calls_completed_db"}
          />
          <CircularBar
            targetProgress={showRecovery}
            barLabel={"Recovery"}
            showDailyReport={showDailyReport}
            dailyGoals={"daily_recovery_completed_db"}
          />
          <CircularBar
            targetProgress={showDemo}
            barLabel={"Demo"}
            showDailyReport={showDailyReport}
            dailyGoals={"daily_demo_completed_db"}
          />
          <CircularBar
            targetProgress={showTarget}
            barLabel={"Target"}
            showDailyReport={showDailyReport}
            dailyGoals={"daily_target_completed_db"}
          />
          <CircularBar
            targetProgress={showSupport}
            barLabel={"Support"}
            showDailyReport={showDailyReport}
            dailyGoals={"daily_support_completed_db"}
          />
        </div>
        <div className={styles.graphdiv}>
          <div className={styles["graphdiv-left"]}>
            <div className={styles["graphdiv-left-up"]}>
              <Graph />
            </div>
            <div className={styles["graphdiv-left-down"]}>
              <div
                style={{
                  background: "red",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <h2 style={{ fontSize: "22px" }}> Over All Performance</h2>
              </div>
              <div className={styles.overall}>
                <CircularBar
                  targetProgress={overAllPercentage}
                  barLabel={"Daily"}
                  showDailyReport={showDailyReport}
                  dailyGoals={overAllToday}
                />
                <CircularBar targetProgress={"100"} />
                {/* <CircularBar targetProgress={"100"} /> */}
              </div>
            </div>
          </div>
          <div className={styles["graphdiv-right"]}>
            <div className={styles["graphdiv-right-up"]}>
              <div
                style={{
                  background: "red",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <h2 style={{ fontSize: "22px" }}>Lead Conversion Ratio</h2>
              </div>
              <div className={styles["graphdiv-leadbox"]}>
                <h2>Task</h2>
                <h2>Done</h2>
                <h2>Total</h2>
                <h2>Ratio</h2>
              </div>
              <div className={styles["graphdiv-leadbox"]}>
                <h2>Leads</h2>
                <h2>55</h2>
                <h2>100</h2>
                <h2 style={{ background: "red" }}>20</h2>
              </div>
              <div className={styles["graphdiv-leadbox"]}>
                <h2>Installation</h2>
                <h2>
                  {showDailyReport?.length > 0
                    ? showDailyReport[0].daily_installation_completed_db
                    : 0}
                </h2>
                <h2>
                  {showDailyReport?.length > 0
                    ? showDailyReport[0].daily_installation_assigned_db
                    : 0}
                </h2>
                <h2 style={{ background: "red" }}>
                  {showDailyReport?.length > 0
                    ? showDailyReport[0].daily_installation_assigned_db 
                    : 0}
                </h2>
              </div>
              <div className={styles["graphdiv-leadbox"]}>
                <h2>Recovery</h2>
                <h2>55</h2>
                <h2>100</h2>
                <h2 style={{ background: "red" }}>20</h2>
              </div>
              <div className={styles["graphdiv-leadbox"]}>
                <h2>Support</h2>
                <h2>55</h2>
                <h2>100</h2>
                <h2 style={{ background: "red" }}>20</h2>
              </div>
              <div className={styles["graphdiv-leadbox"]}>
                <h2>Demo</h2>
                <h2>55</h2>
                <h2>100</h2>
                <h2 style={{ background: "red" }}>20</h2>
              </div>
            </div>
            <div className={styles["graphdiv-right-down"]}>
              <div className={styles.admindiv}>
                <div>
                  <h2
                    style={{
                      width: "100%",
                      fontSize: "20px",
                      borderBottom: "2px solid white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {" "}
                    Assign Task Progress
                  </h2>
                  <div className={styles.admintask}>
                    <h2>Task</h2>
                    <h2>Done</h2>
                    <h2>Total</h2>
                    <h2>Ratio</h2>
                  </div>
                  <div className={styles.admintask}>
                    <h2>Leads</h2>
                    <h2>55</h2>
                    <h2>100</h2>
                    <h2>20</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;
