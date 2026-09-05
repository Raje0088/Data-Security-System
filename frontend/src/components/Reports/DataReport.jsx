import React, { useState, useEffect } from "react";
import styles from "./DataReport.module.css";
import { useContext } from "react";
import { AuthContext } from "../../context-api/AuthContext";
import axios from "axios";
import { base_url } from "../../config/config";

const DataReport = () => {
  const { userLoginId } = useContext(AuthContext);
  const [userProductList, setUserProductList] = useState([]);
  const [reportField, setReportField] = useState({
    userId: "",
    product: "",
    stage: "",
    status: "",
    label: "",
    dateFrom: "",
    dateTo: "",
    state: "",
    district: "",
    pincode: "",
  });
  const [generatedData, setGeneratedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [pincodeList, setPincodeList] = useState([]);
  const [isSearch, setIsSearch] = useState(false)

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
          productsList =  result?.data?.result.map((p) => p.assign_product_name);
        } else {
          result = await axios.get(
            `${base_url}/users/search-by-user/${userLoginId?.userId}`
          );
          console.log("product", result.data.result);
          productsList =  result?.data?.result?.assignProduct.map((p) => p.label);
        }
        const products = productsList
        setUserProductList(products);
      } catch (err) {
        console.log("internal error", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userLoginId]);

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const result = await axios.post(`${base_url}/pincode/filter-area`, {
          stateArray: [reportField.state],
          districtArray: [reportField.district],
        });
        console.log("area", result.data);
        setStateList(result.data.stateList);
        setDistrictList(result.data.districtList);
        setPincodeList(result.data.pincodeList);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchArea();
  }, [reportField.state, reportField.district]);

  const [stageOptions, setStageOptions] = useState([
    { label: "Amc", value: "amc_db" },
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
    if (name === "state") {
      setReportField((prev) => ({
        ...prev,
        district: "",
        pincode: "",
      }));
    }
    if (name === "district") {
      setReportField((prev) => ({
        ...prev,
        pincode: "",
      }));
    }
  };

  const handleReset = ()=>{
    setReportField({
    assignTo: "",
    product: "",
    stage: "",
    status: "",
    label: "",
    dateFrom: "",
    dateTo: "",
    state: "",
    district: "",
    pincode: "",
  })
  setGeneratedData([])
  setIsSearch(false)
}

  const handleGenerateReport = async () => {
    // if(!reportField.product) return alert("Product field cannot be empty")
    try {
      const result = await axios.get(`${base_url}/report/data`, {
        params: { ...reportField,userId:userLoginId.userId, roleType:userLoginId.roleType },
      });
      console.log("generate report", result.data.result);
      const report = result.data.result;
      // const doc = report.map(i=>i.doc)
      setGeneratedData(report);
      setIsSearch(true)
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleDownloadPDFReport = async () => {
    // if(!reportField.product) return alert("Product field cannot be empty")
    setLoading(true)
    try {
      const result = await axios.get(`${base_url}/report/download-pdf`, {
        params: { ...reportField,userId:userLoginId.userId, roleType:userLoginId.roleType },
        responseType:"blob",
      });
      const url = window.URL.createObjectURL(result.data)

      const a = document.createElement("a")
      a.href = url
      a.download = "report.pdf"
      a.click()
    } catch (err) {
      console.log("internal error", err);
    }
    setLoading(false)
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
          <span className={styles.fieldspan}>
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
          </span>

          <span className={styles.fieldspan}>
            <label htmlFor="">Status</label>
            <select
              name=""
              id=""
              value={reportField.status}
              onChange={(e) => {
                handleChange("status", e.target.value);
              }}
            >
              <option value="">--Select--</option>
              <option value="Done">Done</option>
              <option value="Cancel">Cancel</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Unordered">Unordered</option>
              <option value="Posponed">Posponed</option>
                 <option value="Defaulter">Defaulter</option>
            </select>
          </span>
          <span className={styles.fieldspan}>
            <label htmlFor="">Label</label>
            <select
              name=""
              id=""
              value={reportField.label}
              onChange={(e) => {
                handleChange("label", e.target.value);
              }}
            >
              <option value="">--Select--</option>
              <option value="Hot">Hot</option>
              <option value="Interested">Interested</option>
              <option value="Less Interested">Less Interested</option>
              <option value="Lost">Lost</option>
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
          <span className={styles.fieldspan}>
            <label htmlFor="">State</label>
            <select
              type="text"
              value={reportField.state}
              onChange={(e) => {
                handleChange("state", e.target.value);
              }}
            >
              <option value="">--Select</option>
              {stateList.map((st) => (
                <option value={st}>{st}</option>
              ))}
            </select>
          </span>

          <span className={styles.fieldspan}>
            <label htmlFor="">District</label>
            <select
              type="text"
              value={reportField.district}
              onChange={(e) => {
                handleChange("district", e.target.value);
              }}
            >
              <option value="">--Select</option>
              {districtList.map((dist) => (
                <option value={dist.districtName}>{dist.districtName}</option>
              ))}
            </select>
          </span>
          <span className={styles.fieldspan}>
            <label htmlFor="">Pincode</label>
            <select
              type="text"
              value={reportField.pincode}
              onChange={(e) => {
                handleChange("pincode", e.target.value);
              }}
            >
              <option value="">--Select</option>
              {pincodeList.map((pin) => (
                <option value={pin.pincode}>{pin.pincode}</option>
              ))}
            </select>
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
           {loading ? "Downloading..." :  "Download PDF"}
          </button>
        </div>
      </div>
      <div className={styles.tablediv}>
        {!loading && generatedData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Assign To</th>
                <th>Client Type</th>
                <th>Status</th>
                <th>Product</th>
                <th>Date</th>
                <th>FollowUp Date</th>
                <th>Upcoming Date</th>
                <th>Client Id</th>
                <th>Client Name</th>
                <th>Optical Name</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>District</th>
                <th>State</th>
                <th>Pincode</th>
                <th>Last Paid Date</th>
                <th>Paid Amount</th>
                <th>Mode of Payment</th>
                <th>Contact Person</th>
              </tr>
            </thead>
            <tbody>
              {generatedData.map((item, idx) => (
                <tr>
                  <td>{idx + 1}</td>
                  <td>{item?.userId_db}</td>
                  <td>{item?.database_status_db}</td>
                  <td>{item?.completion_db?.status}</td>
                  {console.log(
                    "===============>",
                    item?.product_db.find(
                      (p) => p.label === reportField.product
                    )
                  )}
                  <td>
                    {
                      item?.product_db?.find(
                        (p) => p.label === reportField.product
                      )?.label
                    }
                  </td>
                  <td>{item.date_db}</td>
                  <td>{item.followup_db}</td>
                  <td>{item?.completion_db?.newExpectedDate}</td>
                  <td>{item.client_id}</td>
                  <td>{item.client_name_db}</td>
                  <td>{item.optical_name1_db}</td>
                  <td>
                    {item.mobile_1_db} / {item.mobile_2_db}
                  </td>
                  <td>{item.address_1_db}</td>
                  <td>{item.district_db}</td>
                  <td>{item.state_db}</td>
                  <td>{item.pincode_db}</td>
                  <td>{item.date_db}</td>
                  <td>{item?.amountDetails_db?.paidAmount}</td>
                  <td>{item?.amountDetails_db?.mode}</td>
                  <td>{item.userId_db}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isSearch && (
          <h2 style={{ textAlign: "center" }}>No Record Found</h2>
        )}
      </div>

      {loading && <div>Loading...</div>}
    </div>
  );
};

export default DataReport;
