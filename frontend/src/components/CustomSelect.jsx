import React, { useState, useEffect, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
// import "./CustomSelect.css";
import styles from "./CustomSelect.module.css";

const CustomSelect = ({
  options = [],
  placeholder = "Select Options",
  onChange,
  value = [],
  isMulti = true,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const handleOutsideClose = useRef(null);
  useEffect(() => {
    const handleClose = (e) => {
      if (
        handleOutsideClose.current &&
        !handleOutsideClose.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClose);

    return () => {
      document.removeEventListener("mousedown", handleClose);
    };
  }, []);

  useEffect(() => {
    const normalized = Array.isArray(value) ? value : value ? [value] : [];

    if (JSON.stringify(normalized) !== JSON.stringify(selectedOptions)) {
      setSelectedOptions(normalized);
    }
  }, [value, isMulti]);
  // useEffect(() => {
  //   if (JSON.stringify(value) !== JSON.stringify(selectedOptions)) {
  //     setSelectedOptions(value || (isMulti ? [] : null));
  //   }
  // }, [value, isMulti]);

  function toggleDropdown() {
    setIsOpen(!isOpen);

    if (!isOpen && handleOutsideClose.current) {
      const rect = handleOutsideClose.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 200;
      setOpenUpward(spaceBelow < dropdownHeight);
    }
  }

  const handleCheckboxChange = (option) => {
    let isSelected;

    if (isMulti) {
      isSelected =
        Array.isArray(selectedOptions) &&
        selectedOptions.some((item) => item.value === option.value);
    } else {
      isSelected =
        Array.isArray(selectedOptions) &&
        selectedOptions[0]?.value === option.value;
    }

    let updated;
    if (isMulti) {
      updated = isSelected
        ? selectedOptions.filter((item) => item.value !== option.value)
        : [...selectedOptions, option];
    } else {
      updated = isSelected ? [] : [option];
      setIsOpen(false);
    }

    setSelectedOptions(updated);
    if (onChange) onChange(updated);
  };

  const isOptionSelected = (option) => {
    if (isMulti) {
      return (
        Array.isArray(selectedOptions) &&
        selectedOptions.some((item) => item.value === option.value)
      );
    } else {
      return (
        Array.isArray(selectedOptions) &&
        selectedOptions[0]?.value === option.value
      );
    }
  };

  return (
    <div className={styles.main} ref={handleOutsideClose}>
      <div className={styles["dropdown-header"]} onClick={toggleDropdown}>
        <div className={styles["dropdown-select"]}>
          {isMulti
            ? selectedOptions.length > 0
              ? `${selectedOptions.length} Option Selected`
              : `-- ${placeholder} --`
            : selectedOptions[0]?.label
            ? selectedOptions[0].label
            : `-- ${placeholder} --`}
        </div>

        <div className={styles["dropdown-icon"]}>
          {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>
      {isOpen && (
        <div
          className={`${styles["dropdown-list"]} ${
            openUpward ? styles["upward"] : ""
          }`}
        >
          {options.map((option, index) => (
            <div
              key={option.value || index}
              className={styles["dropdown-content"]}
              style={{
                backgroundColor: isOptionSelected(option)
                  ? "#b4ecff"
                  : "transparent",
              }}
              onClick={() => handleCheckboxChange(option)} // ✅ whole div clickable
            >
              <div className={styles.checkboxdiv}>
                <input
                  type="checkbox"
                  checked={isOptionSelected(option)}
                  readOnly // ✅ prevents double toggle
                />
                <span>{option.label || option.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    /* {options.map((option, index) => (
            <span key={index} onClick={() => handleCheckboxChange(option)}>
              <div
                className={styles["dropdown-content"]}
                key={option.value || index}
                style={{
                  backgroundColor: isOptionSelected(option)
                    ? "#b4ecff"
                    : "transparent",
                }}
              >
                {isMulti && (
                  <input
                    type="checkbox"
                    checked={isOptionSelected(option)}
                    onChange={() => handleCheckboxChange(option)}
                    // onClick={(e) => e.stopPropagation()}
                  />
                )}
                &nbsp;&nbsp;{option.label || option.value}
              </div>
            </span>
          ))} */

    // <div className="dropdown-container" ref={handleOutsideClose}>
    //   <div className="dropdown-header" onClick={toggleDropdown}>
    //     <div className="dropdown-select">
    //       {isMulti
    //         ? selectedOptions.length > 0
    //           ? `${selectedOptions.length} Option Selected`
    //           : `-- ${placeholder} --`
    //         : selectedOptions && selectedOptions.label
    //         ? selectedOptions.label
    //         : `-- ${placeholder} --`}
    //     </div>

    //     <div className="dropdown-icon">
    //       {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
    //     </div>
    //   </div>
    //   {isOpen && (
    //     <div className={`dropdown-list ${openUpward ? "upward" : ""}`} >
    //       {options.map((option, index) => (
    //         <span key={index} onClick={() => handleCheckboxChange(option)}>
    //           <div
    //             className="dropdown-content"
    //             key={option.value || index}
    //             style={{
    //               backgroundColor: isOptionSelected(option)
    //                 ? "#A3D39C"
    //                 : "transparent",
    //             }}
    //           >
    //             {isMulti && (
    //               <input
    //                 type="checkbox"
    //                 checked={isOptionSelected(option)}
    //                 onChange={() => handleCheckboxChange(option)}
    //                 // onClick={(e) => e.stopPropagation()}
    //               />
    //             )}
    //             &nbsp;&nbsp;{option.label || option.value}
    //           </div>
    //         </span>
    //       ))}
    //     </div>
    //   )}
    // </div>
  );
};

export default CustomSelect;
