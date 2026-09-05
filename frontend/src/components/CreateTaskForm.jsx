import React, { useState, useEffect, useContext } from "react";
import styles from "./CreateTaskForm.module.css";
import axios from "axios";
import { base_url } from "../config/config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context-api/AuthContext";
import { CiEdit } from "react-icons/ci";
import TimepickerComponent from "../UI/TimePickerComponent";

const CreateTaskForm = () => {
  const { userLoginId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [membersList, setMembersList] = useState([]);
  const [taskType, setTaskType] = useState(null);
  const [selectUserId, setSelectUserId] = useState(null);
  const [userAssignProduct, setUserAssignProduct] = useState([]);
  const [taskMode, settaskMode] = useState(null);
  const [deadline, setDeadline] = useState("");
  const [date, setDate] = useState("");

  const [addTask, setAddTask] = useState([

        { title: "New Data Add", num: "", completed: 0 },
    { title: "No of New Calls", num: "", completed: 0 },
    { title: "Leads", num: "", completed: 0 },
    { title: "Demo", num: "", completed: 0 },
    { title: "Follow Up", num: "", completed: 0 },
    { title: "Target", num: "", completed: 0 },
    { title: "Training", num: "", completed: 0 },
    { title: "Installation", num: "", completed: 0 },
    { title: "Recovery", num: "", completed: 0 },
    { title: "Support", num: "", completed: 0 },
    { title: "Product", num: "", completed: 0 },
    
  ]);
  const [addRequest, setAddRequest] = useState([

        { title: "New data add", num: "", text: "", completed: 0  },
    { title: "No of New Calls", num: "", text: "", completed: 0  },
    { title: "Leads", num: "", text: "" , completed: 0 },
    { title: "Demo", num: "", text: "", completed: 0  },
    { title: "Follow Up", num: "", text: "" , completed: 0 },
    { title: "Target", num: "", text: "", completed: 0  },
    { title: "Training", num: "", text: "", completed: 0  },
    { title: "Installation", num: "", text: "", completed: 0  },
    { title: "Recovery", num: "", text: "" , completed: 0 },
    { title: "Support", num: "", text: "", completed: 0  },
    { title: "Product", num: "", text: "", completed: 0  },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const userDetails = await axios.get(`${base_url}/users/search-all-user`);
      const users = userDetails.data.result;
      const usersId = users.map((ids) => ({
        id: ids.generateUniqueId,
        name: ids.name,
      }));
      console.log("userIds", usersId);
      setMembersList(usersId);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log("exexcutiveId", selectUserId);
    const fetchAssignProduct = async () => {
      try {
        const result = await axios.get(
          `${base_url}/users/get-userForm/${selectUserId}`
        );
        const data = result.data.result;
        console.log("user", data);
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

        const updatedProd = data?.product_task?.map((item, idx) => ({
          title: item.title,
          min: item.min,
          max: item.max,
        }));
        console.log("updatedProd", updatedProd);
        setUserAssignProduct(updatedProd);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchAssignProduct();
    setDate("");
    setTaskType(null);
    handleTimeChange("HH:MM:SS AM/PM");
  }, [selectUserId]);

  const handleTitleChange = (index, field, value) => {
    const updated = [...addTask];
    updated[index][field] = value;
    setAddTask(updated);
  };

  const handleRequestTitleChange = (index, field, value) => {
    const updated = [...addRequest];
    updated[index][field] = value;
    setAddRequest(updated);
  };

  const handleProductTitleChange = (index, field, value) => {
    const update = [...userAssignProduct];
    update[index][field] = value;
    setUserAssignProduct(update);
  };
  const handleChange = (value) => {
    console.log("value", value);
    setTaskType(value);
  };

  const goToPage = () => {
    console.log("--", addTask, addRequest);
    let flag = false;
    if (taskMode === "Bulk") {
      addTask.forEach((item) => {
        if (item.num > 0) {
          flag = true;
        }
      });
    } else {
      addRequest.forEach((item) => {
        if (item.num > 0) {
          flag = true;
        }
      });
    }
    if (!flag) {
     return alert("Task Mode fields cann't be 0");
    }
    console.log("data", {
      userId: selectUserId,
      assignType: taskType,
      from: "assignTask",
      taskMode: taskMode,
      target: taskMode === "Bulk" ? addTask : addRequest,
      userProduct: userAssignProduct,
    });
    navigate("/search-client", {
      state: {
        userId: selectUserId,
        assignType: taskType,
        from: "assignTask",
        taskMode: taskMode,
        target: taskMode === "Bulk" ? addTask : addRequest,
        userProduct: userAssignProduct,
        date: date,
        deadline: deadline,
      },
    });
  };
  console.log("task-------------------", addTask, addRequest);
  const handleSendTask = async () => {
    const isConfirmed = window.confirm(
      "Are you sure to sending task without loading data to user?"
    );
    if (taskMode !== "Request") return alert("Please select request option");
    if (!isConfirmed) return;
    try {
      const result = await axios.post(
        `${base_url}/task/task-assign`,
        {
          assignBy: userLoginId?.userId,
          assignTo: selectUserId,
          taskType: taskType,
          target: addRequest,
          taskMode: "Regular",
          productRange: userAssignProduct,
          date: date,
          deadline: deadline,
          directSend:"true",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Task Assign Successfully", result);
      alert(result.data.message);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleTimeChange = (time) => {
    if (!time || time === "HH:MM:SS AM/PM") {
      setDeadline("NA");
    } else {
      setDeadline(time);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h2>Assign Task</h2>
        </header>
        <div className={styles.body}>
          <span>
            <label htmlFor="">User</label>
            <select
              name=""
              id=""
              value={selectUserId}
              onChange={(e) => {
                setSelectUserId(e.target.value);
              }}
            >
              <option value="">--select--</option>
              {membersList.map((item, idx) => (
                <option key={idx} value={item.id}>
                  {item.id} ({item.name})
                </option>
              ))}
            </select>
          </span>
          <span>
            <label htmlFor="">Task type</label>
            <select
              name=""
              id=""
              value={taskType}
              onChange={(e) => {
                handleChange(e.target.value);
              }}
            >
              <option value="">--Select--</option>
              <option value="REMINDER">Reminder</option>
              <option value="EXCEL">Excel</option>
              <option value="BULK DATA">Bulk Data</option>
            </select>
          </span>
          <span>
            <label>Please select task mode</label>
          </span>
          {/* <div className={taskMode !== "Bulk" && styles.fade}>
            <h4>
              {" "}
              <input
                type="radio"
                name="name"
                onChange={() => {
                  settaskMode("Bulk");
                }}
              />{" "}
              Assign Task
            </h4>
            {taskMode === "Bulk" && (
              <div className="assign-task-item-div">
                <div className="assign-task-item">
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
                  <p>{addTask[1].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[1].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(1, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[2].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[2].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(2, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[3].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[3].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(3, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[4].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[4].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(4, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[5].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[5].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(5, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[6].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[6].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(6, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[7].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[7].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(7, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[8].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[8].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(8, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[9].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[9].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(9, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
                <div className="assign-task-item">
                  <p>{addTask[10].title}</p>{" "}
                  <input
                    type="number"
                    value={addTask[10].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleTitleChange(10, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                </div>
              </div>
            )}
          </div> */}
          <div className={taskMode !== "Request" && styles.fade}>
            <h4>
              <input
                type="radio"
                name="name"
                onChange={() => {
                  settaskMode("Request");
                }}
              />{" "}
              Request
            </h4>
            {taskMode === "Request" && (
              <div className="request-item-div">
                <div className="request-item">
                  <h4></h4> <h4></h4> <h4>Note</h4>
                </div>
                <div className="request-item">
                  <p>{addRequest[0].title}</p>
                  <input
                    type="number"
                    value={addRequest[0].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(0, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[0].text}
                    onChange={(e) => {
                      handleRequestTitleChange(0, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[1].title}</p>
                  <input
                    type="number"
                    value={addRequest[1].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(1, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[1].text}
                    onChange={(e) => {
                      handleRequestTitleChange(1, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[2].title}</p>
                  <input
                    type="number"
                    value={addRequest[2].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(2, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[2].text}
                    onChange={(e) => {
                      handleRequestTitleChange(2, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[3].title}</p>
                  <input
                    type="number"
                    value={addRequest[3].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(3, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[3].text}
                    onChange={(e) => {
                      handleRequestTitleChange(3, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[4].title}</p>
                  <input
                    type="number"
                    value={addRequest[4].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(4, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[4].text}
                    onChange={(e) => {
                      handleRequestTitleChange(4, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[5].title}</p>
                  <input
                    type="number"
                    value={addRequest[5].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(5, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[5].text}
                    onChange={(e) => {
                      handleRequestTitleChange(5, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[6].title}</p>
                  <input
                    type="number"
                    value={addRequest[6].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(6, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[6].text}
                    onChange={(e) => {
                      handleRequestTitleChange(6, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[7].title}</p>
                  <input
                    type="number"
                    value={addRequest[7].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(7, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[7].text}
                    onChange={(e) => {
                      handleRequestTitleChange(7, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[8].title}</p>
                  <input
                    type="number"
                    value={addRequest[8].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(8, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[8].text}
                    onChange={(e) => {
                      handleRequestTitleChange(8, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[9].title}</p>
                  <input
                    type="number"
                    value={addRequest[9].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(9, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[9].text}
                    onChange={(e) => {
                      handleRequestTitleChange(9, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
                <div className="request-item">
                  <p>{addRequest[10].title}</p>
                  <input
                    type="number"
                    value={addRequest[10].num}
                    onChange={(e) => {
                      const value = Math.max(0, e.target.value);
                      handleRequestTitleChange(10, "num", value);
                    }}
                    className="userassigntask-input"
                  />
                  <input
                    type="text"
                    value={addRequest[10].text}
                    onChange={(e) => {
                      handleRequestTitleChange(10, "text", e.target.value);
                    }}
                    className="userassigntask-input align-input"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="product-file-div">
            <h4>Product</h4>
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

          <header className={styles.header}>
            <div>
              <h4>Uptil Date</h4>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                }}
              />
            </div>
            <div>
              <h4>Deadline</h4>{" "}
              <TimepickerComponent
                value={deadline}
                onTimeChange={handleTimeChange}
              />
            </div>
          </header>

          <div className={styles.btndiv}>
            <button
              onClick={() => {
                handleSendTask();
              }}
            >
              Send
            </button>
            <button
              onClick={() => {
                goToPage();
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskForm;
