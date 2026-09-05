import React, { useState, useEffect } from "react";
import styles from "./MessageModal.module.css";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { base_url } from "../../config/config";
import MessagePortal from "../../UI/MessagePortal";
const MessageModal = ({ openModal, onClose }) => {
  const [refresh, setRefresh] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [template, setTemplate] = useState({
    templateName: "",
    templateId: "",
    product: "",
    body: "",
  });
  const [userProductList, setUserProductList] = useState([]);
  const [getMsgList, setGetMsgList] = useState([]);
  //FETCHING USER PRODUCTLIST
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const result = await axios.get(`${base_url}/msg/get-template`);
        setGetMsgList(result.data.result);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetchTemplate();
  }, [refresh]);

  useEffect(() => {
    const fetch = async () => {
      try {
        let productsList, result;
        result = await axios.get(`${base_url}/setting/get-superadmin-product`);
        productsList = result?.data?.result?.map(
          (prod) => prod.assign_product_name
        );
        setUserProductList(productsList);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetch();
  }, []);

  const handleTemplateChange = (name, value) => {
    setTemplate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleTemplateId = (item) => {
    setSelectedTemplateId(item._id);
    setTemplate((prev) => ({
      ...prev,

      templateName: item.templateName_db,
      templateId: item.templateId_db,
      product: item.product_db,
      body: item.body_db,
    }));
  };
  const handleSaveTemplate = async () => {
    if (!template.templateName || !template.product || !template.body)
      return setMsg("Fields must required");
    try {
      const result = await axios.post(`${base_url}/msg/save-template`, {
        ...template,
      });
      setMsg(result.data.message);
      setRefresh((p) => !p);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleUpdateTemplate = async () => {
    if (!selectedTemplateId) return setMsg("Please select Template to update");
    try {
      const result = await axios.put(
        `${base_url}/msg/update-template/${selectedTemplateId}`,
        {
          ...template,
        }
      );
      console.log("result", result);
      setMsg(result.data.message);
      setRefresh((p) => !p);
      setSelectedTemplateId(null);
      handleResetTemplate();
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return setMsg("Please select Template to delete");
    try {
      const result = await axios.delete(
        `${base_url}/msg/delete-template/${selectedTemplateId}`
      );
      setRefresh((p) => !p);
      setMsg(result.data.message);
      setSelectedTemplateId(null);
      handleResetTemplate();
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleResetTemplate = () => {
    setTemplate({
      templateName: "",
      templateId: "",
      product: "",
      body: "",
    });
    setSelectedTemplateId(null);
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <span className={styles.tab}>
          <IoClose onClick={onClose} className={styles.icon} />
        </span>
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
          <div className={styles.leftcontent}>
            <span>Template</span>
          </div>
          <div className={styles.rightcontent}>
            <div>
              <h2>Create Template</h2>
              <div className={styles.box}>
                <div className={styles["template-box"]}>
                  <span>
                    <input
                      type="text"
                      placeholder="Template Name"
                      value={template.templateName}
                      onChange={(e) => {
                        handleTemplateChange("templateName", e.target.value);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Template ID"
                      value={template.templateId}
                      onChange={(e) => {
                        handleTemplateChange("templateId", e.target.value);
                      }}
                    />
                    <select
                      name=""
                      id=""
                      value={template.product}
                      onChange={(e) => {
                        handleTemplateChange("product", e.target.value);
                      }}
                    >
                      <option>--Select--</option>
                      {userProductList.map((item, idx) => (
                        <option value={item} key={idx}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span style={{ flex: "1" }}>
                    <textarea
                      placeholder="Enter Message"
                      value={template.body}
                      onChange={(e) => {
                        handleTemplateChange("body", e.target.value);
                      }}
                    ></textarea>
                  </span>
                </div>
                <div className={styles.btndiv}>
                  <button
                    onClick={() => {
                      handleSaveTemplate();
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateTemplate();
                    }}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteTemplate();
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      handleResetTemplate();
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            <div className={styles["template-body"]}>
              <span className={styles["template-header"]}>
                <p>Sr No.</p>
                <p>Template Name</p>
                <p>Template ID</p>
                <p>Product</p>
                <p>Body</p>
              </span>
              {getMsgList.length > 0 ? (
                getMsgList.map((item, idx) => (
                  <span
                    onClick={() => {
                      handleTemplateId(item);
                    }}
                    className={styles["template-content"]}
                  >
                    <p>{idx + 1}</p>
                    <p>{item.templateName_db}</p>
                    <p>{item.templateId_db}</p>
                    <p>{item.product_db}</p>
                    <p >{item.body_db}</p>
                  </span>
                ))
              ) : (
                <div style={{color:"black", textAlign:"center",padding:"20px",fontWeight:"700"}}>No template Found</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {msg && (
        <MessagePortal
          message1={msg}
          onClose={() => {
            setMsg("");
          }}
        />
      )}
    </div>
  );
};

export default MessageModal;
