import React, { useState, useEffect } from "react";
import styles from "./DataReport.module.css";
import { useContext } from "react";
import { AuthContext } from "../../context-api/AuthContext";
import axios from "axios";
import { base_url } from "../../config/config";

const ProgressReport = () => {
  const { userLoginId } = useContext(AuthContext);
  const [userProductList, setUserProductList] = useState([]);
  const [reportField, setReportField] = useState({
    assignTo: "",
    product: "",
    taskType: "",
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

  const handleCalci = (complete, assign) => {
    const value = (complete / assign) * 100;
    let percent = Math.round(value);
    if (Number.isNaN(percent) || percent === Infinity) {
      return 0;
    }
    return percent;
  };

  const handleGenerateReport = async () => {
    // if(!reportField.product) return alert("Product field cannot be empty")
    try {
      const result = await axios.get(`${base_url}/report/progress`, {
        params: {
          ...reportField,
          userId: userLoginId.userId,
          roleType: userLoginId.roleType,
        },
      });
      console.log("generate report", result.data.result);
      const report = result.data.result;
      const doc = report.map((item) => ({
        date_db: item.date_db,
        product_db: item.product_db || "NA",
        new_call_complete: item.new_calls_db?.completed ?? 0,
        new_data_complete: item.new_data_db?.completed ?? 0,
        followUp_complete: item.followUp_db?.completed ?? 0,
        lead_complete: item.leads_db?.completed ?? 0,
        demo_complete: item.demo_db?.completed ?? 0,
        installation_complete: item.installation_db?.completed ?? 0,
        recovery_complete: item.recovery_db?.completed ?? 0,
        training_complete: item.training_db?.completed ?? 0,
        support_complete: item.support_db?.completed ?? 0,

        new_call_assign: reportField.taskType === "Self Task" ? item.new_calls_db?.selfAssign : item.new_calls_db?.adminAssign ,
        new_data_assign: reportField.taskType === "Self Task" ? item.new_data_db?.selfAssign : item.new_data_db?.adminAssign  ,
        followUp_assign: reportField.taskType === "Self Task" ? item.followUp_db?.selfAssign : item.followUp_db?.adminAssign ,
        lead_assign: reportField.taskType === "Self Task" ? item.leads_db?.selfAssign : item.leads_db?.adminAssign ,
        demo_assign: reportField.taskType === "Self Task" ? item.demo_db?.selfAssign : item.demo_db?.adminAssign ,
        installation_assign: reportField.taskType === "Self Task" ? item.installation_db?.selfAssign : item.installation_db?.adminAssign ,
        recovery_assign: reportField.taskType === "Self Task" ? item.recovery_db?.selfAssign : item.recovery_db?.adminAssign ,
        training_assign:reportField.taskType === "Self Task" ? item.training_db?.selfAssign : item.training_db?.adminAssign ,
        support_assign: reportField.taskType === "Self Task" ? item.support_db?.selfAssign : item.support_db?.adminAssign ,
      }));
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
      <div className={styles.tablediv}>
        {!loading && generatedData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Date</th>
                <th>Product</th>
                <th>New Call</th>
                <th>New Data</th>
                <th>Follow Up</th>
                <th>Lead</th>
                <th>Demo</th>
                <th>Installation</th>
                <th>Recovery</th>
                <th>training</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {generatedData.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{row.date_db}</td>
                  <td>{row.product_db}</td>

                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.new_call_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.new_call_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.new_call_complete,
                              row.new_call_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.new_call_complete,
                          row.new_call_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.new_data_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.new_data_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.new_data_complete,
                              row.new_data_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.new_data_complete,
                          row.new_data_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.followUp_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.followUp_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.followUp_complete,
                              row.followUp_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.followUp_complete,
                          row.followUp_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.lead_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.lead_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.lead_complete,
                              row.lead_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.lead_complete,
                          row.lead_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.demo_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.demo_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.demo_complete,
                              row.demo_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.demo_complete,
                          row.demo_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.installation_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.installation_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.installation_complete,
                              row.installation_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.installation_complete,
                          row.installation_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.recovery_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.recovery_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.recovery_complete,
                              row.recovery_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.recovery_complete,
                          row.recovery_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.training_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.training_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.training_complete,
                              row.training_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.training_complete,
                          row.training_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                  <td style={{ padding: "6px 3px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.support_complete}
                        </span>

                        <span style={{ color: "#64748b", fontWeight: 700 }}>
                          –
                        </span>

                        <span
                          style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: ".8rem",
                          }}
                        >
                          {row.support_assign}
                        </span>
                      </span>

                      <strong
                        style={{
                          fontWeight: 700,
                          color:
                            handleCalci(
                              row.support_complete,
                              row.support_assign
                            ) >= 70
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {handleCalci(
                          row.support_complete,
                          row.support_assign
                        )}
                        %
                      </strong>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          isSearch && <h2 style={{ textAlign: "center" }}>No Record Found</h2>
        )}
      </div>

      {loading && <div>Loading...</div>}
    </div>
  );
};

export default ProgressReport;
