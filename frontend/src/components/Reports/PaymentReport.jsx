import React, { useState, useEffect } from "react";
import styles from "./DataReport.module.css";
import { useContext } from "react";
import { AuthContext } from "../../context-api/AuthContext";
import axios from "axios";
import { base_url } from "../../config/config";


const PaymentReport = () => {
  const { userLoginId } = useContext(AuthContext);
  const [userProductList, setUserProductList] = useState([]);
  const [reportField, setReportField] = useState({
    assignTo: "",
    product: "",
    status: "",
    stage: "",
    dateFrom: "",
    dateTo: "",
  });
  const [generatedData, setGeneratedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    console.log("report");
    if (!userLoginId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        let result;
        let productsList;
        if (userLoginId?.userId === "SA") {
          result = await axios.get(
            `${base_url}/setting/get-superadmin-product`
          );
          productsList = result?.data?.result.map((p) => p.assign_product_name);
        } else {
          result = await axios.get(
            `${base_url}/users/search-by-user/${userLoginId?.userId}`
          );
          console.log("product", result.data.result);
          productsList = result?.data?.result?.assignProduct.map(
            (p) => p.label
          );
        }
        const products = productsList;
        setUserProductList(products);
      } catch (err) {
        console.log("internal error", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userLoginId]);

  const [stageOptions, setStageOptions] = useState([
    { label: "New Calls", value: "new_calls_db" },
    { label: "New Data", value: "new_data_db" },
    // { label: "Amc", value: "amc_db" },
    { label: "Demo", value: "demo_db" },
    { label: "Lead", value: "lead_db" },
    // { label: "Dispatched", value: "dispatched_db" },
    { label: "Follow up", value: "follow_up_db" },
    // { label: "In-process", value: "in-process_db" },
    { label: "Installation", value: "installation_db" },
    { label: "Recovery", value: "recovery_db" },
    { label: "Support", value: "support_db" },
    { label: "Training", value: "training_db" },
  ]);

  const handleChange = (name, value) => {
    setReportField((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setReportField({
      assignTo: "",
      product: "",
      taskType: "",
      // stage: "",
      dateFrom: "",
      dateTo: "",
    });
    setGeneratedData([]);
    setIsSearch(false);
  };


  const handleGenerateReport = async () => {
    // if(!reportField.product) return alert("Product field cannot be empty")
    try {
      const result = await axios.get(`${base_url}/report/payment`, {
        params: {
          ...reportField,
          userId: userLoginId.userId,
          roleType: userLoginId.roleType,
        },
      });
      console.log("generate report", result.data.result);

      setGeneratedData(doc);
      setIsSearch(true);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleDownloadPDFReport = async () => {
    // if(!reportField.product) return alert("Product field cannot be empty")
    setLoading(true);
    try {
      const result = await axios.get(`${base_url}/report/download-pdf`, {
        params: {
          ...reportField,
          userId: userLoginId.userId,
          roleType: userLoginId.roleType,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(result.data);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report.pdf";
      a.click();
    } catch (err) {
      console.log("internal error", err);
    }
    setLoading(false);
  };
  return (
    <div className={styles.main}>
      <div className={styles.body}>
        <div className={styles.section}>
          <span className={styles.fieldspan}>
            <label htmlFor="">User </label>
            <select
              name=""
              id=""
              value={reportField.assignTo}
              onChange={(e) => {
                handleChange("assignTo", e.target.value);
              }}
            >
              <option value="">--Select--</option>
              <option value="A01_SA">A01_SA</option>
              <option value="A02_SA">A02_SA</option>
              <option value="E01_SA">E01_SA</option>
              <option value="E02_SA">E02_SA</option>
            </select>
          </span>
          <span className={styles.fieldspan}>
            <label htmlFor="">Product</label>
            <select
              name=""
              id=""
              value={reportField.product}
              onChange={(e) => {
                handleChange("product", e.target.value);
              }}
            >
              <option value="">--Select--</option>
              {userProductList.map((item, idx) => (
                <option value={item}>{item}</option>
              ))}
            </select>
          </span>
          {/* <span className={styles.fieldspan}>
            <label htmlFor="">Stage</label>
            <select
              name=""
              id=""
              value={reportField.stage}
              onChange={(e) => {
                handleChange("stage", e.target.value);
              }}
            >
              <option value="">--Select--</option>
              {stageOptions.map((item, idx) => (
                <option value={item.value}>{item.label}</option>
              ))}
            </select>
          </span> */}
          <span className={styles.fieldspan}>
            <label htmlFor="">TaskType </label>
            <select
              name=""
              id=""
              value={reportField.taskType}
              onChange={(e) => {
                handleChange("taskType", e.target.value);
              }}
            >
              <option value="">--Select--</option>
              <option value="Self Task">Self Task</option>
              <option value="Admin Task">Admin Task</option>
              <option value="Request">Request</option>
            </select>
          </span>
          <span className={styles.fieldspan}>
            <label htmlFor="">From</label>
            <input
              type="date"
              value={reportField.dateFrom}
              onChange={(e) => {
                handleChange("dateFrom", e.target.value);
              }}
            />
          </span>
          <span className={styles.fieldspan}>
            <label htmlFor="">To</label>
            <input
              type="date"
              value={reportField.dateTo}
              onChange={(e) => {
                handleChange("dateTo", e.target.value);
              }}
            />
          </span>
        </div>
        <div className="align-end">
          <button
            onClick={() => {
              handleReset();
            }}
            className={styles.btn}
          >
            Reset
          </button>
          <button
            onClick={() => {
              handleGenerateReport();
            }}
            className={styles.btn}
          >
            Generate
          </button>
          <button
            onClick={() => {
              handleDownloadPDFReport();
            }}
            className={styles.btn}
          >
            {loading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReport;
