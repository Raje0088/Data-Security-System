import React, { useState, useEffect } from "react";
import styles from "./SwitchToggle.module.css";

const SwitchToggle = ({setVerifiedByEmploye}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
      setIsChecked(!isChecked);
      setVerifiedByEmploye(!isChecked)
    };

  return (
      <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <div className={styles.lever}></div>
      </label>
  );
};

export default SwitchToggle;
