import React, { useState, useEffect } from "react";
import { LuCirclePlus } from "react-icons/lu";
import { TiDeleteOutline } from "react-icons/ti";
import "./AddField.css";
import WhatApp from "../Message/WhatApp.jsx";

const AddField = ({
  initialLabel = "Number",
  fieldType = "text",
  onChange,
  initialFields = [],
  userProduct,
  clientObj
}) => {
  const [fields, setFields] = useState(
    Array.isArray(initialFields) && initialFields.length > 0
      ? initialFields
      : [{ label: initialLabel, value: "" }]
  );

  useEffect(() => {
    if (Array.isArray(initialFields) && initialFields.length > 0) {
      setFields(initialFields);
    }
  }, [initialFields]);

  const handleChange = (index, value) => {
    const updated = [...fields];
    updated[index].value = value;
    setFields(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleAddInput = () => {
    const nextLabel = generateLabel(initialLabel, fields.length);
    setFields([...fields, { label: nextLabel, value: "" }]);
  };

  const handleRemoveInput = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const generateLabel = (baseLabel = "", index) => {
    if (baseLabel.toLowerCase().includes("address")) {
      return `Address ${index + 1}`;
    }
    if (baseLabel.toLowerCase().includes("email")) {
      return `Email ${index + 1}`;
    }
    if (baseLabel.toLowerCase().includes("text")) {
      return `${baseLabel} ${index + 1}`;
    }
    if (index === 1 && baseLabel.toLowerCase().includes("number")) {
      return `Secondary Number`;
    } else if (index === 2 && baseLabel.toLowerCase().includes("number")) {
      return `Tertiary Number`;
    } else if (index === 3 && baseLabel.toLowerCase().includes("number")) {
      return `Quaternary Number`;
    } else {
      return `${baseLabel} ${index + 1}`;
    }
  };
  return (
    <span className="plus-main">
      {fields.map((field, index) => (
        <div className={`${fieldType === "number" ? "sections" : ""} `}>
          <span
            className={`${
              fields.length > 2 ? "add-input-resize" : "add-input-resize"
            }`}
            key={index}
          >
            <span className="plus">
              <label>{field.label}</label>
              {index === fields.length - 1 && fields.length < 3 && (
                <LuCirclePlus
                  style={{ fontSize: "17px", cursor: "pointer" }}
                  onClick={() => {
                    handleAddInput();
                  }}
                />
              )}
            </span>
            <span className="content-div">
              <span className="add-input-inner">
                {initialLabel !== "Address 1" ? (
                  <>
                    <input
                      type={fieldType}
                      value={field.value}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  </>
                ) : (
                  <textarea
                    value={field.value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="text-area"
                  ></textarea>
                )}
                {fields.length !== 1 && index !== 0 && (
                  <TiDeleteOutline
                    style={{ fontSize: "20px", cursor: "pointer" }}
                    onClick={() => handleRemoveInput(index)}
                  />
                )}
              </span>
            </span>
          </span>
          {fieldType === "number" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                gap: "5px",
              }}
            >
              {/* <WhatApp /> */}
              <WhatApp userProduct={userProduct} clientObj={{...clientObj,clientNumber:fields[index]?.value}} />
            </div>
          )}
        </div>
      ))}
    </span>
  );
};

export default AddField;
