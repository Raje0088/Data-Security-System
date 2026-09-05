import React, { useState, useContext } from "react";
import { FaWhatsappSquare } from "react-icons/fa";
import styles from "./WhatApp.module.css";
import axios from "axios";
import { base_url } from "../../config/config";
import { AuthContext } from "../../context-api/AuthContext";

const WhatApp = ({ userProduct, clientObj }) => {
  const { userLoginId } = useContext(AuthContext);
  const [showTemplateList, setShowTemplateList] = useState([]);
  const [showProduct, setShowProduct] = useState(false);
  const [productSelector, setProductSelector] = useState("");
  const userMobile = 7723015592;

// FETCH TEMPLATE PRODUCTWISE [DONE]
  const handleOpenPopup = async (product) => {
    try {
      const result = await axios.get(
        `${base_url}/msg/get-prod-template/${product}`
      );
      const template = result.data.result;
      setShowTemplateList(template);
      setProductSelector(product);
      productSelector("");
    } catch (err) {
      console.log("internal error", err);
    }
  };

  //SEND MESSAGE ON WHATAPP [DONE]
  const handleSendMessage = (template) => {
    if (!clientObj.clientNumber) return alert("Please enter whatapp number");
    try {
      const values = {
        clientName: `${clientObj.name} ` || "Sir/Ma'am",
        mobile: userMobile || "",
      };

      const fillMessage = template.body_db.replace(
        /\$\{(.*?)\}/g,
        (match, p1) => {
          return values[p1] !== undefined ? values[p1] : "";
        }
      );

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const url = isMobile
        ? `https://wa.me/91${clientObj.clientNumber}?text=` +
          encodeURIComponent(fillMessage)
        : `https://web.whatsapp.com/send?phone=91${
            clientObj.clientNumber
          }&text=${encodeURIComponent(fillMessage)}`;

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setShowProduct(false);
      setShowTemplateList([]);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  return (
    <div className={styles.main}>
      {showProduct && (
        <div className={styles["product-popup"]}>
          {userProduct.map((tem, idx) => (
            <p
              key={idx}
              style={
                tem.label === productSelector
                  ? { backgroundColor: "rgba(78, 191, 243, 0.582)" }
                  : {}
              }
              onClick={() => handleOpenPopup(tem.label)}
            >
              {tem.label}
            </p>
          ))}

          <div className={styles["template-popup"]}>
            {showTemplateList.map((tem, idx) => (
              <p
                onClick={() => {
                  handleSendMessage(tem);
                }}
              >
                {tem.templateName_db}
              </p>
            ))}
          </div>
        </div>
      )}

      <FaWhatsappSquare
        onClick={() => {
          setShowProduct((prev) => !prev);
        }}
        className={styles.icon}
      />
    </div>
  );
};

export default WhatApp;
