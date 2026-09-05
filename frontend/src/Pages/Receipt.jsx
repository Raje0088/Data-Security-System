import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import styles from "./Receipt.module.css";

const Receipt = () => {
  const receiptRef = useRef();
  const { state } = useLocation();
  const paymentReceiptList = state?.paymentData;
  const heading = state?.label;
  console.log("yo yo", paymentReceiptList);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  return (
    <div className={styles.main}>
      <div className={styles.receipt} ref={receiptRef}>
        <div className={styles.heading}>
          <h2>{heading}</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Date And Time</th>
                <th>Client Id</th>
                <th>Client Name</th>
                <th>Product</th>
                <th>Final Price</th>
                <th>Extra Charges</th>
                <th>Total Amount</th>
                <th>New Amount</th>
                <th>Paid Amount</th>
                <th>Balance Amount</th>
                <th>Gst %</th>
                <th>Reference Id</th>
                <th>Mode Of Payment</th>
                <th>User Id</th>
              </tr>
            </thead>
            <tbody>
              {paymentReceiptList.map((item, idx) => (
                <tr>
                  <td>{idx + 1}</td>
                  <td>
                    {item.updatedAt.split("T")[0]}{" "}
                    {item.updatedAt.split("T")[1].split(".")[0]}
                  </td>
                  <td>{item.client_id}</td>
                  <td>{item.client_name_db}</td>
                  <td>{item.product_db}</td>
                  <td>{item.finalCost_db}</td>
                  <td>{item.extraCharges_db}</td>
                  <td>{item.totalAmount_db}</td>
                  <td>{item.newAmount_db}</td>
                  <td>{item.paidAmount_db}</td>
                  <td>{item.balanceAmount_db}</td>
                  <td>{item.gst_db}</td>
                  <td>{item.referenceId_db}</td>
                  <td>{item.mode_db}</td>
                  <td>{item.userId_db}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.btndiv}>
        <button onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
};

export default Receipt;
