/*========================================================*/

import React, { useEffect, useState } from "react";
import { TiEdit } from "react-icons/ti";
import { MdOutlineDeleteForever } from "react-icons/md";
// import "./setting.css";
import styles from "./Setting.module.css";
import { CiEdit } from "react-icons/ci";
import { FaDownload } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { base_url } from "../config/config";
import { AuthContext } from "../context-api/AuthContext";
import { useContext } from "react";
import placeEdit from "../assets/placeEdit.png";
import MessageModal from "./Message/MessageModal";


const Setting = () => {
  const { userLoginId } = useContext(AuthContext);
  const [roleName, setRoleName] = useState("");
  const [division, setDivision] = useState("");
  const [assignProduct, setAssignProduct] = useState("");
  const [listRoleName, setListRoleName] = useState([]);
  const [listDivision, setListDivision] = useState([]);
  const [listAssignProduct, setListAssignProduct] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editAssignproductIndex, setEditAssignproductIndex] = useState(null);
  const [divisionIndex, setDivisionIndex] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [divisionToAssignProduct, setDivisionToAssignProduct] = useState({});
  const [trigger, setTrigger] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [openUpdateArea, setOpenUpdateArea] = useState(false);
  const [areaSection, setAreaSection] = useState({
    country: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    pincode: "",
  });
  const [newlyAddedPincode, setNewlyAddedPincode] = useState([]);
  const [selectUpdatingPincode, setSelectUpdatingPincode] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadTotalCount, setUploadTotalCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Ready to upload");
  const [totalPincode, setTotalPincode] = useState(0);
  const [uploadPincode, setUploadPincode] = useState(0);
  const [manualPincode, setManualPincode] = useState(0);
  const [autoShotEmail, setAutoShotEmail] = useState("");
  const [autoEmail, setAutoEmail] = useState("");
  const [autoEmailPassword, setAutoEmailPassword] = useState("");
  const [autoEmailIndex, setAutoEmailIndex] = useState(null);
  const [fetchBackupEmail, setFetchBackupEmail] = useState([]);
  const [showArealist, setShowArealist] = useState([]);
  const [searchAreaField, setSearchAreaField] = useState(null);
  const [searchAreaName, setSearchAreaName] = useState(null);
  const [selectedAreaOption, setSelectedAreaOption] = useState({
    prevName: "",
    changeName: "",
  });
  const [openMessage,setOpenMessage] = useState(false)

  useEffect(() => {
    const fetchRoleName = async () => {
      const res = await fetch(`${base_url}/setting/rolename-data`);
      const data = await res.json();
      setListRoleName(data.result);
      // console.log(data.result);
    };
    fetchRoleName();
  }, [refresh]);

  useEffect(() => {
    const fetchDivisionData = async () => {
      const res = await fetch(`${base_url}/setting/division-data`);
      const data = await res.json();
      setListDivision(data.result);
      console.log(data.result);
    };
    fetchDivisionData();
  }, [refresh]);

  useEffect(() => {
    if (listDivision.length === 0) return;

    const fetchAssignProductsByDivision = async () => {
      const map = {};
      for (const division of listDivision) {
        try {
          const res = await axios.get(
            `${base_url}/setting/assignproduct-data/${division._id}`
          );
          map[division._id] = res.data.result || [];
          console.log("yo", res.data.result);
        } catch (err) {
          console.error(
            `Error fetching products for division ${division.division_id}`,
            err
          );
          map[division._id] = [];
        }
      }
      setDivisionToAssignProduct(map);
      console.log("map is", map);
    };

    fetchAssignProductsByDivision();
  }, [listDivision]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await axios.get(`${base_url}/pincode/area-list`, {
          params: { name: searchAreaField, search: searchAreaName },
        });
        console.log("area", result.data);
        setShowArealist(result.data.result);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetch();
  }, [searchAreaField, searchAreaName]);

  const getAssignProductData = async (e, divisionId) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `${base_url}/setting/assignproduct-data/${divisionId}`
      );
      console.log(res.data.result);
      setListAssignProduct(res.data.result);
    } catch (err) {
      console.log("product not found", err);
    }
    setRefresh((prev) => !prev);
  };

  const AddRoleName = async (e) => {
    e.preventDefault();
    if (roleName.trim() === "") {
      return alert("RoleName Cannot be Empty");
    }
    try {
      if (editIndex) {
        const result = await axios.put(
          `${base_url}/setting/update-rolename/${editIndex}`,
          { rolename: roleName }
        );
        console.log("rolename updated", result.data);
        setEditIndex(null);
      } else {
        const result = await axios.post(`${base_url}/setting/rolename`, {
          rolename: roleName,
        });
        console.log("rolename added", result.data);
      }
      setRoleName("");
    } catch (err) {
      F;
      if (
        err &&
        err.response &&
        err.response.data &&
        err.response.data.err == "DUPLICATE_KEY"
      ) {
        return alert("Duplicate not allowed in RoleName");
      }
      console.log("Error in rolename", err);
    }
    setRefresh((prev) => !prev);
  };
  function editTextTypeName(type, name, idx) {
    if (type === "Rolename") {
      setRoleName(name);
      console.log(name);
      setEditIndex(idx);
      console.log(idx);
    } else if (type === "Division") {
      setDivision(name);
      console.log(name);
      setEditIndex(idx);
      console.log(idx);
    } else if (type === "AssignProduct") {
      setAssignProduct(name);
      console.log(name);
      setEditAssignproductIndex(idx);
      console.log(idx);
    }
  }
  const deleteRole = async (index) => {
    try {
      const result = await axios.delete(
        `${base_url}/setting/delete-rolename/${index}`
      );
      console.log("rolename delelted", result);
    } catch (err) {
      console.log("rolename not delete", err);
    }
    setRefresh((prev) => !prev);
  };

  const AddDivision = async (e) => {
    e.preventDefault();
    console.log("hi");
    if (!division) {
      return alert("Empty field not allowed");
    }
    try {
      if (editIndex) {
        const result = await axios.put(
          `${base_url}/setting/update-division/${editIndex}`,
          {
            division: division,
          }
        );
        console.log("division update", result);
        setEditIndex(null);
      } else {
        const result = await axios.post(`${base_url}/setting/division`, {
          division: division,
        });
        console.log("division added", result);
      }
    } catch (err) {
      console.log("Division not created", err);
    }

    setDivision("");
    setRefresh((prev) => !prev);
  };
  // =============================
  const AddAssignProduct = async (e) => {
    e.preventDefault();
    console.log("d", divisionIndex);
    try {
      if (editAssignproductIndex) {
        const result = await axios.put(
          `${base_url}/setting/update-assign-product/${editAssignproductIndex}`,
          {
            assignproduct: assignProduct,
          }
        );
        console.log("assignProduct updated", result);
        setEditAssignproductIndex(null);
      } else {
        const result = await axios.post(`${base_url}/setting/assignproduct`, {
          divisionId: divisionIndex,
          assignProduct: assignProduct,
        });
        console.log("assignProduct added", result);
      }
    } catch (err) {
      console.log("assignproduct not created", err);
    }
    getAssignProductData(e, divisionIndex);
    setAssignProduct("");
    setRefresh((prev) => !prev);
  };

  async function deleteDivision(e, divisionIdx) {
    console.log(divisionIdx);
    try {
      const result = await axios.delete(
        `${base_url}/setting/delete-division/${divisionIdx}`
      );
      console.log("division deleted", result);
    } catch (err) {
      console.log("divsion not delete");
    }
    setRefresh((prev) => !prev);
    getAssignProductData(e, divisionIndex);
  }
  async function deleteAssignProduct(e, assignProductIdx) {
    console.log(assignProductIdx);
    console.log("di", divisionIndex);
    try {
      const result = await axios.delete(
        `${base_url}/setting/delete-assign-product/${assignProductIdx}`
      );
      console.log("assignproduct deleted", result);
    } catch (err) {
      console.log("assignproduct not delete");
    }
    getAssignProductData(e, divisionIndex);
    setRefresh((prev) => !prev);
  }
  useEffect(() => {
    if (areaSection.pincode?.length !== 6) return;
    const delayDebounce = setTimeout(() => {
      const checkPincode = async () => {
        if (areaSection.pincode.length >= 4) {
          try {
            const result = await axios.get(
              `${base_url}/pincode/search-pincode`,
              {
                params: { pincode: areaSection.pincode },
              }
            );
            const check = result.data.count;
            if (check != 0) {
              setTrigger(true);
              console.log("search found=====>", result.data);
            } else {
              setTrigger(false);
              console.log("search NOT found======>", result.data);
            }
          } catch (err) {
            console.log("internal error in checkpincode", err);
          }
        }
      };
      checkPincode();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [areaSection.pincode]);

  const SavePincodeData = async () => {
    if (
      areaSection.pincode.length === 0 ||
      areaSection.state.length === 0 ||
      areaSection.district.length === 0
    ) {
      return alert("no empty field");
    }
    setIsSearch(false);
    try {
      const result = await axios.post(`${base_url}/pincode/create-pincode`, {
        pincode: areaSection.pincode.trim().toUpperCase(),
        district: areaSection.district.trim().toUpperCase(),
        village: areaSection.village.trim().toUpperCase(),
        state: areaSection.state.trim().toUpperCase(),
        country: areaSection.country.trim().toUpperCase(),
        taluka: areaSection.taluka.trim().toUpperCase(),
      });
      if (result.data.message === "Pincode already exists in database") {
        console.log("⚠️ Pincode already exists", result.data.result);
        alert("Pincode already exists in the database.");
      } else {
        console.log("✅ Pincode Added to DB Successfully", result.data);
        alert("Pincode added successfully.");
      }
      setAreaSection((prev) => ({
        ...prev,
        country: "",
        state: "",
        district: "",
        taluka: "",
        village: "",
        pincode: "",
      }));
      setRefresh((prev) => !prev);
      console.log("Pincode  Added to  DB Successfully", result.data);
    } catch (err) {
      console.log("error in server", err);
    }
  };
  useEffect(() => {
    const fetchPincode = async () => {
      try {
        const result = await axios.get(
          `${base_url}/pincode/search-pincode-setting`
        );
        console.log("setting pincode", result.data);
        let filter = [];
        if (isSearch && areaSection.country) {
          filter = result.data.result.filter(
            (item) =>
              item.country_db === areaSection.country.trim().toUpperCase()
          );
        }
        if (isSearch && areaSection.state) {
          filter = result.data.result.filter(
            (item) => item.state_db === areaSection.state.trim().toUpperCase()
          );
        }
        if (isSearch && areaSection.district) {
          filter = result.data.result.filter(
            (item) =>
              item.district_db === areaSection.district.trim().toUpperCase()
          );
        }
        if (isSearch && areaSection.pincode) {
          filter = result.data.result.filter(
            (item) =>
              item.pincode_db === areaSection.pincode.trim().toUpperCase()
          );
        }
        if (isSearch) {
          console.log("search=======", filter);
          setNewlyAddedPincode(filter);
        } else {
          setNewlyAddedPincode(result.data.result);
        }
        setTotalPincode(result.data.total);
        setUploadPincode(result.data.total - result.data.result.length);
        setManualPincode(result.data.result.length);
      } catch (err) {
        console.log("internal err", err);
      }
    };
    fetchPincode();
  }, [
    refresh,
    isSearch,
    areaSection.country,
    areaSection.state,
    areaSection.district,
    areaSection.pincode,
  ]);
  useEffect(() => {
    const fetchPincode = async () => {
      let filter = [];
      if (isSearch && areaSection.country) {
        filter = newlyAddedPincode.filter(
          (item) => item.country_db === areaSection.country.trim().toUpperCase()
        );
      }
      if (isSearch && areaSection.state) {
        filter = newlyAddedPincode.filter(
          (item) => item.state_db === areaSection.state.trim().toUpperCase()
        );
      }
      if (isSearch && areaSection.district) {
        filter = newlyAddedPincode.filter(
          (item) =>
            item.district_db === areaSection.district.trim().toUpperCase()
        );
      }
      if (isSearch && areaSection.pincode) {
        filter = newlyAddedPincode.filter(
          (item) => item.pincode_db === areaSection.pincode.trim().toUpperCase()
        );
      }

      setNewlyAddedPincode(filter);
    };
    fetchPincode();
  }, [
    areaSection.country,
    areaSection.state,
    areaSection.district,
    areaSection.pincode,
  ]);

  async function UpdatePincode() {
    if (
      !areaSection.pincode ||
      !areaSection.country ||
      !areaSection.district ||
      !areaSection.state
    )
      return alert("Country, State, District, Pincode Fields cannot be empty");
    setIsSearch(false);
    try {
      const result = await axios.put(`${base_url}/pincode/update-pincode`, {
        searchPincode: selectUpdatingPincode,
        pincode: areaSection.pincode,
        country: areaSection.country.trim().toUpperCase(),
        state: areaSection.state.trim().toUpperCase(),
        district: areaSection.district.trim().toUpperCase(),
        taluka: areaSection.taluka.trim().toUpperCase(),
        village: areaSection.village.trim().toUpperCase(),
      });
      setAreaSection((prev) => ({
        ...prev,
        country: "",
        state: "",
        district: "",
        taluka: "",
        village: "",
        pincode: "",
      }));
      setRefresh((prev) => !prev);
      trigger(false);
      console.log("Update success:", result.data);
    } catch (err) {
      console.log("internal error", err);
    }
  }

  const handleUpload = async (file) => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("excelPincode", file);

    console.log("Start uploading pincode....", file);
    try {
      setIsLoading(true);
      setIsUploading(true);

      const res = await axios.post(`${base_url}/pincode/dump`, formData);
      const filename = res.data.filename;
      console.log("Pincode Successfully Dump", res.data.message);

      listenToProgress(filename);
      // alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
      setStatusMessage("Upload failed.");
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const listenToProgress = (filename) => {
    const eventSource = new EventSource(
      `${base_url}/pincode/progress/${filename}`
    );

    eventSource.addEventListener("progress", (event) => {
      const data = JSON.parse(event.data);
      console.log(`Progress: ${data.progress}% (${data.count}/${data.total})`);
      setUploadProgress(data.progress);
      setUploadCount(data.count);
      setUploadTotalCount(data.total);
    });
    eventSource.addEventListener("complete", (event) => {
      const data = JSON.parse(event.data);
      console.log("Completed:", data.message);
      setStatusMessage("Upload complete!");
      setIsLoading(false);
      setIsUploading(false);
      eventSource.close();
      setRefresh((prev) => !prev);
      alert("Uploaded Successfully");
    });

    eventSource.addEventListener("error", (err) => {
      console.error("SSE Error", err);
      setStatusMessage("Error receiving progress updates.");
      setIsLoading(false);
      setIsUploading(false);
      eventSource.close();
      setRefresh((prev) => !prev);
    });
  };

  const handleExcelSampleSheet = () => {
    try {
      console.log("heol");
      const result = window.open(`${base_url}/pincode/sampleFile`);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleAutoBackUpEmail = async () => {
    if (autoShotEmail && autoShotEmail.length > 0 && !autoEmailPassword) {
      return alert("Email password must required");
    }
    if (autoShotEmail && autoShotEmail.length > 0) {
      setAutoEmail("");
    }
    if (autoEmail && autoEmail.length > 0) {
      setAutoShotEmail("");
      setAutoEmailPassword("");
    }
    try {
      if (autoEmailIndex) {
        const result = await axios.put(
          `${base_url}/backup/update-backup-emails/${autoEmailIndex}`,
          {
            senderEmail: autoShotEmail,
            password: autoEmailPassword,
            email: autoEmail,
            userId: "SA",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("AutoEmail Updated Successfully", result);
      } else {
        const result = await axios.post(
          `${base_url}/backup/backup-emails`,
          {
            senderEmail: autoShotEmail,
            password: autoEmailPassword,
            email: autoEmail,
            userId: "SA",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("AutoEmail Created Successfully", result);
      }
      setAutoEmailIndex(null);
      fetchBackup();
      setAutoEmail("");
      setAutoShotEmail("");
      setAutoEmailPassword("");
    } catch (err) {
      console.log("internal error", err);
      alert(
        err && err.response && err.response.data && err.response.data.message
      );
    }
  };

  const handleAutoEmailDelete = async (id) => {
    try {
      await axios.delete(`${base_url}/backup/delete-backup-emails/${id}`);
      fetchBackup();
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const fetchBackup = async () => {
    try {
      const result = await axios.get(`${base_url}/backup/get-backup-emails`);
      console.log("autobakup", result.data);
      setFetchBackupEmail(result.data);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  useEffect(() => {
    fetchBackup();
  }, []);

  const handleChangeStateDistrictName = async () => {
    if (
      !searchAreaField ||
      !selectedAreaOption.prevName ||
      !selectedAreaOption.changeName
    )
      return alert("Fields cannot be empty");
    try {
      const result = await axios.put(`${base_url}/pincode/update-area-name`, {
        name: searchAreaField,
        prevName: selectedAreaOption.prevName,
        changeName: selectedAreaOption.changeName,
      });
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleResetStateDistrictName = () => {
    // setSearchAreaField(null)
    setSearchAreaName("");
    setSelectedAreaOption({
      prevName: "",
      changeName: "",
    });
  };

  const handleMessagePopup = () =>{
    
  }
  return (
    <>
      <div className={styles.main}>
        <div className={styles.heading}>
          <h2>Setting</h2>
        </div>
        <div className={styles.content}>
          <h3>General Setting -</h3>
        </div>
        <div className={styles.roles}>
          <div className={styles.subheading}>
            <h4>- Roles</h4>
          </div>
          <div className={styles.rolecontent}>
            <div className={styles["role-name-div"]}>
              <h4>Role Name</h4>

              <form action="" onSubmit={AddRoleName}>
                <input
                  className={styles.custominput}
                  type="text"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value.trim().toUpperCase());
                  }}
                />
              </form>

              <ul className={styles.box}>
                {Array.isArray(listRoleName) &&
                  listRoleName.map((todo, index) => (
                    <div className={styles["box-content"]} key={todo._id}>
                      {todo.rolename_name}
                      <div className={styles.iconsdiv}>
                        <TiEdit
                          onClick={() => {
                            editTextTypeName(
                              "Rolename",
                              todo.rolename_name,
                              todo._id
                            );
                          }}
                          className={styles.icon}
                        />
                        <MdOutlineDeleteForever
                          onClick={() => {
                            deleteRole(todo._id);
                          }}
                          className={styles.icon}
                        />
                      </div>
                    </div>
                  ))}
              </ul>
            </div>
            <div className={styles["division-product-div"]}>
              <div className={styles["division-div"]}>
                <h4>Division</h4>

                <form onSubmit={AddDivision} action="">
                  <input
                    className={styles.custominput}
                    type="text"
                    value={division}
                    onChange={(e) => {
                      setDivision(e.target.value.trim().toUpperCase());
                    }}
                  />
                </form>

                <ul className={styles.box}>
                  {listDivision.map((todo, index) => (
                    <div key={todo._id} className={styles["box-content"]}>
                      {todo.division_name}
                      <div className={styles.iconsdiv}>
                        <TiEdit
                          onClick={() => {
                            editTextTypeName(
                              "Division",
                              todo.division_name,
                              todo._id
                            );
                          }}
                          className={styles.icon}
                        />
                        <MdOutlineDeleteForever
                          onClick={(e) => {
                            deleteDivision(e, todo._id);
                          }}
                          className={styles.icon}
                        />
                      </div>
                    </div>
                  ))}
                </ul>
              </div>

              <div className={styles["product-div"]}>
                <h4>AssignProduct</h4>
                <select
                  className={styles.custominput}
                  onChange={(e) => {
                    const divisionId = e.target.value;
                    setDivisionIndex(divisionId);
                    getAssignProductData(e, divisionId);
                  }}
                  name=""
                  id=""
                >
                  <option value="">--select--</option>
                  {listDivision.map((todo, id) => (
                    <option value={todo._id} key={todo._id}>
                      {todo.division_name}
                    </option>
                  ))}
                </select>
                <form action="" onSubmit={AddAssignProduct}>
                  <input
                    className={styles.custominput}
                    type="text"
                    value={assignProduct}
                    onChange={(e) => {
                      setAssignProduct(e.target.value.toUpperCase());
                    }}
                  />
                </form>

                <ul className={styles.box}>
                  {listAssignProduct.map((product, id) => (
                    <div className={styles["box-content"]} key={product._id}>
                      {product.assign_product_name}
                      <div className={styles.iconsdiv}>
                        <TiEdit
                          onClick={() => {
                            editTextTypeName(
                              "AssignProduct",
                              product.assign_product_name,
                              product._id
                            );
                          }}
                          className={styles.icon}
                        />
                        <MdOutlineDeleteForever
                          onClick={(e) => {
                            deleteAssignProduct(e, product._id);
                          }}
                          className={styles.icon}
                        />
                      </div>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.product}>
              <h4>Product</h4>
              <div className={styles["table-content"]}>
                {listDivision.map((division) => (
                  <div
                    key={division._id}
                    className={styles["table-content-div"]}
                  >
                    <p>{division.division_name}</p>
                    <div className={styles["table-content-body"]}>
                      {(divisionToAssignProduct[division._id] || []).map(
                        (product) => (
                          <p key={product._id}>{product.assign_product_name}</p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.roles}>
          <div className={styles.subheading}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              - Pincode{" "}
              <img
                src={placeEdit}
                onClick={() => {
                  setOpenUpdateArea(true);
                }}
                style={{ width: "25px", height: "25px", cursor: "pointer" }}
                alt=""
              />
              {/* <CiEdit
                className={styles.icon}
                onClick={() => {
                  setOpenUpdateArea(true);
                }}
              /> */}
            </h4>
            {openUpdateArea && (
              <div className={styles.popup}>
                <div className={styles.popbody}>
                  <span
                    className={styles["align-end"]}
                    onClick={() => {
                      setOpenUpdateArea(false);
                    }}
                  >
                    <IoClose className={styles.icon} style={{ color: "red" }} />
                  </span>
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      paddingLeft: "15px",
                    }}
                  >
                    Please select option to make changes
                  </p>
                  <div className={styles.changediv}>
                    <span>
                      <input
                        type="radio"
                        id="state"
                        name="change-area"
                        onChange={() => {
                          setSearchAreaField("state");
                        }}
                      />
                      <label htmlFor="state">State</label>
                    </span>
                    <span>
                      <input
                        type="radio"
                        id="dist"
                        name="change-area"
                        onChange={() => {
                          setSearchAreaField("district");
                        }}
                      />
                      <label htmlFor="dist">District</label>
                    </span>
                  </div>
                  <div className={styles.changediv}>
                    <label htmlFor="">Enter name to search</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={searchAreaName}
                      onChange={(e) => {
                        setSearchAreaName(e.target.value.trim().toUpperCase());
                      }}
                    />
                  </div>
                  <div className={styles.changediv}>
                    <span className={styles.updatenamespan}>
                      <label htmlFor="">Select Name</label>
                      <select
                        name=""
                        id=""
                        value={selectedAreaOption.prevName}
                        className={styles.customselect}
                        onChange={(e) => {
                          setSelectedAreaOption((prev) => ({
                            ...prev,
                            prevName: e.target.value,
                          }));
                        }}
                      >
                        <option value="">-- Select --</option>
                        {(showArealist || []).map((item, idx) => (
                          <option key={idx} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </span>
                    <FaExchangeAlt
                      className={` ${styles.icon} ${styles.exchangeicon} `}
                    />
                    <span className={styles.updatenamespan}>
                      <label htmlFor="">Change Name To</label>
                      <input
                        type="text"
                        value={selectedAreaOption.changeName}
                        className={styles.custominput2}
                        onChange={(e) => {
                          setSelectedAreaOption((prev) => ({
                            ...prev,
                            changeName: e.target.value.trim().toUpperCase(),
                          }));
                        }}
                      />
                    </span>
                  </div>
                  <div className={styles["align-end"]}>
                    <button
                      className={styles.custombtn}
                      onClick={() => {
                        handleResetStateDistrictName();
                      }}
                    >
                      Reset
                    </button>
                    <button
                      className={styles.custombtn}
                      onClick={() => {
                        handleChangeStateDistrictName();
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.rolecontent}>
            <div className={styles.upload}>
              <div className={styles["upload-section"]}>
                <h5>Please select excel file to upload data </h5>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <button
                  className={styles.custombtn}
                  disabled={isLoading === true}
                  onClick={() => handleUpload(selectedFile)}
                >
                  Upload
                </button>
              </div>
              <div className={styles.importdiv}>
                {isUploading && (
                  <div
                    style={{
                      position: "fixed", // Full page cover
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      backgroundColor: "rgba(0, 0, 0, 0.6)", // optional dim background
                      zIndex: 999,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "500px",
                        margin: "20px auto",
                        padding: "10px",
                        textAlign: "center",
                        backgroundColor: "white",
                        border: "2px solid black",
                        boxShadow: "1px 1px 6px white",
                        borderRadius: "5px",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {uploadCount ? (
                        <>
                          Upload Progress: {uploadProgress}% ({uploadCount}/
                          {uploadTotalCount})
                        </>
                      ) : (
                        "Don't Refresh Page Untill Completed"
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className={styles["pincode-enter"]}>
                  <label htmlFor="">
                    Country :{" "}
                    <input
                      type="text"
                      className={styles.custominput2}
                      value={areaSection.country}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    State :{" "}
                    <input
                      type="text"
                      className={styles.custominput2}
                      value={areaSection.state}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    District :{" "}
                    <input
                      type="text"
                      className={styles.custominput2}
                      value={areaSection.district}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          district: e.target.value,
                        }));
                      }}
                    />
                  </label>

                  <label htmlFor="">
                    Taluka :{" "}
                    <input
                      type="text"
                      className={styles.custominput2}
                      value={areaSection.taluka}
                      onChange={(e) => {
                        setAreaSection((prev) => ({
                          ...prev,
                          taluka: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    Village :{" "}
                    <input
                      type="text"
                      className={styles.custominput2}
                      value={areaSection.village}
                      onChange={(e) => {
                        setAreaSection((prev) => ({
                          ...prev,
                          village: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    {areaSection?.pincode &&
                    areaSection.pincode.trim().length === 6 ? (
                      trigger ? (
                        <span> Exist</span>
                      ) : (
                        <span>Not Available</span>
                      )
                    ) : (
                      <span>Pincode</span>
                    )}

                    <input
                      type="text"
                      className={styles.custominput2}
                      value={areaSection.pincode}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }));
                      }}
                    />
                  </label>
                </div>

                <div className={styles.btndivsection}>
                  <h5>
                    Note : First fill Pincode field to check does data present
                    in db?
                  </h5>
                  <div className={styles.btndiv}>
                    <button
                      className={styles.custombtn}
                      onClick={UpdatePincode}
                    >
                      Update
                    </button>
                    <button
                      className={styles.custombtn}
                      onClick={SavePincodeData}
                    >
                      {" "}
                      Save
                    </button>
                  </div>
                  <div className={styles.downloaddiv}>
                    <FaDownload
                      className={styles.downloadicon}
                      onClick={() => {
                        handleExcelSampleSheet();
                      }}
                    />
                    <p style={{ textWrap: "nowrap" }}>Download Sample </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.pincodedata}>
              <div className={styles["pincode-title"]}>
                <h4>Total Pincode {totalPincode}</h4>
                <h4>Upload {uploadPincode}</h4>
                <h4>Manual {manualPincode}</h4>
              </div>
              <div className={styles["pincode-table"]}>
                {newlyAddedPincode.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Country</th>
                        <th>State</th>
                        <th>District</th>
                        <th>Pincode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newlyAddedPincode.map((area, idx) => (
                        <tr key={idx}>
                          <td>{area.country_db}</td>
                          <td>{area.state_db}</td>
                          <td>{area.district_db}</td>
                          <td>
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setSelectUpdatingPincode(area.pincode_db);
                                setAreaSection((prev) => ({
                                  ...prev,
                                  country: area.country_db,
                                  state: area.state_db,
                                  district: area.district_db,
                                  taluka: area.taluka_db,
                                  village: area.village_db,
                                  pincode: area.pincode_db,
                                }));
                              }}
                            >
                              {area.pincode_db}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.notfound}>
                    <p>Pincode not found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.roles}>
          <div className={styles.subheading}>
            <h4>- Auto Backup</h4>
          </div>
          <div className={styles.rolecontent}>
            <div className={styles.upload}>
              <span className={styles["autobackup-span"]}>
                <label htmlFor="">Sender Email </label>
                <input
                  type="text"
                  className={styles.custominput2}
                  value={autoShotEmail}
                  onChange={(e) => {
                    setAutoShotEmail(e.target.value);
                  }}
                />
                <input
                  type="text"
                  style={{ display: autoShotEmail.length > 0 ? "" : "none" }}
                  placeholder="16 Digit Email Pass Code "
                  className={styles.custominput2}
                  value={autoEmailPassword}
                  onChange={(e) => {
                    setAutoEmailPassword(e.target.value);
                  }}
                />
              </span>
              <span className={styles["autobackup-span"]}>
                <label htmlFor="">Enter Receiver Email</label>
                <input
                  type="text"
                  className={styles.custominput2}
                  disabled={autoShotEmail.length > 0}
                  value={autoEmail}
                  onChange={(e) => {
                    setAutoEmail(e.target.value);
                  }}
                />
              </span>
              <div className={styles.autobackubtndiv}>
                <button
                  className={styles.custombtn}
                  onClick={handleAutoBackUpEmail}
                >
                  {autoEmailIndex ? "Update" : "Save"}
                </button>
              </div>
            </div>

            <div className={styles.pincodedata1}>
              {fetchBackupEmail?.shutEmail?.length > 0 && <h4>Sender Email</h4>}
              <table>
                {fetchBackupEmail?.shutEmail?.map((item, idx) => (
                  <tr>
                    <th>{idx + 1}</th>
                    <th>{item.email_db}</th>
                    <th>
                      <CiEdit
                        className="icon"
                        onClick={() => {
                          setAutoEmailIndex(item._id);
                          setAutoShotEmail(item.email_db);
                          setAutoEmail("");
                        }}
                      />
                    </th>
                    <th>
                      <MdDeleteOutline
                        className="icon"
                        onClick={() => {
                          handleAutoEmailDelete(item._id);
                        }}
                      />
                    </th>
                  </tr>
                ))}
              </table>
              {fetchBackupEmail?.result?.length > 0 && <h4>Receiver Emails</h4>}
              <table>
                {fetchBackupEmail?.result?.map((item, idx) => (
                  <tr>
                    <th>{idx + 1}</th>
                    <th>{item.email_db}</th>
                    <th>
                      <CiEdit
                        className="icon"
                        onClick={() => {
                          setAutoEmailIndex(item._id);
                          setAutoEmail(item.email_db);
                          setAutoShotEmail("");
                        }}
                      />
                    </th>
                    <th>
                      <MdDeleteOutline
                        className="icon"
                        onClick={() => {
                          handleAutoEmailDelete(item._id);
                        }}
                      />
                    </th>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </div>
        <div className={styles.roles}>
          <div style={{display:"flex",alignItems:"center", gap:"20px"}} className={styles.subheading}>
            <h4>- Template Message</h4>
            <button className={styles.custombtn} onClick={()=>{setOpenMessage(true)}}>Create</button>
            {openMessage && <MessageModal openModal={""} onClose={()=>{setOpenMessage(false)}} />  }
          </div>
        </div>
      </div>

      {/* <div className="setting-main">
        <div className="setting-wrapper">
          <h3 id="heading">Setting</h3>
          <div className="general-setting" style={{ padding: "10px" }}>
            <h3 id="heading2" style={{ marginBottom: "10px" }}>
              General Setting -
            </h3>
            <div>
              <h3 style={{ padding: "10px", borderTop: "2px dotted gray" }}>
                - Roles
              </h3>
            </div>
            <div
              style={{ marginBottom: "10px", padding: "10px" }}
              className="general-setting-content"
            >
              <div className="general-setting-div">
                <div className="role-name-div">
                  <h4>Role Name</h4>

                  <form action="" onSubmit={AddRoleName}>
                    <input
                      className="inputs"
                      type="text"
                      value={roleName}
                      onChange={(e) => {
                        setRoleName(e.target.value.trim().toUpperCase());
                      }}
                    />
                  </form>

                  <ul className="box">
                    {Array.isArray(listRoleName) &&
                      listRoleName.map((todo, index) => (
                        <div className="card-content" key={todo._id}>
                          <div>
                            <div className="card-content-bar">
                              {todo.rolename_name}
                              <div className="icons">
                                <TiEdit
                                  onClick={() => {
                                    editTextTypeName(
                                      "Rolename",
                                      todo.rolename_name,
                                      todo._id
                                    );
                                  }}
                                  className="icon"
                                />
                                <MdOutlineDeleteForever
                                  onClick={() => {
                                    deleteRole(todo._id);
                                  }}
                                  className="icon"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </ul>
                </div>
                <div className="division-div">
                  <h4>Division</h4>

                  <form onSubmit={AddDivision} action="">
                    <input
                      className="inputs"
                      type="text"
                      value={division}
                      onChange={(e) => {
                        setDivision(e.target.value.trim().toUpperCase());
                      }}
                    />
                  </form>

                  <ul className="box">
                    {listDivision.map((todo, index) => (
                      <div key={todo._id} className="card-content">
                        <div>
                          <div className="card-content-bar">
                            {todo.division_name}
                            <div className="icons">
                              <TiEdit
                                onClick={() => {
                                  editTextTypeName(
                                    "Division",
                                    todo.division_name,
                                    todo._id
                                  );
                                }}
                                className="icon"
                              />
                              <MdOutlineDeleteForever
                                onClick={(e) => {
                                  deleteDivision(e, todo._id);
                                }}
                                className="icon"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>

                <div className="product-div">
                  <h4>AssignProduct</h4>
                  <select
                    className="selects"
                    onChange={(e) => {
                      const divisionId = e.target.value;
                      setDivisionIndex(divisionId);
                      getAssignProductData(e, divisionId);
                    }}
                    name=""
                    id=""
                  >
                    <option value="">--select--</option>
                    {listDivision.map((todo, id) => (
                      <option value={todo._id} key={todo._id}>
                        {todo.division_name}
                      </option>
                    ))}
                  </select>
                  <form action="" onSubmit={AddAssignProduct}>
                    <input
                      className="inputs"
                      type="text"
                      value={assignProduct}
                      onChange={(e) => {
                        setAssignProduct(e.target.value.toUpperCase());
                      }}
                    />
                  </form>

                  <ul className="box">
                    {listAssignProduct.map((product, id) => (
                      <div className="card-content-bar" key={product._id}>
                        {product.assign_product_name}
                        <div className="icons">
                          <TiEdit
                            onClick={() => {
                              editTextTypeName(
                                "AssignProduct",
                                product.assign_product_name,
                                product._id
                              );
                            }}
                            className="icon"
                          />
                          <MdOutlineDeleteForever
                            onClick={(e) => {
                              deleteAssignProduct(e, product._id);
                            }}
                            className="icon"
                          />
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="table-main">
                <h3 id="heading-table">Product</h3>
                <div className="table-content">
                  {listDivision.map((division) => (
                    <div key={division._id} className="table-content-div">
                      <p>{division.division_name}</p>
                      <div className="table-content-body">
                        {(divisionToAssignProduct[division._id] || []).map(
                          (product) => (
                            <p key={product._id}>
                              {product.assign_product_name}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ padding: "10px", borderTop: "2px dotted gray" }}>
                {" "}
                - Pincode
              </h3>
            </div>
            <div className="area">
              <div className="pincode-section">
                <p
                  style={{
                    color: "",
                    paddingLeft: "20px",
                    display: "flex",
                    gap: "40px",
                    alignItems: "center",
                  }}
                >
                  <p>Please select excel file to upload data </p>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => {
                      // setFile(e.target.files[0]);
                      handleUpload(e.target.files[0]);
                    }}
                  />
                  <button disabled={isLoading === true} onClick={handleUpload}>
                    Upload
                  </button>
                </p>

                <div className="importdiv">
                  {isUploading && (
                    <div
                      style={{
                        position: "fixed", // Full page cover
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.6)", // optional dim background
                        zIndex: 999,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "500px",
                          margin: "20px auto",
                          padding: "10px",
                          textAlign: "center",
                          backgroundColor: "white",
                          border: "2px solid black",
                          boxShadow: "1px 1px 6px white",
                          borderRadius: "5px",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {uploadCount ? (
                          <>
                            Upload Progress: {uploadProgress}% ({uploadCount}/
                            {uploadTotalCount})
                          </>
                        ) : (
                          "Don't Refresh Page Untill Completed"
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pincode-details">
                  <label htmlFor="">
                    Country :{" "}
                    <input
                      type="text"
                      className="inputs"
                      value={areaSection.country}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    State :{" "}
                    <input
                      type="text"
                      className="inputs"
                      value={areaSection.state}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    District :{" "}
                    <input
                      type="text"
                      className="inputs"
                      value={areaSection.district}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          district: e.target.value,
                        }));
                      }}
                    />
                  </label>
                </div>
                <div className="pincode-details">
                  <label htmlFor="">
                    Taluka :{" "}
                    <input
                      type="text"
                      className="inputs"
                      value={areaSection.taluka}
                      onChange={(e) => {
                        setAreaSection((prev) => ({
                          ...prev,
                          taluka: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    Village :{" "}
                    <input
                      type="text"
                      className="inputs"
                      value={areaSection.village}
                      onChange={(e) => {
                        setAreaSection((prev) => ({
                          ...prev,
                          village: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label htmlFor="">
                    {areaSection?.pincode &&
                    areaSection.pincode.trim().length === 6 ? (
                      trigger ? (
                        <span> Exist</span>
                      ) : (
                        <span>Not Available</span>
                      )
                    ) : (
                      <span>Pincode</span>
                    )}

                    <input
                      type="text"
                      className="inputs"
                      value={areaSection.pincode}
                      onChange={(e) => {
                        setIsSearch(true);
                        setAreaSection((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }));
                      }}
                    />
                  </label>
                </div>
                <div className="pincode-class">
                  <p style={{ color: "", width: "50%" }}>
                    Note : First fill Pincode field to check does data present
                    in db?
                  </p>
                  <button onClick={UpdatePincode}>Update</button>
                  <button onClick={SavePincodeData}> Save</button>

                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingRight: "20px",
                    }}
                  >
                    <FaDownload
                      style={{
                        color: "blue",
                        cursor: "pointer",
                        fontSize: "32px",
                        position: "absolute",
                        bottom: "25px",
                      }}
                      onClick={() => {
                        handleExcelSampleSheet();
                      }}
                    />
                    <p style={{ textWrap: "nowrap" }}>Download Sample </p>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingRight: "20px",
                  }}
                ></div>
              </div>
              <div className="pincode-table-content">
                <div className="pincode-uploadmanual">
                  <h2>Total Pincode {totalPincode}</h2>
                  <h2>Upload {uploadPincode}</h2>
                  <h2>Manual {manualPincode}</h2>
                </div>
                <table>
                  <tr>
                    <th>Country</th>
                    <th>State</th>
                    <th>District</th>
                    <th>Pincode</th>
                  </tr>
                  {newlyAddedPincode.length > 0 ? (
                    newlyAddedPincode.map((area, idx) => (
                      <tr key={idx}>
                        <td>{area.country_db}</td>
                        <td>{area.state_db}</td>
                        <td>{area.district_db}</td>
                        <td>
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectUpdatingPincode(area.pincode_db);
                              setAreaSection((prev) => ({
                                ...prev,
                                country: area.country_db,
                                state: area.state_db,
                                district: area.district_db,
                                taluka: area.taluka_db,
                                village: area.village_db,
                                pincode: area.pincode_db,
                              }));
                            }}
                          >
                            {area.pincode_db}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <p>Pincode not found</p>
                    </div>
                  )}
                </table>
              </div>
            </div>
            <div className="autobackupdiv">
              <h2> - Auto Backup </h2>
              <div className="autobackup-box">
                <span className="autobackup-span">
                  <div>
                    <label htmlFor="">Enter Emails</label>
                  </div>
                  <input
                    type="text"
                    className="inputbackup"
                    value={autoEmail}
                    onChange={(e) => {
                      setAutoEmail(e.target.value);
                    }}
                  />
                  <button onClick={handleAutoBackUpEmail}>
                    {autoEmailIndex ? "Update" : "Save"}
                  </button>
                </span>
                <span className="autobackup-span">
                  <h2>Emails</h2>
                  <table>
                    {fetchBackupEmail.map((item, idx) => (
                      <tr>
                        <th>{idx + 1}</th>
                        <th>{item.email_db}</th>
                        <th>
                          <CiEdit
                            className="icon"
                            onClick={() => {
                              setAutoEmailIndex(item._id);
                              setAutoEmail(item.email_db);
                            }}
                          />
                        </th>
                        <th>
                          <MdDeleteOutline
                            className="icon"
                            onClick={() => {
                              handleAutoEmailDelete(item._id);
                            }}
                          />
                        </th>
                      </tr>
                    ))}
                  </table>
                </span>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default Setting;
