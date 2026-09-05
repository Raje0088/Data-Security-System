import React, { useState, useContext, useEffect } from "react";
import styles from "./QuickTeritoryFlash.module.css";
import { AuthContext } from "../context-api/AuthContext";
import axios from "axios";
import { base_url } from "../config/config";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import ReactDOM from "react-dom";

const QuickTeritoryFlash = ({ isOpen, onClose }) => {
  const { userLoginId } = useContext(AuthContext);
  const [taskList, setTaskList] = useState([]);
  const [products, setProducts] = useState([]);
  const [userAssignTask, setUserAssignTask] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reminderList, setReminderList] = useState([]);
  const [areaList, setAreaList] = useState([]);

  useEffect(() => {
    if (!userLoginId) return;
    const fetch = async () => {
      try {
        const userProgressData = await axios.get(
          `${base_url}/progress/get-admintask/${userLoginId?.userId}`
        );
        const taskFieldMap = {
          "New Calls": "new_calls_db",
          "New Data": "new_data_db",
          Leads: "leads_db",
          Demo: "demo_db",
          Installation: "installation_db",
          Training: "training_db",
          Target: "target_db",
          Recovery: "recovery_db",
          Support: "support_db",
          "Follow Up": "followUp_db",
        };

        const { rows, products } = buildTableFromDocs(
          userProgressData.data,
          taskFieldMap
        );

        setTaskList(rows);
        setProducts(products);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetch();
  }, [userLoginId?.userId]);

  function buildTableFromDocs(docsObj, taskFieldMap) {
    const docs = docsObj.result;
    // get product names from docs (dynamic, NOT hard-coded)
    const products = docs.map((d) => d.product_db);

    const rows = Object.entries(taskFieldMap).map(([taskLabel, field]) => {
      const row = { task: taskLabel };

      products.forEach((product, idx) => {
        const item = docs[idx]?.[field] || {};
        row[product] = {
          selfAssign: item.selfAssign ?? 0,
          adminAssign: item.adminAssign ?? 0,
          completed: item.completed ?? 0,
        };
      });
      return row;
    });
    return { rows, products };
  }

  return (
    <div className={styles.main}>
      <div className={styles.overlay}>
        <div className={styles.heading}>
          <h4>Quick Overview</h4>
        </div>
        <div className={styles.content}>
          <div className={styles.contentup}>
            <div
              style={{
                background: "#FFE7B8",
              }}
              className={styles.card}
            >
              <h4
                style={{
                  textAlign: "center",
                  color: "#1E3A8A",
                  fontSize: "14px",
                  paddingBottom: "5px",
                }}
              >
                Self Assign Task
              </h4>

              {taskList.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Task / Product</th>
                      {products.map((prod) => (
                        <th key={prod}>{prod}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {taskList.map((row, index) => (
                      <tr key={row.task}>
                        <td>{row.task}</td>

                        {products.map((prod) => {
                          const data = row[prod];

                          return (
                            <td key={prod} style={{ textAlign: "center" }}>
                              {data ? (
                                <span
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    justifyContent: "center",
                                  }}
                                >
                                  <p style={{ color: "green",fontWeight:"700" }}>
                                    {data.completed}
                                  </p>
                                  -
                                  <p style={{ color: "red",fontWeight:"700" }}>
                                    {data.selfAssign}
                                  </p>
                                
                                
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <h3>Goals not schedule</h3>
              )}
            </div>

            <div
              style={{
                background: "#B8FFBA",
              }}
              className={styles.card}
            >
              <h4
                style={{
                  textAlign: "center",
                  color: "#1E3A8A",
                  fontSize: "14px",
                  paddingBottom: "5px",
                }}
              >
                Admin Assign Task
              </h4>

              {taskList.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Task / Product</th>
                      {products.map((prod) => (
                        <th key={prod}>{prod}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {taskList.map((row, index) => (
                      <tr key={row.task}>
                        <td>{row.task}</td>

                        {products.map((prod) => {
                          const data = row[prod];

                          return (
                            <td key={prod} style={{ textAlign: "center" }}>
                              {data ? (
                                <span
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    justifyContent: "center",
                                  }}
                                >
                                  <p style={{ color: "blue",fontWeight:"700" }}>
                                    {data.completed}
                                  </p>
                                  -
                                  <p style={{ color: "red",fontWeight:"700" }}>
                                    {data.adminAssign}
                                  </p>
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <h3>Goals not schedule</h3>
              )}
            </div>
          </div>
          <div className={styles.contentdown}>
            {/* <div style={{ width: "100%", padding: "5px" }}>

              <div className={styles.regiondiv}>
                <div>
                  <h2
                    style={{
                      textAlign: "center",
                      color: "white",
                      paddingBottom: "5px",
                    }}
                  >
                    Region
                  </h2>
                </div>
                <div className={styles.regionWrapper}>
                  {areaList?.map((place, i) => (
                    <div key={i} className={styles.innerWrapper}>
                      <span
                        // style={{ fontSize: "10px", fontWeight: "700" }}
                        className={styles.prodCellWrapper}
                      >
                        {place.productName}
                      </span>

                      {place.region.map((area, idx) => (
                        <div className={styles.areadiv}>
                          <span className={styles.stateCellWrapper}>
                            {area.stateName}{" "}
                            <sup className={styles.distnotify}>
                              {area.totalCnt}
                            </sup>
                          </span>
                          <span className={styles.districtCellWrapper}>
                            <div className={styles.districtCell}>
                              {area?.districts?.slice(0, 10)?.map((item, j) => (
                                <span key={j} className={styles.districtItem}>
                                  {item.districtName}
                                  <sup className={styles.distnotify}>
                                    {item.totalDistCnt}
                                  </sup>
                                  {" ,  "}
                                </span>
                              ))}
                            </div>

                            <div className={styles.distbox}>
                              {area?.districts?.map((dist, k) => (
                                <span key={k} className={styles.distboxItem}>
                                  {dist.districtName}
                                  <sup className={styles.distnotify}>
                                    {dist.totalDistCnt}
                                  </sup>
                                  {", "}
                                </span>
                              ))}
                            </div>
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* <table>

                    <tbody>
                  {areaList?.area?.map((state, i) => (
                    <tr key={i} className={styles.region}>
                      <td>
                        {state.stateName}{" "}
                        <sup className={styles.distnotify}>
                          {state.totalCnt}
                        </sup>
                      </td>
                      <td className={styles.districtCellWrapper}>
                        <div className={styles.districtCell}>
                          {state?.district?.map((item, j) => (
                            <span key={j} className={styles.districtItem}>
                              {item.districtName}
                              <sup className={styles.distnotify}>
                                {item.totalDistCnt}
                              </sup>
                              {" ,  "}
                            </span>
                          ))}
                        </div>

                        <div className={styles.distbox}>
                          {state?.district?.map((dist, k) => (
                            <span key={k}>
                              {dist.districtName}
                              <sup className={styles.distnotify}>
                                {dist.totalDistCnt}
                              </sup>
                              {", "}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                    </tbody>
                  </table> 
                   <div className={styles.region}>
                    <strong>State</strong>
                    <strong>District</strong>
                  </div>
                  {areaList?.area?.map((state, i) => (
                    <div key={i} className={styles.region}>
                      <div>
                        {state.stateName}{" "}
                        <sup className={styles.distnotify}>
                          {state.totalCnt}
                        </sup>
                      </div>
                      <div className={styles.districtCellWrapper}>
                        <div className={styles.districtCell}>
                          {state?.district?.map((item, j) => (
                            <span key={j} className={styles.districtItem}>
                              {item.districtName}
                              <sup className={styles.distnotify}>
                                {item.totalDistCnt}
                              </sup>
                              {" ,  "}
                            </span>
                          ))}
                        </div>

                        <div className={styles.distbox}>
                          {state?.district?.map((dist, k) => (
                            <span key={k}>
                              {dist.districtName}
                              <sup className={styles.distnotify}>
                                {dist.totalDistCnt}
                              </sup>
                              {", "}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))} 
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

// KEEP THIS CODE

// const QuickTeritoryFlash = ({ isOpen, onClose }) => {
//   const { userLoginId } = useContext(AuthContext);
//   const [reminderList, setReminderList] = useState([]);
//   const [areaList, setAreaList] = useState([]);
//   const [taskList, setTaskList] = useState([]);
//   const [userAssignTask, setUserAssignTask] = useState([]);
//   const [goals, setGoals] = useState([]);
//   const [mergeTask, setMergeTask] = useState([]);

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const user = await axios.get(
//           `${base_url}/users/search-by-user/${userLoginId?.userId}`
//         );
//         const region = user?.data?.result;

//         const task = await axios.get(
//           `${base_url}/task/get-assign-task/${userLoginId?.userId}`,
//           {
//             params: { dateFrom: new Date().toISOString().split("T")[0] },
//           }
//         );

//         const userAssignForm = await axios.get(
//           `${base_url}/users/get-userForm/${userLoginId?.userId}`
//         );
//         const userForm = userAssignForm?.data?.result;
//         setUserAssignTask(userForm);

//         const goals = await axios.get(
//           `${base_url}/schedule/get-goals/${userLoginId?.userId}`
//         );

//         const userProgressData = await axios.get(
//           `${base_url}/progress/get-admintask/${userLoginId?.userId}`
//         );

//         const taskFieldMap = {
//           "New Calls": "new_calls_db",
//           "New Data": "new_data_db",
//           Leads: "leads_db",
//           Demo: "demo_db",
//           Installation: "installation_db",
//           Training: "training_db",
//           Target: "target_db",
//           Recovery: "recovery_db",
//           Support: "support_db",
//           "Follow Up": "followUp_db",
//         };

//         const mergedTasks =
//           userForm?.task_product_matrix_db?.map((task) => {
//             const dbKey = taskFieldMap[task.taskTitle];
//             if (!dbKey) return task;

//             const mergedProducts = task?.products?.map((prod) => {
//               const progressDoc = userProgressData.data?.result.find(
//                 (p) => p.product_db === prod.productTitle
//               );

//               let completed = 0;
//               if (progressDoc && progressDoc[dbKey]) {
//                 completed = progressDoc[dbKey].completed || 0;
//               }

//               return {
//                 ...prod,
//                 completed,
//               };
//             });

//             return {
//               ...task,
//               products: mergedProducts,
//             };
//           }) || [];

//         setUserAssignTask({ ...userForm, task_product_matrix_db: mergedTasks });

//         setGoals(goals.data.result?.goals_db);

//         setTaskList(task.data?.result);
//         console.log(region.master_data_db?.productPermissions);
//         setAreaList(region.master_data_db?.productPermissions);
//         setReminderList(result.data?.result);
//       } catch (err) {
//         console.log("internal error", err);
//       }
//     };
//     fetch();
//   }, [userLoginId?.userId]);

//   let goalsMap = new Map([
//     ["New Data", "new_data_db"],
//     ["New Calls", "new_calls_db"],
//     ["Leads", "leads_db"],
//     ["Demo", "demo_db"],
//     ["Follow Up", "followUp_db"],
//     ["Target", "target_db"],
//     ["Training", "training_db"],
//     ["Installation", "installation_db"],
//     ["Recovery", "recovery_db"],
//     ["Support", "support_db"],
//   ]);

//   const reverseGoalsMap = new Map(
//     [...goalsMap.entries()].map(([display, dbKey]) => [dbKey, display])
//   );

//   const productTitles =
//     userAssignTask?.task_product_matrix_db?.[0]?.products?.map(
//       (p) => p.productTitle
//     );

//   const products = Object.keys(goals || {});

//   const allTasks = Array.from(
//     new Set(products.flatMap((prod) => Object.keys(goals[prod])))
//   );
//   return (
//     <div className={styles.main}>
//       <div className={styles.overlay}>
//         <div className={styles.heading}>
//           <h4>Quick Overview</h4>
//         </div>
//         <div className={styles.content}>
//           <div className={styles.contentup}>
//             <div
//               style={{
//                 background: "#FFE7B8",
//               }}
//               className={styles.card}
//             >
//               <h4
//                 style={{
//                   textAlign: "center",
//                   color: "#1E3A8A",
//                   fontSize: "14px",
//                   paddingBottom: "5px",
//                 }}
//               >
//                 Self Assign Task
//               </h4>

//               {allTasks.length > 0 ? (
//                 <table>
//                   <thead>
//                     <tr>
//                       <th style={{ fontSize: "12px" }}>Task / Product</th>
//                       {products.map((prod) => (
//                         <th key={prod} style={{ fontSize: "12px" }}>
//                           {prod}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {allTasks.map((task, index) => (
//                       <tr
//                         key={task}
//                         style={{
//                           backgroundColor:
//                             index % 2 === 0 ? "#FFE7B8" : "#FFFFFF",
//                           borderBottom: "1px solid #E5E7EB",
//                         }}
//                       >
//                         <td
//                           style={{
//                             color: "#0F172A",
//                           }}
//                         >
//                           {reverseGoalsMap.get(task)}
//                         </td>
//                         {products.map((prod) => {
//                           const data = goals[prod][task];
//                           return (
//                             <td
//                               key={prod + task}
//                               style={{
//                                 textAlign: "center",
//                                 color: "#1E3A8A",
//                                 fontWeight: "600",
//                               }}
//                             >
//                               {data ? (
//                                 <span
//                                   style={{
//                                     display: "flex",
//                                     gap: "5px",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                   }}
//                                 >
//                                   {" "}
//                                   <p style={{ color: "black" }}>
//                                     {data.completed_db}
//                                   </p>{" "}
//                                   -{" "}
//                                   <p style={{ color: "red" }}>
//                                     {data.assigned_db}
//                                   </p>
//                                 </span>
//                               ) : (
//                                 "-"
//                               )}
//                             </td>
//                           );
//                         })}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <h3>Goals not schedule</h3>
//               )}
//             </div>

//             <div
//               style={{
//                 background: "#B8FFBA",
//               }}
//               className={styles.card}
//             >
//               <h4
//                 style={{
//                   textAlign: "center",
//                   color: "#1E3A8A",
//                   fontSize: "14px",
//                   paddingBottom: "5px",
//                 }}
//               >
//                 Admin Assign Task
//               </h4>

//               <table style={{ fontSize: "12px" }}>
//                 <thead>
//                   <tr style={{ fontSize: "12px" }}>
//                     <th style={{ fontSize: "12px" }}>Task ↓ / Product </th>
//                     {productTitles?.map((prod, i) => (
//                       <th key={i} style={{ fontSize: "12px" }}>
//                         {prod}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {userAssignTask?.task_product_matrix_db?.map((task, i) => (
//                     <tr
//                       key={i}
//                       style={{
//                         backgroundColor: i % 2 === 0 ? "#B8FFBA" : "#FFFFFF",
//                         borderBottom: "1px solid #E5E7EB",
//                       }}
//                     >
//                       <td
//                         style={{
//                           fontWeight: "500",
//                           color: "#0F172A",
//                         }}
//                       >
//                         {task.taskTitle}
//                       </td>
//                       {productTitles.map((prodTitle, j) => {
//                         const product = task.products.find(
//                           (p) => p.productTitle === prodTitle
//                         );
//                         return (
//                           <td
//                             key={j}
//                             style={{
//                               // padding: "10px 14px",
//                               textAlign: "center",
//                               color: "#1E3A8A",
//                               fontWeight: "600",
//                             }}
//                           >
//                             {product ? (
//                               <span
//                                 style={{
//                                   display: "flex",
//                                   gap: "5px",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                 }}
//                               >
//                                 {" "}
//                                 <p style={{ color: "black" }}>
//                                   {product.completed || 0}
//                                 </p>{" "}
//                                 - <p style={{ color: "red" }}>{product.num}</p>
//                               </span>
//                             ) : (
//                               0
//                             )}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           <div className={styles.contentdown}>
//             <div style={{ width: "100%", padding: "5px" }}>
//               {/* ========================================================== */}

//               <div className={styles.regiondiv}>
//                 <div>
//                   <h2
//                     style={{
//                       textAlign: "center",
//                       color: "white",
//                       paddingBottom: "5px",
//                     }}
//                   >
//                     Region
//                   </h2>
//                 </div>
//                 <div className={styles.regionWrapper}>
//                   {/* <div className={styles.innerWrapper}>
//                    <h3 className={styles.prodCellWrapper}>Product</h3>
//                     <div className={styles.areadiv}>
//                       <h3 className={styles.stateCellWrapper}>State</h3>
//                       <h3 className={styles.districtCellWrapper}>District</h3>
//                     </div>
//                   </div>
//                   <div className={styles.innerWrapper}>
//                     <h3 className={styles.prodCellWrapper}>Product</h3>
//                     <div className={styles.areadiv}>
//                       <h3 className={styles.stateCellWrapper}>State</h3>
//                       <h3 className={styles.districtCellWrapper}>District</h3>
//                     </div>
//                   </div> */}
//                   {areaList?.map((place, i) => (
//                     <div key={i} className={styles.innerWrapper}>
//                       <span
//                         // style={{ fontSize: "10px", fontWeight: "700" }}
//                         className={styles.prodCellWrapper}
//                       >
//                         {place.productName}
//                       </span>

//                       {place.region.map((area, idx) => (
//                         <div className={styles.areadiv}>
//                           <span className={styles.stateCellWrapper}>
//                             {area.stateName}{" "}
//                             <sup className={styles.distnotify}>
//                               {area.totalCnt}
//                             </sup>
//                           </span>
//                           <span className={styles.districtCellWrapper}>
//                             <div className={styles.districtCell}>
//                               {area?.districts?.slice(0, 10)?.map((item, j) => (
//                                 <span key={j} className={styles.districtItem}>
//                                   {item.districtName}
//                                   <sup className={styles.distnotify}>
//                                     {item.totalDistCnt}
//                                   </sup>
//                                   {" ,  "}
//                                 </span>
//                               ))}
//                             </div>

//                             <div className={styles.distbox}>
//                               {area?.districts?.map((dist, k) => (
//                                 <span key={k} className={styles.distboxItem}>
//                                   {dist.districtName}
//                                   <sup className={styles.distnotify}>
//                                     {dist.totalDistCnt}
//                                   </sup>
//                                   {", "}
//                                 </span>
//                               ))}
//                             </div>
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ))}
//                   {/* <table>

//                     <tbody>
//                   {areaList?.area?.map((state, i) => (
//                     <tr key={i} className={styles.region}>
//                       <td>
//                         {state.stateName}{" "}
//                         <sup className={styles.distnotify}>
//                           {state.totalCnt}
//                         </sup>
//                       </td>
//                       <td className={styles.districtCellWrapper}>
//                         <div className={styles.districtCell}>
//                           {state?.district?.map((item, j) => (
//                             <span key={j} className={styles.districtItem}>
//                               {item.districtName}
//                               <sup className={styles.distnotify}>
//                                 {item.totalDistCnt}
//                               </sup>
//                               {" ,  "}
//                             </span>
//                           ))}
//                         </div>

//                         <div className={styles.distbox}>
//                           {state?.district?.map((dist, k) => (
//                             <span key={k}>
//                               {dist.districtName}
//                               <sup className={styles.distnotify}>
//                                 {dist.totalDistCnt}
//                               </sup>
//                               {", "}
//                             </span>
//                           ))}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                     </tbody>
//                   </table> */}
//                   {/* <div className={styles.region}>
//                     <strong>State</strong>
//                     <strong>District</strong>
//                   </div>
//                   {areaList?.area?.map((state, i) => (
//                     <div key={i} className={styles.region}>
//                       <div>
//                         {state.stateName}{" "}
//                         <sup className={styles.distnotify}>
//                           {state.totalCnt}
//                         </sup>
//                       </div>
//                       <div className={styles.districtCellWrapper}>
//                         <div className={styles.districtCell}>
//                           {state?.district?.map((item, j) => (
//                             <span key={j} className={styles.districtItem}>
//                               {item.districtName}
//                               <sup className={styles.distnotify}>
//                                 {item.totalDistCnt}
//                               </sup>
//                               {" ,  "}
//                             </span>
//                           ))}
//                         </div>

//                         <div className={styles.distbox}>
//                           {state?.district?.map((dist, k) => (
//                             <span key={k}>
//                               {dist.districtName}
//                               <sup className={styles.distnotify}>
//                                 {dist.totalDistCnt}
//                               </sup>
//                               {", "}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))} */}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default QuickTeritoryFlash;
