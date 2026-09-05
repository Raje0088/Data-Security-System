import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Register from "../components/Register.jsx";
import Setting from "../components/Setting.jsx";
import UserPage from "../components/UserPage/UserPage.jsx";
import ExecutiveDashboard from "../components/Dashboard/Executive/ExecutiveDashboard.jsx";
import SuperAdminDashboard from "../components/Dashboard/SuperAdmin/SuperAdminDashboard.jsx";
import ProgressReport from "../components/UserReport/ProgressReport.jsx";
import SearchClient from "./SearchClient.jsx";
import ClientPage from "../components/ClientPage/ClientPage.jsx";
import AdminDashboard from "../components/Dashboard/Admin/AdminDashboard.jsx";
import styles from "./HomeNavigator.module.css";
import { FaHome } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { FaRegistered } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { FaSearchengin } from "react-icons/fa6";
import { GrUserAdmin } from "react-icons/gr";
import { FaUsers } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { FaUserCog } from "react-icons/fa";
import { SiLibreofficewriter } from "react-icons/si";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../context-api/AuthContext.jsx";
import { useContext } from "react";
import axios from "axios";
import { base_url } from "../config/config.js";
import { RequestModalContext } from "../context-api/GlobalModalContext.jsx";
import { setSelectedData, setField, resetAll } from "../redux/Redux";
import { useSelector, useDispatch } from "react-redux";

const HomeNavigator = () => {
  const { userLoginId, setUserLoginId } = useContext(AuthContext);
  const dispatch = useDispatch();
  const {socketOnline} = useContext(RequestModalContext)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rel, setRel] = useState({ x: 0, y: 0 }); // <-- initialize with defaults
  const nodeRef = useRef(null);

  const [isDrag, setIsDrag] = useState(false); 
  const [toggleOpen, setToggleOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await axios.post(
        `${base_url}/auth/logout`,
        {
          userLoginId: userLoginId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`${userLoginId?.userId} logout successfully`, result);
      setUserLoginId(null);
    } catch (err) {
      console.log("internal error", err);
    }
    navigate("/login");
  };

  const handleToggle = () => {
    setToggleOpen((prev) => !prev);
  };

  const startDrag = (e) => {
    if (e.button !== 0) return;
    setIsDrag(true);

    const rect = nodeRef.current.getBoundingClientRect();
    setRel({
      x: e.pageX - rect.left,
      y: e.pageY - rect.top,
    });
  };
  const doDrag = (e) => {
    if (!isDrag || !nodeRef.current) return;

    const element = nodeRef.current;
    const rect = element.getBoundingClientRect();

    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    // Clamp X and Y
    const newX = Math.max(0, Math.min(e.pageX - rel.x, maxX));
    const newY = Math.max(0, Math.min(e.pageY - rel.y, maxY));

    setPos({ x: newX, y: newY });
  };

  const stopDrag = (e) => {
    setIsDrag(false);
  };

  useEffect(() => {
    if (isDrag) {
      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    } else {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    }

    return () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };
  }, [isDrag]);

  return (
    <div
    onClick={()=>{dispatch(resetAll())}}
      className={`${styles.home} ${styles.nodrag}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        cursor: "move",
        position: "absolute",
        display:userLoginId ? "" : "none",
      }}
      ref={nodeRef}
      onMouseDown={startDrag}
    >
      {toggleOpen ? (
        <h2>
          <FaEye
            className={styles.icon}
            onClick={handleToggle}
            style={{ color:socketOnline ? "#06c525" : "red" }}
          />
        </h2>
      ) : (
        <h2>
          <FaEyeSlash
            className={styles.icon}
            onClick={handleToggle}
            style={{ color:socketOnline ? "#06c525" : "red" }}
          />
        </h2>
      )}
      {toggleOpen === true ? (
        <>
          {" "}
          {userLoginId?.roleType === "Superadmin" && (
            <Link to="/" element={<SuperAdminDashboard />}>
              <h2>
                <FaHome className={styles.icon} title="Superadmin Dashboard" />
              </h2>
            </Link>
          )}
          {userLoginId?.roleType === "Admin" && (
            <Link to="/admin-dashboard" element={<AdminDashboard />}>
              <h2>
                <FaHome className={styles.icon} title="Admin Dashboard" />
              </h2>
            </Link>
          )}
          {userLoginId?.roleType === "Executive" && (
            <Link to="/user-dashboard" element={<ExecutiveDashboard />}>
              <h2>
                <FaHome className={styles.icon} title="User Dashboard" />
              </h2>
            </Link>
          )}
          {userLoginId?.roleType === "Superadmin" && (
            <Link to="/register" element={<Register />}>
              <h2>
                <FaRegistered className={styles.icon} title="Add User" />
              </h2>
            </Link>
          )}
          {userLoginId?.roleType === "Superadmin" && (
            <Link to="/setting" element={<Setting />}>
              <h2>
                <IoSettings className={styles.icon} title="Setting" />
              </h2>
            </Link>
          )}
          <span id={styles.form}>
            <h2>
              <SiLibreofficewriter
                className={styles.icon}
                title="Client Form"
              />
            </h2>
            <div className={styles.formdiv}>
              <Link to="/client-page" element={<ClientPage />}>
                <h4>Client Form</h4>
              </Link>
              <Link to="/userpage" element={<UserPage />}>
                <h4>User Form</h4>
              </Link>
            </div>
          </span>
          <Link to="/progress" element={<ProgressReport />}>
            <h2>
              <FaUserCog className={styles.icon} title="User Progress" />
            </h2>
          </Link>
          <Link to="/search-client" element={<SearchClient />}>
            <h2>
              <FaSearchengin className={styles.icon} title="Search" />
            </h2>
          </Link>
          <h2>
            <RiLogoutCircleRLine
              className={styles.icon}
              title="Logout"
              style={{ color: "red" }}
              onClick={handleLogout}
            />
          </h2>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default HomeNavigator;
