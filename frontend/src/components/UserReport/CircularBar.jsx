import React, { useEffect, useRef, useState } from "react";
import styles from "./CircularBar.module.css";

// const CircularBar = ({ percentage }) => {
//   const rightRef = useRef();
//   const leftRef = useRef();

//   useEffect(() => {
//     const right = rightRef.current;
//     const left = leftRef.current;

//     if (percentage <= 50) {
//       const rotateRight = (percentage / 50) * 180;
//       right.style.transform = `rotate(${rotateRight}deg)`;
//       left.style.transform = `rotate(0deg)`;
//     } else {
//       right.style.transform = `rotate(180deg)`;
//       const rotateLeft = ((percentage - 50) / 50) * 180;
//       left.style.transform = `rotate(${rotateLeft}deg)`;
//     }
//   }, [percentage]);

//   return (
//     <div className={styles["circle-wrap"]}>
//       <div className={styles.circle}>
//         <div className={`${styles.mask} ${styles.full}`}>
//           <div className={styles.fill} ref={rightRef}></div>
//         </div>
//         <div className={`${styles.mask} ${styles.half}`}>
//           <div className={styles.fill} ref={leftRef}></div>
//         </div>
//         <div className={styles["inside-circle"]}>{percentage}%</div>
//       </div>
//     </div>
//   );
// };

const CircularBar = ({ targetProgress = 0 ,barLabel,showDailyReport , dailyGoals}) => {
  const [progress, setProgress] = useState(0);
  let r = 50,
    strokeWidth = 10;
  const normalizedRadius = r - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(targetProgress);
    }, [1000]);
    return () => {
      clearTimeout(timeout);
    };
  }, [targetProgress]);
  let strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStrokeColor = (progress) => {
    const r = 255 - Math.round((progress / 100) * 255);
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <>
      <div className={styles.box}>
        <div className={styles.rectangle}>
          <div>
            <h3 style={{ color: "white", textAlign: "left" }}>{barLabel}</h3>
          </div>
          <div className={styles["rectangle-content"]}>
            <p >Today: { showDailyReport && showDailyReport.length>0 ? showDailyReport[0][dailyGoals]: "Loading..."}</p>
            <p>Weekly: 70</p>
            <p>Lifetime: 70</p>
          </div>
        </div>
        <div className={styles.circle}>
          <svg width="100%" height="100%" viewBox="0 0 120 120">
            <circle
              r={normalizedRadius}
              cx="60"
              cy="60"
              strokeWidth={strokeWidth}
              stroke="white"
              fill="black"
            ></circle>
            <circle
              r={normalizedRadius}
              cx="60"
              cy="60"
              stroke={getStrokeColor(progress)}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={styles.circularbar}
            ></circle>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="aqua"
              style={{ fontSize: "24px", fontWeight: "700" }}
            >
              {progress}
            </text>
          </svg>
        </div>
      </div>
    </>
  );
};

export default CircularBar;
