import React, { useEffect, useState, useContext } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import "./UserAssignTask.css";
import axios from "axios";
import TimepickerComponent from "../UI/TimePickerComponent";
import { base_url } from "../config/config";
import { AuthContext } from "../context-api/AuthContext";
import { FaClipboardList } from "react-icons/fa";

const UserAssignTask = ({ executiveId }) => {
  const { userLoginId } = useContext(AuthContext);
  const [userHistory, setUserHistory] = useState([]);
  const [addTask, setAddTask] = useState([
    { title: "New Calls", num: "" },
    { title: "New Data", num: "" },
    { title: "Leads", num: "" },
    { title: "Demo", num: "" },
    { title: "Installation", num: "" },
    { title: "Training", num: "" },
    { title: "Target", num: "" },
    { title: "Recovery", num: "" },
    { title: "Support", num: "" },
    { title: "Follow Up", num: "" },
    { title: "Product", num: "" },
  ]);
  const [addRequest, setAddRequest] = useState([
    { title: "New Calls", num: "", text: "" },
    { title: "New data", num: "", text: "" },
    { title: "Leads", num: "", text: "" },
    { title: "Demo", num: "", text: "" },
    { title: "Follow Up", num: "", text: "" },
    { title: "Target", num: "", text: "" },
    { title: "Training", num: "", text: "" },
    { title: "Installation", num: "", text: "" },
    { title: "Recovery", num: "", text: "" },
    { title: "Support", num: "", text: "" },
    { title: "Product", num: "", text: "" },
  ]);
  const [deadline, setDeadline] = useState("");
  const [date, setDate] = useState("");
  const [selectedExcelId, setSelectedExcelId] = useState({
    title: "",
    excelId: "",
  });
  const [excelIdList, setExcelIdList] = useState([]);
  const [userAssignProduct, setUserAssignProduct] = useState([]);
  const [taskProductMatrix, setTaskProductMatrix] = useState({});

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const result = await axios.get(`${base_url}/view-excel/get-allexcel`);
        console.log("excel data", result.data.result);
        setExcelIdList(result.data.result);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchExcel();
  }, []);

  useEffect(() => {
    const fetchUserTaskData = async () => {
      try {
        // ============ INITIALLY ASSIGN IT ===================
        const initialResult = await axios.get(
          `${base_url}/users/search-by-user/${executiveId}`
        );
        const user = initialResult.data.result;
        // const initProd = user.assignProduct.map((item) => ({
        //   title: item.label,
        //   min: 0,
        //   max: 0,
        // }));
        console.log(
          "user ---------",
          user.assignProduct.map((item) => item.label)
        );
        const userProducts = user.assignProduct.map((item) => item.label);
        // ============ IF EXIST DATA THEN DISPLAY IT ===================
        const result = await axios.get(
          `${base_url}/users/get-userForm/${executiveId}`
        );
        console.log("user task details", result.data.result, executiveId);
        const data = result.data.result;
        console.log("-----------------------", data?.task_product_matrix_db);
        if (Array.isArray(data?.task_product_matrix_db)) {
          const transformed = {};
          data.task_product_matrix_db.forEach((task) => {
            transformed[task.taskTitle] = {};
            task.products.forEach((p) => {
              transformed[task.taskTitle][p.productTitle] = p.num || 0;
            });
          });
          setTaskProductMatrix(transformed);
        } else {
          setTaskProductMatrix({});
        }

        const updatedTasks = addTask.map((task, index) => {
          const apiTask = data?.assign_task[index];
          return {
            ...task,
            num: apiTask && apiTask.num !== "" ? apiTask.num : 0,
          };
        });
        setAddTask(updatedTasks);

        const updatedRequest = addRequest.map((task, index) => {
          const req = data?.request_task[index];
          return {
            ...task,
            text: req && req.text !== "" ? req.text : 0,
            num: req && req.num !== "" ? req.num : 0,
          };
        });
        setAddRequest(updatedRequest);

        console.log(" BEFORE");
        if (!data?.product_task) {
          const initProd = user.assignProduct.map((item) => ({
            title: item.label,
            min: 0,
            max: 0,
          }));
          setUserAssignProduct(initProd);
          console.log("initProd", initProd);
        } else {
          const updatedProd = data?.product_task.map((item, index) => {
            const prod = data?.product_task[index];
            return {
              ...item,
              min: prod && prod.min !== 0 ? prod.min : 0,
              max: prod && prod.max !== 0 ? prod.max : 0,
            };
          });
          console.log("updatedRod", updatedProd);
          setUserAssignProduct(updatedProd);
        }
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchUserTaskData();
  }, [executiveId]);

  useEffect(() => {
    if (userAssignProduct.length > 0 && addTask.length > 0) {
      setTaskProductMatrix((prev) => {
        if (Object.keys(prev).length > 0) return prev;

        //otherwise initialize new
        const matrix = {}; // Object, not array
        addTask.forEach((task) => {
          matrix[task.title] = {};
          userAssignProduct.forEach((prod) => {
            matrix[task.title][prod.title] = 0;
          });
        });
        console.log("Initialized matrix", matrix);
        return matrix;
      });
    }
  }, [userAssignProduct, addTask]);

  const handleMatrixChange = (taskTitle, productTitle, value) => {
    setTaskProductMatrix((prev) => ({
      ...prev,
      [taskTitle]: {
        ...prev[taskTitle],
        [productTitle]: Number(value),
      },
    }));
  };

  console.log("taskProductMatrix", taskProductMatrix);
  const handleaddTask = () => {
    setAddTask([...addTask, { title: "", num: "" }]);
    console.log("task-", addTask);
  };
  const handleExcel = (id) => {
    console.log("yo yo", id);
    const title = excelIdList.find((item) => item.dumpBy_db === id);
    setSelectedExcelId({ title: title.excel_title_db, excelId: id });
  };
  const handleTitleChange = (index, field, value) => {
    const updated = [...addTask];
    updated[index][field] = value;
    setAddTask(updated);
  };
  const handleRemoveTask = (index) => {
    const updated = [...addTask];
    updated.splice(index, 1);
    setAddTask(updated);
  };
  const handleAddRquestTask = () => {
    setAddRequest([...addRequest, { title: "", num: "", text: "" }]);
  };
  const handleRequestTitleChange = (index, field, value) => {
    const updated = [...addRequest];
    updated[index][field] = value;
    setAddRequest(updated);
  };
  const handleRemoveRequest = (index) => {
    const updated = [...addRequest];
    updated.splice(index, 1);
    setAddRequest(updated);
  };

  const handleProductTitleChange = (index, field, value) => {
    const update = [...userAssignProduct];
    update[index][field] = value;
    setUserAssignProduct(update);
  };

  const handleSaveUser = async (e) => {
    console.log("dfasdfd");
    try {
      const result = await axios.post(`${base_url}/users/user-task-form`, {
        assignTask: addTask,
        requestTask: addRequest,
        productTask: userAssignProduct,
        assignById: userLoginId?.userId,
        assignToId: executiveId,
        deadline: deadline,
        date: date,
        taskProductMatrix: taskProductMatrix,
        selectedExcel: selectedExcelId,
      });
      console.log("User Task Saved", result.data);
      alert("User data saved successfully!");
    } catch (err) {
      console.error("Error saving user data", err);
      alert("Error saving user data. Please try again.");
    }
  };

  const handleTimeChange = (time) => {
    if (time === "HH:MM:SS AM/PM") {
      time = "23:59:00";
    }
    console.log("time blte", time);
    setDeadline(time);
  };

  const handleOpenUserHistory = async () => {
    try {
      const result = await axios.get(
        `${base_url}/users/get-userForm-history/${executiveId}`
      );

      setUserHistory(result.data.result);
      console.log("user Assign Task History", result.data.result);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  return (
    <div className="userassign-task-body">
      <div className="userassign-task-main">
        <div className="heading-div">
          <h2>Setting </h2>
          <h2> UserId-{executiveId}</h2>
        </div>
        {/* <div className="assign-file-div">
          <h4>Assign File</h4>
          <select
            id=""
            value={selectedExcelId.excelId}
            onChange={(e) => {
              handleExcel(e.target.value);
            }}
          >
            <option value="">--Select--</option>
            {excelIdList.map((item, idx) => (
              <option value={item.dumpBy_db}>{item.excel_title_db}</option>
            ))}
          </select>
        </div> */}
        <div className="matrix-table-container">
          <h4 style={{ marginBottom: "10px" }}>Assign Task</h4>
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Task \ Product</th>
                {userAssignProduct.map((prod, i) => (
                  <th key={i}>{prod.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {addTask.map((task, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold" }}>{task.title}</td>
                  {userAssignProduct.map((prod, j) => (
                    <td key={j}>
                      <input
                        type="number"
                        min="0"
                        value={taskProductMatrix[task.title]?.[prod.title] || 0}
                        onChange={(e) =>
                          handleMatrixChange(
                            task.title,
                            prod.title,
                            e.target.value
                          )
                        }
                        className="userassigntask-input"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="assign-task-div">
          {/* <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {" "}
            <h4>Assign Task</h4>
          </div> */}

          {/* <div className="assign-task-item-div"> */}
          {/* <div className="assign-task-item">
              <p>{addTask[0].title}</p>
              <input
                type="number"
                value={addTask[0].num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(0, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[1]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[1]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(1, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[2]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[2]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(2, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[3]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[3]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(3, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[4]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[4]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(4, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[5]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[5]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(5, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[6]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[6]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(6, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[7]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[7]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(7, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[8]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[8]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(8, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[9]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[9]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(9, "num", value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[10]?.title}</p>{" "}
              <input
                type="number"
                value={addTask[10]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleTitleChange(10, "num", value);
                }}
                className="userassigntask-input"
              />
            </div> */}
          {/* 
            {addTask.slice(4).map((item, idx) => {
              const index = idx + 4;
              return (
                <div
                  className="assign-task-item"
                  style={{ position: "relative" }}
                  key={index + 4}
                >
                  <p>
                    <input
                      className="userassigntask-input align-input"
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        handleTitleChange(index, "title", e.target.value);
                      }}
                    />
                  </p>
                  <input
                    type="number"
                    className="userassigntask-input"
                    value={item.text}
                    onChange={(e) => {
                      handleTitleChange(index, "text", e.target.value);
                    }}
                  />
                  <p
                    className="remove-x"
                    onClick={() => {
                      handleRemoveTask(index);
                    }}
                  >
                    x
                  </p>
                </div>
              );
            })} */}
          {/* <div className="assign-task-item">
              <p>
                <IoMdAddCircleOutline
                  onClick={handleaddTask}
                  className="add-icon"
                />
              </p>
            </div> */}
          {/* </div> */}
        </div>

        <div style={{ display: "none" }} className="request-div">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {" "}
            <h4>Request</h4>
          </div>
          <div className="request-item-div">
            <div className="request-item">
              <h4></h4> <h4></h4> <h4>Note</h4>
            </div>
            <div className="request-item">
              <p>{addRequest[0]?.title}</p>
              <input
                type="number"
                value={addRequest[0]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(0, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[0]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(0, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[1]?.title}</p>
              <input
                type="number"
                value={addRequest[1]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(1, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[1]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(1, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[2]?.title}</p>
              <input
                type="number"
                value={addRequest[2]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(2, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[2]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(2, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[3]?.title}</p>
              <input
                type="number"
                value={addRequest[3]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(3, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[3]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(3, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[4]?.title}</p>
              <input
                type="number"
                value={addRequest[4]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(4, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[4]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(4, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[5]?.title}</p>
              <input
                type="number"
                value={addRequest[5]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(5, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[5]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(5, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[6]?.title}</p>
              <input
                type="number"
                value={addRequest[6]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(6, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[6]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(6, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[7]?.title}</p>
              <input
                type="number"
                value={addRequest[7]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(7, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[7]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(7, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[8]?.title}</p>
              <input
                type="number"
                value={addRequest[8]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(8, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[8]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(8, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[9]?.title}</p>
              <input
                type="number"
                value={addRequest[9]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(9, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[9]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(9, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[10]?.title}</p>
              <input
                type="number"
                value={addRequest[10]?.num}
                onChange={(e) => {
                  const value = Math.max(0, e.target.value);
                  handleRequestTitleChange(10, "num", value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[10]?.text}
                onChange={(e) => {
                  handleRequestTitleChange(10, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            {/* {addRequest.slice(5).map((item, idx) => {
              const index = idx + 5;
              return (
                <div className="request-item" style={{ position: "relative" }}>
                  <p>
                    <input
                      type="text"
                      value={item.title}
                      className="userassigntask-input align-input"
                      onChange={(e) => {
                        handleRequestTitleChange(
                          index,
                          "title",
                          e.target.value
                        );
                      }}
                    />
                  </p>
                  <input
                    type="number"
                    value={item.num}
                    className="userassigntask-input "
                    onChange={(e) => {
                      handleRequestTitleChange(index, "num", e.target.value);
                    }}
                  />
                  <input
                    type="text"
                    value={item.text}
                    className="userassigntask-input align-input"
                    onChange={(e) => {
                      handleRequestTitleChange(index, "text", e.target.value);
                    }}
                  />
                  <p
                    className="remove-x"
                    onClick={() => {
                      handleRemoveRequest(index);
                    }}
                  >
                    x
                  </p>
                </div>
              );
            })}
            <div className="request-item">
              <p>
                <IoMdAddCircleOutline
                  className="add-icon"
                  onClick={handleAddRquestTask}
                />
              </p>
            </div> */}
          </div>
        </div>

        <div className="product-list-div">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {" "}
            <h4>Product</h4>
          </div>
          <div className="product-item-div">
            <div className="product-item">
              <h4></h4> <h4>Min</h4>
              <h4>Max</h4>
            </div>

            {(userAssignProduct || []).map((item, idx) => (
              <div className="product-item" key={idx}>
                <p>{item.title}</p>
                <input
                  type="number"
                  value={item.min}
                  onChange={(e) => {
                    const value = Number(Math.max(0, e.target.value));
                    handleProductTitleChange(idx, "min", value);
                  }}
                  className="userassigntask-input"
                />
                <input
                  type="number"
                  value={item.max}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    handleProductTitleChange(idx, "max", value);
                  }}
                  className="userassigntask-input "
                />
              </div>
            ))}
          </div>
        </div>
        <div className="task-save-btn">
          {/* <div></div> */}
          {/* <span>
            <label htmlFor="">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
            />
          </span> */}
          {/* <span>
            <label htmlFor="">Deadline</label>
            <TimepickerComponent onTimeChange={handleTimeChange} />
          </span> */}
          <FaClipboardList
            style={{ color: "blue", fontSize: "20px" }}
            onClick={() => {
              handleOpenUserHistory(executiveId);
            }}
          />
          <button
            onClick={(e) => {
              handleSaveUser(e);
            }}
          >
            Save
          </button>
        </div>
      </div>
      {userHistory.length > 0 && (
        <div className="userHistory">
          <div className="userHistoryinner">
            <div className="header">
              <h4>User Task Assign History</h4>
            </div>

            <div className="tablediv">
              <table>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Assign By</th>
                    <th>Assign To</th>
                    <th>Assign Task</th>
                    <th>Request Task</th>
                    <th>Product Task</th>
                    {/* <th>Excel ID</th> */}
                    <th>Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {userHistory.length > 0 ? (
                    userHistory.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.assignById_db}</td>
                        <td>{item.assignToId_db}</td>

                        {/* Assign Task */}
                        <td>
                          {item.assign_task && item.assign_task.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "15px" }}>
                              {item.assign_task.map((task, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "70% 30%",
                                  }}
                                >
                                  <li htmlFor="">{task.title}</li>
                                  <label htmlFor=""> {task.num}</label>
                                </div>
                              ))}
                            </ul>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Request Task */}
                        <td>
                          {item.request_task && item.request_task.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "15px" }}>
                              <div
                                style={{
                                  width: "100%",
                                  display: "grid",
                                  gridTemplateColumns: "40% 45% 15%",
                                }}
                              >
                                <label htmlFor=""></label>
                                <label htmlFor="">text</label>
                                <label htmlFor="">Num</label>
                              </div>
                              {item.request_task.map((req, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "40% 45% 15%",
                                  }}
                                >
                                  <li htmlFor="">{req.title}</li>
                                  <label
                                    htmlFor=""
                                    style={{ textWrap: "wrap" }}
                                  >
                                    {req.text}
                                  </label>
                                  <label htmlFor="">{req.num}</label>
                                </div>
                              ))}
                            </ul>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Product Task */}
                        <td>
                          {item.product_task && item.product_task.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "15px" }}>
                              {item.product_task.map((p, i) => (
                                <div
                                  key={i}
                                  style={{
                                    width: "100%",
                                    display: "grid",
                                    gridTemplateColumns: "40% 30% 30%",
                                  }}
                                >
                                  <label htmlFor="">{p.title}</label>
                                  <label htmlFor="">Min: {p.min}</label>
                                  <label htmlFor="">Max: {p.max}</label>
                                </div>
                              ))}
                            </ul>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Excel ID */}
                        {/* <td >
                          <div style={{display:"flex",flexDirection:"column"}}>
                            <label htmlFor=""> {item.excelId_db.title} </label>
                          <label htmlFor=""> {item.excelId_db.excelId}</label>
                          </div>
                        </td> */}

                        {/* Dates */}
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">No history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="btndivH" style={{ paddingRight: "20px" }}>
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
    </div>
  );
};

export default UserAssignTask;
