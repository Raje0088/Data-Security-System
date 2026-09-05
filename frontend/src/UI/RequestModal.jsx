import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./RequestModal.module.css";
import { IoMdClose } from "react-icons/io";
import { useContext } from "react";
import { RequestModalContext } from "../context-api/GlobalModalContext";

const RequestModal = () => {
  const { modalContent, handleOpenModal, handleCloseModal } =
    useContext(RequestModalContext);
  // console.log("RequestModal render, modalContent =", modalContent);

  if (!modalContent) {
    return null;
  }

  const handleResponse = (status)=>{
    if(modalContent.onResponse){
      modalContent.onResponse(status,modalContent.taskId);
    }
    handleCloseModal()
  }
  return ReactDOM.createPortal(
    <div className={styles.main}>
      <div
        className={styles.content}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header>
          <IoMdClose className={styles.icon} onClick={handleCloseModal} />
        </header>
        <div className={styles.modalbody}>
          <p>{modalContent.msg1}</p>
          <p>{modalContent.msg2}</p>
        </div>
        <div className={styles.btndiv}>
          <button onClick={()=>{handleResponse("Accept")}}>Accept</button>
          <button onClick={()=>{handleResponse("Reject")}}>Reject</button>
        </div>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default RequestModal;
