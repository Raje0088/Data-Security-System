import React,{useState,useEffect} from "react";
import { Chart as ChartJS, defaults, scales } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import styles from "./Graph.module.css";
import axios from "axios";
import { base_url } from "../../config/config";


defaults.maintainAspectRatio = false;
defaults.responsive = true;

const Graph = ({ userLoginId = "E02_SA" }) => {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const result = await axios.get(
          `${base_url}/progress/get-graph/${userLoginId}`
        );
        console.log("result graph", result.data.result);
        setGraphData(result.data.result);
      } catch (err) {
        console.log("intenal error", err);
      }
    };
    fetchGraph();
  }, []);
  return (
    <div className={styles["graph-wrapper"]}>
      <Line
        data={{
          labels:graphData?.date_db,
          datasets: [
            {
              label: "Ideal",
              data: graphData?.ideal_db || [],
              backgroundColor: "white",
              borderColor: "purple",
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Actual",
              data: graphData?.actual_db || [],
              backgroundColor: "white",
              borderColor: "aqua",
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          interaction: {
            mode: "index",
            intersect: false,
          },
        }}
      />
    </div>
  );
};

export default Graph;
