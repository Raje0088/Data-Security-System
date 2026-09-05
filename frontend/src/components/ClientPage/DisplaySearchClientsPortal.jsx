import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { IoMdClose } from "react-icons/io";
import styles from "./DisplaySearchClientsPortal.module.css";
import { useContext } from "react";
import { AuthContext } from "../../context-api/AuthContext";

const DisplaySearchClientsPortal = ({
  onAllSearchClientData,
  onClose,
  onClientIdClick,
}) => {
  const { userLoginId } = useContext(AuthContext);
  const handleClose = useRef();
  const [itemPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.max(
    1,
    Math.ceil(onAllSearchClientData.totalCount / itemPerPage)
  );

  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const paginateAllSearchData = (onAllSearchClientData.result || []).slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  console.log("paginate", paginateAllSearchData);
  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPage));
  };
  const goToPrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    const handleOutsideClose = (e) => {
      if (handleClose.current && !handleClose.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClose);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClose);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.content} ref={handleClose}>
        <span>
          <IoMdClose
            style={{ fontSize: "30px", background: "white", color: "red" }}
            onClick={onClose}
          />
        </span>
        <div className={styles.header}>
          <h2>Total client {onAllSearchClientData.totalCount}</h2>
        </div>
        {onAllSearchClientData.totalCount > 0 ? (
          <div className={styles["table-wrapper"]}>
            <table className={styles.tables}>
              <thead>
                <tr>
                  <th>SrNo</th>
                  <th>Client Id</th>
                  <th>Name</th>
                  <th>Business Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>District</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {paginateAllSearchData.map((data, idx) => (
                  <tr key={idx}>
                    <td>{data.client_serial_no_id}</td>
                    <td
                      onClick={
                        (data.isView === true ||
                        userLoginId?.userId === "SA")
                          ? () => {
                              onClientIdClick(data.client_id);
                              onClose();
                            }
                          : undefined
                      }
                    >
                      <strong style={{ cursor: "pointer" }}>
                        {data.client_id}
                      </strong>
                    </td>
                    <td>{data.client_name_db}</td>
                    <td>{data.optical_name1_db}</td>
                    <td
                      className={
                       ( !data.isView && userLoginId?.userId !== "SA")
                          ? styles.blur
                          : ""
                      }
                    >
                      {data.mobile_1_db}
                    </td>
                    <td
                          className={
                       ( !data.isView && userLoginId?.userId !== "SA")
                          ? styles.blur
                          : ""
                      }
                    >
                      {data.email_1_db}
                    </td>
                    <td
                       className={
                       ( !data.isView && userLoginId?.userId !== "SA")
                          ? styles.blur
                          : ""
                      }
                    >
                      {data.address_1_db}
                    </td>
                    <td>{data.district_db}</td>
                    <td>{data.state_db}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={styles["table-wrapper"]}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
            }}
          >
            No Record Found In CLIENT DB
          </div>
        )}
        <div className={styles.btn}>
          <button onClick={goToPrev} disabled={currentPage === 1}>
            Prev
          </button>
          <p>
            Pages of {currentPage} / {totalPage}
          </p>
          <span></span>
          <button onClick={goToNext} disabled={totalPage === currentPage}>
            Next
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default DisplaySearchClientsPortal;
