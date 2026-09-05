// src/components/Register.jsx
import React, { useEffect, useState } from "react";
// import "./Register.css";
import styles from "./Register.module.css";
import axios from "axios";
import CustomSelect from "./CustomSelect";
import UserAssignTask from "./UserAssignTask";
import { FaWpforms } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";
import { base_url } from "../config/config";
import { AuthContext } from "../context-api/AuthContext";
import { useContext } from "react";
import MessagePortal from "../UI/MessagePortal";
import { FaClipboardList } from "react-icons/fa";
import AdvancePermissionModal from "../UI/AdvancePermissionModal";

const Register = () => {
  const [uniqueUserIdGenerator, setUniqueUserIdGenerator] = useState("");
  const [userHistory, setUserHistory] = useState([]);
  const [openAdvancePerm, setOpenAdvancePerm] = useState(false);
  const [getProductWisePermission, setGetProductWisePermission]=useState([])

  const [formData, setFormData] = useState({
    uniqueUserId: "",
    name: "",
    email: "",
    roleName: "",
    division: [],
    mobile: "",
    assignProduct: [],
    create_P: false,
    update_P: false,
    delete_P: false,
    edit_P: false,
    view_P: false,
    uploadFile_P: false,
    download_P: false,
    userIdText: "",
    passwordText: "",
    confirmPasswordText: "",
    searchField: "",
  });
  const [roleNameOptions, setRoleNameOption] = useState([]);
  const [selectRolename, setSelectRolename] = useState(null); //
  const { userLoginId } = useContext(AuthContext);
  const [msg, setMsg] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [divsionOptions, setDivsionOptions] = useState([]);
  const [assignProductOptions, setAssignProductOptions] = useState([]);
  const [userDataList, setUserDataList] = useState([]);
  const [divisionIdxs, setDivisionIdxs] = useState([]); //this used for division ids for assignproduct
  const [searchByUserId, setSearchByUserId] = useState("");
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [selectedAssignProducts, setSelectedAssignProducts] = useState([]);
  const [isModifing, setIsModifing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isUserFormCreated, setIsUserFormCreated] = useState(false);
  const [userIdStatus, setUserIdStatus] = useState(null);

  const [showFormPopUp, setShowFormPopUp] = useState(false);
  const [currentFormId, setCurrentFormId] = useState("");
  const [updateFormId, setUpdateFormId] = useState("");
  const [permissionFormData, setPermissionFormData] = useState([]);

  //USING DEBOUNCING FOR USERID EXIST OR NOT
  useEffect(() => {
    if (!formData.userIdText) return setUserIdStatus(null);
    const fetchUserIdExist = async () => {
      try {
        const result = await axios.get(`${base_url}/users/checked-userId`, {
          params: {
            userId: formData.userIdText,
            uniqueUserIdGenerator: uniqueUserIdGenerator,
          },
        });
        console.log("UserId Exist", result.data.exists);
        setUserIdStatus(result.data.exists);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    const debounce = setTimeout(() => {
      fetchUserIdExist();
    }, 400);

    return () => {
      clearTimeout(debounce);
    };
  }, [formData.userIdText]);

  //DIRECTLY FETCHING UNIQUE ID FOR NEW USER WHEN ROLENAME SELECTED
  useEffect(() => {
    if (!selectRolename) return;
    if (userLoginId?.userId)
      console.log("id", userLoginId?.userId, selectRolename);
    const fetch = async () => {
      const result = await axios.post(`${base_url}/utils/send-user-id`, {
        roleName: selectRolename[0]?.label,
        createdBy: userLoginId?.userId,
      });
      console.log("result id", result.data.result);
      setFormData((prev) => ({ ...prev, uniqueUserId: result.data?.result }));
      setUniqueUserIdGenerator(result.data?.result);
    };
    if (isModifing === false) {
      fetch();
    }
  }, [selectRolename]);

  //FETCHING ROLENAME INITIALLY ON PAGE LOAD
  useEffect(() => {
    const fetchRoleOption = async () => {
      const res = await fetch(`${base_url}/setting/rolename-data`);
      const data = await res.json();
      const option = data.result.map((item) => ({
        label: item.rolename_name,
        value: item._id,
      }));
      setRoleNameOption(option);
      console.log("RoleNameOption", option);
    };
    fetchRoleOption();
  }, []);

  //DIVISIONOPTION FETCHING
  useEffect(() => {
    const fetchDivisionOption = async () => {
      const res = await fetch(`${base_url}/setting/division-data`);
      const data = await res.json();
      const option = data.result.map((item) => ({
        label: item.division_name,
        value: item._id,
      }));
      setDivsionOptions(option);
      // console.log("divisionOption", option);
    };
    fetchDivisionOption();
  }, []);

  //FETCHING ALL CREATED USER FROM DB
  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const result = await axios.get(`${base_url}/users/search-all-user`);
        console.log("fetchUser", result.data.result);
        setUserDataList(result.data.result);
      } catch (err) {
        console.log("Error search", err);
      }
    };
    fetchAllUser();
  }, [refresh]);

  useEffect(() => {
    const fetchAssignProduct = async () => {
      try {
        // console.log("ram ram");
        const allAssignProducts = [];

        for (const divisionId of divisionIdxs) {
          const res = await fetch(
            `${base_url}/setting/assignproduct-data/${divisionId}`
          );
          const data = await res.json();

          if (res.ok && Array.isArray(data.result)) {
            const formatted = data.result.map((item) => ({
              label: item.assign_product_name,
              value: item._id,
              divisionId: divisionId,
            }));
            allAssignProducts.push(...formatted);
          }
        }
        setAssignProductOptions(allAssignProducts);
        // console.log("assign product loaded", allAssignProducts);
      } catch (err) {
        console.error("Error fetching assign products:", err);
      }
    };
    if (divisionIdxs.length > 0) {
      fetchAssignProduct();
    } else {
      setAssignProductOptions([]); // clear if no divisions selected
    }
    // console.log("divisionIdxs:", divisionIdxs);
  }, [divisionIdxs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value,e.target.name);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeRoleNameSelectOption = (selectedOptions) => {
    console.log("rolename", selectedOptions);
    console.log("rolename label", selectedOptions[0].label);
    setSelectRolename(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      roleName: selectedOptions[0].label,
    }));
  };

  const handleChangeDivisionSelectOption = (selectedOptions) => {
    const idx = selectedOptions.map((option) => option.value);
    console.log("division id", idx, selectedOptions);
    setSelectedDivisions(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      division: selectedOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    }));
    setDivisionIdxs(idx);
  };

  const handleChangeAssignProduct = (selectedOptions) => {
    console.log(
      "selectAssign",
      selectedOptions.map((option) => option.label)
    );
    setSelectedAssignProducts(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      assignProduct: selectedOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    }));
  };

  const permissionChecked = (e, selectPermission) => {
    setFormData((prev) => ({
      ...prev,
      [selectPermission]: e.target.checked,
    }));
    console.log(selectPermission, "->", e.target.checked);
  };

  //CREATE USER
  const handleSaveUser = async () => {
    if (!formData.uniqueUserId || !formData.userIdText)
      return setMsg("Unique User Id and User Id  must required");
    if (formData.userIdText && userIdStatus === true)
      return setMsg("User Id already Exist");
    if (formData.passwordText === "") return setMsg("Password must required");
    if (formData.passwordText !== formData.confirmPasswordText)
      return setMsg("ConfirmPassword not matched");
    try {
      const result = await axios.post(
        `${base_url}/users/createUser`,
        {
          ...formData,
          permissionData: permissionFormData,
          createdById: userLoginId?.userId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("resultl", result.data.user.generateUniqueId);
      setMsg(result.data.message);
      setRefresh((prev) => !prev);
      setShowForm(true);
      setSearchByUserId(result?.data?.user?.generateUniqueId);
    } catch (err) {
      console.log("internal error", err);
      setMsg(err.response.data.message);
    }
  };

  const handleUpdateUserData = async () => {
    if (formData.passwordText !== formData.confirmPasswordText) {
      return setMsg("Password must matched");
    }
    if (formData.passwordText === "") return setMsg("Password must required");
    if (formData.userIdText && userIdStatus === true)
      return setMsg("User Id already Exist");
    try {
      const result = await axios.put(
        `${base_url}/users/updateUser/${searchByUserId}`,
        {
          ...formData,
          permissionData: permissionFormData,
          updatedById: userLoginId?.userId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("User Updatd Successfully", result);
      setMsg(result.data.message);
      setRefresh((prev) => !prev);
      setSearchByUserId(result?.data?.user?.generateUniqueId);
    } catch (err) {
      console.log("User not updated", err);
      setMsg(err.response.data.message);
    }
  };
  console.log("divisionIds", divisionIdxs);
  //FILTERING BY SEARCH ID
  useEffect(() => {
    if (!searchByUserId) return;
    const fetchSearchUser = async () => {
      try {
        const result = await axios.get(
          `${base_url}/users/search-by-user/${searchByUserId}`
        );
        console.log("user", result.data.result);
        const data = result?.data?.result;

        setFormData((prev) => ({
          ...prev,
          uniqueUserId: data?.generateUniqueId,
          name: data?.name || "",
          email: data?.email || "",
          roleName: data?.roleName || "",
          division: data?.division
            .filter((item) => item.value && item.label) // only valid objects
            .map((item) => ({ value: item.value, label: item.label })),
          mobile: data?.mobile || "",
          assignProduct: data?.assignProduct
            .filter((item) => item.value && item.label) // only valid objects
            .map((item) => ({ value: item.value, label: item.label })),
          create_P: !!data?.create_P,
          update_P: !!data?.update_P,
          delete_P: !!data?.delete_P,
          edit_P: !!data?.edit_P,
          view_P: !!data?.view_P,
          uploadFile_P: !!data?.uploadFile_P,
          download_P: !!data?.download_P,
          userIdText: data?.userID || "",
          passwordText: "",
          confirmPasswordText: "",
          searchField: searchByUserId,
        }));
        const selectedRole = roleNameOptions.find(
          (opt) => opt.label === data?.roleName
        );
        setSelectRolename(selectedRole);

        setSelectedDivisions(
          data?.division
            .filter((item) => item.value && item.label) // only valid objects
            .map((item) => ({ value: item.value, label: item.label }))
        );
        setSelectedAssignProducts(
          data?.assignProduct
            .filter((item) => item.value && item.label) // only valid objects
            .map((item) => ({ value: item.value, label: item.label }))
        );

        setUniqueUserIdGenerator(data?.generateUniqueId);
        setGetProductWisePermission(data?.master_data_db?.productPermissions)
        setShowForm(true);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchSearchUser();
  }, [searchByUserId]);

  const handleDeleteUserData = async () => {
    try {
      const isConfirm = window.confirm("Are you sure to Deactive user");
      if (!isConfirm) return;
      const result = await axios.delete(
        `${base_url}/users/delete-user/${searchByUserId}`
      );
      setMsg(result.data.message);
      setRefresh((prev) => !prev);
      setSearchByUserId(null);
    } catch (err) {
      console.log("User not delete", err);
    }
  };

  const handleSearchUser = async () => {
    try {
      const result = await axios.get(`${base_url}/users/filter-user`, {
        params: { ...formData },
      });
      console.log("filters", result);
      setUserDataList(result.data.result);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleReset = () => {
    setRefresh((prev) => !prev);
    setFormData({
      uniqueUserId: "",
      name: "",
      email: "",
      roleName: "",
      division: [],
      mobile: "",
      assignProduct: [],
      create_P: false,
      update_P: false,
      delete_P: false,
      edit_P: false,
      view_P: false,
      uploadFile_P: false,
      download_P: false,
      userIdText: "",
      passwordText: "",
      confirmPasswordText: "",
      searchField: "",
    });
    setSelectRolename([]);
    setSelectedAssignProducts([]);
    setSelectedDivisions([]);
    setUniqueUserIdGenerator([]);
    setSearchByUserId("");
    setShowForm(false);
    setUserIdStatus(null);
    setIsModifing(false);
    setPermissionFormData([]);
  };

  const handleOpenUserHistory = async (userId) => {
    try {
      const result = await axios.get(
        `${base_url}/users/user-history/${userId}`
      );
      setUserHistory(result.data.result);
      console.log("user History", result.data.result);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handlePassPermissionData = (data) => {
    setPermissionFormData(data);
    console.log("parent Data", data);
  };
  console.log("parent Data", permissionFormData);
  return (
    <>
      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2>Add User</h2>
          </div>
          <div className={styles.fielddiv}>
            <span className={styles.fields}>
              <div className={styles.searchspan}>
                <p>Id- {uniqueUserIdGenerator}</p>
                <input
                  type="text"
                  placeholder="search Id"
                  name="searchField"
                  value={formData.searchField}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchUser();
                    }
                  }}
                />
              </div>
            </span>
            <span></span>
            <span className={styles.fields}>
              <label htmlFor="">Role Name</label>
              <CustomSelect
                options={roleNameOptions}
                value={selectRolename}
                isMulti={false}
                onChange={handleChangeRoleNameSelectOption}
              />
            </span>
            <span className={styles.fields}>
              <label htmlFor="">Name</label>
              <input
                type="text"
                name="name"
                className={styles.custominput}
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </span>
            <span className={styles.fields}>
              <label htmlFor="">Division</label>
              <CustomSelect
                options={divsionOptions}
                value={selectedDivisions}
                isMulti={true}
                onChange={handleChangeDivisionSelectOption}
              />
            </span>
            <span className={styles.fields}>
              <label htmlFor="">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={styles.custominput}
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </span>
            <span className={styles.fields}>
              <label htmlFor="">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                className={styles.custominput}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
              />
            </span>
            <span className={styles.fields}>
              <label htmlFor="">Assign Product</label>

              <CustomSelect
                options={assignProductOptions}
                value={selectedAssignProducts}
                isMulti={true}
                onChange={handleChangeAssignProduct}
              />
            </span>
          </div>
          <div className={styles["subheading-perm"]}>
            <h4>Permission </h4>
            <button
              onClick={() => {
                setOpenAdvancePerm(true);
              }}
              className={styles["permission-btn"]}
            >
              Advance Permission{" "}
            </button>
            <AdvancePermissionModal
              openModal={openAdvancePerm}
              selectAssignProduct={selectedAssignProducts}
              onSetPermissionData={handlePassPermissionData}
              onGetProductWisePermission={getProductWisePermission}
              onClose={() => {
                setOpenAdvancePerm(false);
              }}
            />
          </div>
          <div className={styles["permission-div"]}>
            <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                User Create
              </label>
              <input
                type="checkbox"
                checked={!!formData.create_P}
                onChange={(e) => permissionChecked(e, "create_P")}
              />
            </span>

            <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                Delete
              </label>
              <input
                type="checkbox"
                checked={!!formData.delete_P}
                onChange={(e) => permissionChecked(e, "delete_P")}
              />
            </span>

            {/* <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                Update
              </label>
              <input
                type="checkbox"
                checked={!!formData.update_P}
                onChange={(e) => permissionChecked(e, "update_P")}
              />
            </span>

            <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                Edit
              </label>
              <input
                type="checkbox"
                checked={!!formData.edit_P}
                onChange={(e) => permissionChecked(e, "edit_P")}
              />
            </span>
            <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                View
              </label>
              <input
                type="checkbox"
                checked={!!formData.view_P}
                onChange={(e) => permissionChecked(e, "view_P")}
              />
            </span> */}
            <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                Upload File
              </label>
              <input
                type="checkbox"
                checked={!!formData.uploadFile_P}
                onChange={(e) => permissionChecked(e, "uploadFile_P")}
              />
            </span>
            <span className={styles.permission}>
              <label className="checkbox" htmlFor="">
                Download
              </label>
              <input
                type="checkbox"
                checked={!!formData.download_P}
                onChange={(e) => permissionChecked(e, "download_P")}
              />
            </span>
          </div>
          <div className={styles["user-div"]}>
            <div className={styles["user"]}>
              <h4>User ID</h4>
              <input
                type="text"
                name="userIdText"
                placeholder="User ID"
                className={styles.custominput}
                value={formData.userIdText}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
                style={{
                  color: formData.userIdText === "taken" ? "red" : "green",
                  fontWeight: "bold",
                }}
              />
              <div>
                {userIdStatus === true && (
                  <h4 style={{ color: "red" }}>*User Id is already taken</h4>
                )}
                {userIdStatus === false && (
                  <h4 style={{ color: "green" }}>*User Id is available</h4>
                )}
              </div>
            </div>
            <div className={styles["user"]}>
              <h4>Password</h4>
              <div className={styles.userpassword}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="passwordText"
                  placeholder="Password"
                  className={styles.custominput}
                  value={formData.passwordText}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                />
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? "hide" : "show"}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles["user"]}>
              <h4>Confirm Password</h4>
              <input
                type="password"
                name="confirmPasswordText"
                placeholder="Confirm Password"
                className={styles.custominput}
                value={formData.confirmPasswordText}
                onChange={(e) => {
                  handleChange(e);
                }}
                required
                style={{
                  color:
                    formData.confirmPasswordText === formData.passwordText
                      ? "green"
                      : "red",
                }}
              />
              <div>
                {formData.confirmPasswordText && (
                  <h4
                    className="user-id-status"
                    style={{
                      color:
                        formData.confirmPasswordText === formData.passwordText
                          ? "green"
                          : "red",
                      fontSize: "14px",
                    }}
                  >
                    {formData.confirmPasswordText !== formData.passwordText
                      ? " Password must match"
                      : "Password match"}
                  </h4>
                )}
              </div>
            </div>
          </div>
          <div className={styles.btndiv}>
            <button
              onClick={() => {
                handleReset();
              }}
            >
              New
            </button>
            <button
              disabled={isModifing}
              style={{ background: isModifing === true ? "gray" : "" }}
              onClick={(e) => {
                handleSaveUser();
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                handleUpdateUserData(searchByUserId);
              }}
            >
              Update
            </button>
            <button
              onClick={() => {
                handleDeleteUserData();
              }}
            >
              Delete
            </button>

            <button
              onClick={() => {
                handleSearchUser();
              }}
            >
              Search
            </button>

            {showForm && (
              <div className={styles["form-icon-div"]}>
                <FaWpforms
                  className={styles["form-icon"]}
                  onClick={() => setShowFormPopUp((prev) => !prev)}
                  style={{
                    backgroundColor: isUserFormCreated ? "blue" : "red",
                    color: "white",
                  }}
                />

                <div
                  className={`${styles["popup-wrapper"]} ${
                    showFormPopUp ? styles.show : ""
                  }`}
                >
                  <div className={styles["popup-content-div"]}>
                    <IoMdCloseCircle
                      className={styles["close-icon"]}
                      onClick={() => setShowFormPopUp(false)}
                    />
                    <div className={styles["popup-content"]}>
                      <UserAssignTask executiveId={searchByUserId} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.history}>
          {userDataList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Unique UserId</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Rolename</th>
                  <th>Division</th>
                  <th>Assign Product</th>
                  <th>Major Permissions</th>
                  <th>Product Wise Permission</th>
                  <th>User Name</th>
                  <th>User History</th>
                </tr>
              </thead>
              <tbody>
                {(userDataList || []).map((todo, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        style={{
                          color: isUserFormCreated ? "blue" : "red",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSearchByUserId(todo.generateUniqueId);
                          setIsModifing(true);
                        }}
                      >
                        {todo.generateUniqueId}
                      </span>
                    </td>
                    <td>{todo.name}</td>
                    <td>{todo.email}</td>
                    <td>{todo.mobile}</td>
                    <td>{todo.roleName}</td>
                    <td>
                      {todo?.division?.map((item) => item.label).join(", ")}{" "}
                    </td>
                    <td>
                      {todo?.assignProduct
                        ?.map((item) => item.label)
                        .join(", ")}{" "}
                    </td>
                    <td>
                      {todo.create_P && "Create, "}
                      {todo.update_P && "Update, "}
                      {todo.delete_P && "Delete, "}
                      {todo.edit_P && "Edit, "}
                      {todo.view_P && "View, "}
                      {todo.uploadFile_P && "Upload File, "}
                      {todo.download_P && "Download "}

                      {!todo.create_P &&
                        !todo.update_P &&
                        !todo.delete_P &&
                        !todo.edit_P &&
                        !todo.view_P &&
                        !todo.uploadFile_P &&
                        !todo.download_P && <span>No Permission Allotted</span>}
                    </td>

                    <td>
                      {todo.master_data_db.productPermissions.map((item) => (
                        <tr>
                          <th>{item.productName}</th>
                          {item.permission.update_P ? (
                            <td>Update</td>
                          ) : (
                            <td>NA</td>
                          )}
                          {item.permission.edit_P ? <td>Edit</td> : <td>NA</td>}
                          {item.permission.view_P ? (
                            <td> View</td>
                          ) : (
                            <td>NA</td>
                          )}
                        </tr>
                      ))}
                    </td>
                    <td>{todo.userID}</td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "blue",
                      }}
                    >
                      <FaClipboardList
                        onClick={() => {
                          handleOpenUserHistory(todo.generateUniqueId);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>
              <h2 style={{ textAlign: "center" }}>No User Found</h2>
            </div>
          )}
        </div>
        {userHistory.length > 0 && (
          <div className={styles.userHistory}>
            <div className={styles.userHistoryinner}>
              <div className={styles.header}>
                {" "}
                <h4>User History</h4>
              </div>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Role Type</th>
                      <th>Role Name</th>

                      <th>Division</th>
                      <th>Assign Product</th>
                      <th>Major Permission</th>
                      <th>Product Wise Permission</th>
                      <th>User ID</th>
                      <th>Created By</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {userHistory.length > 0 ? (
                      userHistory.map((item, index) => {
                        const user = item.userHistory;
                        return (
                          <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.mobile}</td>
                            <td>{user.roleType}</td>
                            <td>{user.roleName}</td>

                            <td>
                              {user.division && user.division.length > 0
                                ? user.division.map((d) => d.label).join(", ")
                                : "-"}
                            </td>
                            <td>
                              {user.assignProduct &&
                              user.assignProduct.length > 0
                                ? user.assignProduct
                                    .map((p) => p.label)
                                    .join(", ")
                                : "-"}
                            </td>

                            <td>
                              <tr>
                                {user.create_P && <td>Create</td>}
                                {user.delete_P && <td>Delete</td>}
                                {user.download_P && <td>Download</td>}
                                {user.uploadFile_P && <td>Upload File</td>}
                                {user.view_P && <td>View</td>}
                              </tr>
                            </td>
                            <td>
                              {user?.master_data_db.productPermissions.map(
                                (item) => (
                                  <tr>
                                    <th>{item.productName}</th>
                                    {item.permission.update_P ? (
                                      <td>Update</td>
                                    ) : (
                                      <td>NA</td>
                                    )}
                                    {item.permission.edit_P ? (
                                      <td>Edit</td>
                                    ) : (
                                      <td>NA</td>
                                    )}
                                    {item.permission.view_P ? (
                                      <td> View</td>
                                    ) : (
                                      <td>NA</td>
                                    )}
                                  </tr>
                                )
                              )}
                            </td>
                            <td>{user.userID}</td>
                            <td>{user.createdBy}</td>
                            <td>{user.isActive}</td>
                            <td>{new Date(user.createdAt).toLocaleString()}</td>
                            <td>{new Date(user.updatedAt).toLocaleString()}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="19">No history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className={styles.btndivH} style={{ paddingRight: "20px" }}>
                <button
                  onClick={() => {
                    setUserHistory([]);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {msg && (
          <MessagePortal
            message1={msg}
            onClose={() => {
              setMsg(null);
            }}
          />
        )}
      </div>
    </>
  );
};

export default Register;
