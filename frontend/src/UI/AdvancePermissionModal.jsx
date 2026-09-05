import React, { useState, useEffect } from "react";
import styles from "./AdvancePermissionModal.module.css";
import { createPortal } from "react-dom";
import CustomSelect from "../components/CustomSelect";
import axios from "axios";
import { base_url } from "../config/config";

const AdvancePermissionModal = ({
  openModal,
  selectAssignProduct,
  onClose,
  onSetPermissionData,
  onGetProductWisePermission,
}) => {
  if (!openModal) return;
  console.log("getProductWisePermission", onGetProductWisePermission);
  const [formData, setFormData] = useState(
    selectAssignProduct.map((item, idx) => ({
      productId: item.value,
      productName: item.label,
      permission: {
        update_P: false,
        delete_P: false,
        edit_P: false,
        view_P: false,
      },
      region: [],
    }))
  );
  console.log("dat==============", formData);
  const [selectedStateArray, setSelectedStateArray] = useState([]);
  const [selectedDistrictsArray, setSelectedDistrictsArray] = useState([]);

  // These are arrays of products — each product has its own selection
  const [selectedState, setSelectedState] = useState(
    selectAssignProduct.map(() => [])
  );
  const [selectedDistricts, setSelectedDistricts] = useState(
    selectAssignProduct.map(() => [])
  );
  const [selectedPincode, setSelectedPincode] = useState(
    selectAssignProduct.map(() => [])
  );

  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [districtOptionsByProduct, setDistrictOptionsByProduct] = useState({});
  const [pincodeOptionsByProduct, setPincodeOptionsByProduct] = useState({});
  console.log("pincode===========", selectedPincode);
  useEffect(() => {
    const fetchStates = async () => {
      const result = await axios.post(`${base_url}/pincode/filter-area`, {
        stateArray: selectedStateArray,
        districtArray: selectedDistrictsArray,
      });
      console.log("----------------------", result.data);
      setStateOptions(
        result.data?.stateList?.map((s) => ({
          label: s,
          value: s,
        }))
      );
    };

    fetchStates();
  }, []);

useEffect(() => {
  if (!onGetProductWisePermission || onGetProductWisePermission.length === 0) return;

  const stateData = [];
  const districtData = [];
  const pincodeData = [];

  const stateOptionsArr = [];
  const districtOptionsObj = {};
  const pincodeOptionsObj = [];

  // Make sure formData exists for all products
  setFormData(prev => {
    const updated = onGetProductWisePermission.map(p => ({
      ...p,
      region: p.region?.map(r => ({
        stateName: r.stateName,
        districts: r.districts?.map(d => ({
          districtName: d.districtName,
          pincodes: d.pincodes || []
        })) || []
      })) || []
    }));
    return updated;
  });

  onGetProductWisePermission.forEach((product, prodIdx) => {
    const regions = product.region || [];

    const selectedStates = [];
    const districtsByProduct = [];
    const pincodesByProduct = [];

    const districtOptionsForProduct = [];
    const pincodeOptionsForProduct = [];

    regions.forEach(region => {
      const stateName = region.stateName || "";

      // ----- STATES -----
      const stateOption = { label: stateName, value: stateName };
      selectedStates.push(stateOption);
      stateOptionsArr.push(stateOption);

      // ----- DISTRICTS -----
      const districtOptions = (region.districts || []).map(d => ({
        label: d.districtName,
        value: `${stateName}:${d.districtName}`
      }));
      districtsByProduct.push(...districtOptions);
      districtOptionsForProduct.push(...districtOptions);

      // ----- PINCODES -----
      const pincodeOptions = (region.districts || []).flatMap(d =>
        (d.pincodes || []).map(p => ({
          label: `${p.code}__${d.districtName}`,
          value: `${stateName}:${d.districtName}:${p.code}`
        }))
      );
      pincodesByProduct.push(...pincodeOptions);
      pincodeOptionsForProduct.push(...pincodeOptions);
    });

    stateData[prodIdx] = selectedStates;
    districtData[prodIdx] = districtsByProduct;
    pincodeData[prodIdx] = pincodesByProduct;

    districtOptionsObj[prodIdx] = districtOptionsForProduct;
    pincodeOptionsObj[prodIdx] = pincodeOptionsForProduct;
  });

  setSelectedState(stateData);
  setSelectedDistricts(districtData);
  setSelectedPincode(pincodeData);

  setStateOptions(stateOptionsArr);
  setDistrictOptionsByProduct(districtOptionsObj);
  setPincodeOptionsByProduct(pincodeOptionsObj);

}, [onGetProductWisePermission]);



  const permissionChecked = (e, name, prodIdx) => {
    const isChecked = e.target.checked;
    setFormData((prev) => {
      const updated = [...prev];
      updated[prodIdx] = {
        ...updated[prodIdx],
        permission: {
          ...updated[prodIdx].permission,
          [name]: isChecked,
        },
      };
      return updated;
    });
  }; 
  console.log("formdata", formData);

  // const handleSelectedState = async (option, prodIdx) => {
  //   const stateNames = option.map((s) => s.label);
  //   console.log("stateName", stateNames);
  //   // UI UPDATE
  //   setSelectedState((prev) => {
  //     const updated = [...prev];
  //     updated[prodIdx] = option;
  //     return updated;
  //   });

  //   // RESET district & pincode UI
  //   setSelectedDistricts((prev) => {
  //     const updated = [...prev];
  //     updated[prodIdx] = [];
  //     return updated;
  //   });

  //   setSelectedPincode((prev) => {
  //     const updated = [...prev];
  //     updated[prodIdx] = [];
  //     return updated;
  //   });

  //   // RESET options
  //   setDistrictOptionsByProduct((prev) => ({
  //     ...prev,
  //     [prodIdx]: [],
  //   }));

  //   setPincodeOptionsByProduct((prev) => ({
  //     ...prev,
  //     [prodIdx]: [],
  //   }));

  //   // UPDATE formData
  //   setFormData((prev) => {
  //     const updated = [...prev];

  //     updated[prodIdx].region = stateNames.map((name) => ({
  //       stateName: name,
  //       districts: [],
  //     }));

  //     return updated;
  //   });

      
  //   // FETCH DISTRICTS FOR THIS PRODUCT
  //   if (stateNames.length > 0) {
  //     const result = await axios.post(`${base_url}/pincode/filter-area`, {
  //       stateArray: stateNames,
  //       districtArray: [],
  //     });

  //     setDistrictOptionsByProduct((prev) => ({
  //       ...prev,
  //       [prodIdx]: result.data?.districtList?.map((d) => ({
  //         label: d.districtName,
  //         value: `${d.stateName}:${d.districtName}`,
  //       })),
  //     }));
  //   }
  // };

  // // ---------------------------------------------
  // // HANDLE DISTRICT CHANGE PER PRODUCT
  // const handleSelectedDistrict = async (option, prodIdx) => {
  //   const districtObjs = option.map((d) => ({
  //     stateName: d.value.split(":")[0],
  //     districtName: d.label,
  //   }));

  //   // UI UPDATE
  //   setSelectedDistricts((prev) => {
  //     const updated = [...prev];
  //     updated[prodIdx] = option;
  //     return updated;
  //   });

  //   // --- if all districts are removed -> clear pinocde options+ selectedPincode + formData pincodes
  //   if(option.length === 0){
  //     setSelectedPincode((prev)=>{
  //       const updated = [...prev];
  //       updated[prodIdx] = [];
  //       return updated;
  //     })

  //     setFormData((prev)=>{
  //       const updated = [...prev];
  //       updated[prodIdx].region.forEach((s)=>{
  //         s.districts.forEach((d)=>{
  //           d.pincodes = []
  //         })
  //       })
  //       return updated;
  //     })

  //     return;
  //   }
  //   // UPDATE formData
  //   setFormData((prev) => {
  //     const updated = [...prev];

  //     const selectedDistrictNames = districtObjs.map(d=> d.districtName);

  //     updated[prodIdx].region.forEach((stateObj)=>{
  //       stateObj.districts = stateObj.districts.filter((dObj)=> 
  //       selectedDistrictNames.includes(dObj.districtName))
  //     })

  //     districtObjs.forEach((dObj) => {
  //       const stateIndex = updated[prodIdx].region.findIndex(
  //         (s) => s.stateName === dObj.stateName
  //       );

  //       if (stateIndex !== -1) {
  //         const districtArr = updated[prodIdx].region[stateIndex].districts;

  //         if (!districtArr.some((d) => d.districtName === dObj.districtName)) {
  //           districtArr.push({
  //             districtName: dObj.districtName,
  //             pincodes: [],
  //           });
  //         }
  //       }
  //     });

  //     return updated;
  //   });

  //   // FETCH PINCODES
  //   const onlyDistrictNames = districtObjs.map((d) => d.districtName);

  //   // console.log("state===============",selectedState[prodIdx].map((item)=>item.label))
  //   const result = await axios.post(`${base_url}/pincode/filter-area`, {
  //     stateArray: selectedState[prodIdx].map((item) => item.label),
  //     districtArray: onlyDistrictNames,
  //   });
  //   console.log("pincode", result.data);

  //   setPincodeOptionsByProduct((prev) => ({
  //     ...prev,
  //     [prodIdx]: result.data?.pincodeList?.map((p) => ({
  //       label: ` ${p.pincode}__${p.districtName}`,
  //       value: `${p.stateName}:${p.districtName}:${p.pincode}`,
  //     })),
  //   }));
  //   setSelectedPincode((prev) => {
  //     const updated = [...prev];
  //     updated[prodIdx] = result.data.pincodeList.map((p) => ({
  //       label: ` ${p.pincode}__${p.districtName}`,
  //       value: `${p.stateName}:${p.districtName}:${p.pincode}`,
  //     }));
  //     return updated;
  //   });

  //   // Also update formData the same way handleSelectedPincode does
  //   setFormData((prev) => {
  //     const updated = [...prev];

  //     result.data.pincodeList.forEach((p) => {
  //       const stateName = p.stateName;
  //       const districtName = p.districtName;
  //       const pincode = p.pincode;

  //       const sIndex = updated[prodIdx].region.findIndex(
  //         (s) => s.stateName === stateName
  //       );

  //       if (sIndex !== -1) {
  //         const dIndex = updated[prodIdx].region[sIndex].districts.findIndex(
  //           (d) => d.districtName === districtName
  //         );

  //         if (dIndex !== -1) {
  //           const pincodeArr =
  //             updated[prodIdx].region[sIndex].districts[dIndex].pincodes;

  //           if (!pincodeArr.some((p) => p.code === pincode)) {
  //             pincodeArr.push({ code: pincode, clientIds: [] });
  //           }
  //         }
  //       }
  //     });

  //     return updated;
  //   });
  // };

  // // ---------------------------------------------
  // // HANDLE PINCODE CHANGE PER PRODUCT
  // const handleSelectedPincode = (option, prodIdx) => {
  //   console.log("opton", option);
  //   const newSelected = option.map((obj) => obj.value);
  //   setSelectedPincode((prev) => {
  //     const updated = [...prev];
  //     updated[prodIdx] = option;
  //     return updated;
  //   });

  //   setFormData((prev) => {
  //     const updated = [...prev];

  //     updated[prodIdx].region.forEach((stateObj) => {
  //       stateObj.districts.forEach((districtObj) => {
  //         districtObj.pincodes = districtObj.pincodes.filter((p) => {
  //           return newSelected.includes(
  //             `${stateObj.stateName}:${districtObj.districtName}:${p.code}`
  //           );
  //         });
  //       });
  //     });

  //     option.forEach((obj) => {
  //       const [stateName, districtName, pincode] = obj.value.split(":");

  //       const sIndex = updated[prodIdx].region.findIndex(
  //         (s) => s.stateName === stateName
  //       );

  //       if (sIndex !== -1) {
  //         const dIndex = updated[prodIdx].region[sIndex].districts.findIndex(
  //           (d) => d.districtName === districtName
  //         );

  //         if (dIndex !== -1) {
  //           const pincodeArr =
  //             updated[prodIdx].region[sIndex].districts[dIndex].pincodes;

  //           const newPin = {
  //             code: pincode,
  //             clientIds: [], // or fill from backend later
  //           };
  //           const exists = pincodeArr.some((p) => p.code === pincode);

  //           if (!exists) pincodeArr.push(newPin);
  //         }
  //       }
  //     });

  //     return updated;
  //   });
  // };

const handleSelectedState = async (option, prodIdx) => {
  const stateNames = option.map(s => s.label);

  // ---- UI update
  setSelectedState(prev => {
    const updated = [...prev];
    updated[prodIdx] = option;
    return updated;
  });

  // Reset selections first
  setSelectedDistricts(prev => {
    const updated = [...prev];
    updated[prodIdx] = [];
    return updated;
  });

  setSelectedPincode(prev => {
    const updated = [...prev];
    updated[prodIdx] = [];
    return updated;
  });

  // Reset options
  setDistrictOptionsByProduct(prev => ({ ...prev, [prodIdx]: [] }));
  setPincodeOptionsByProduct(prev => ({ ...prev, [prodIdx]: [] }));

  // ---- Update formData: clear districts
  setFormData(prev => {
    const updated = [...prev];
    updated[prodIdx].region = stateNames.map(state => ({
      stateName: state,
      districts: []
    }));
    return updated;
  });

  if (stateNames.length === 0) return;

  // ---- Fetch district list
  const result = await axios.post(`${base_url}/pincode/filter-area`, {
    stateArray: stateNames,
    districtArray: []
  });

  const districtOptions = result.data?.districtList?.map(d => ({
    label: d.districtName,
    value: `${d.stateName}:${d.districtName}`
  }));

  // ---- Set district options
  setDistrictOptionsByProduct(prev => ({
    ...prev,
    [prodIdx]: districtOptions
  }));

  // -----------------------------------------------------
  // ✅ AUTO-SELECT ALL DISTRICTS (your requirement)
  // -----------------------------------------------------
  setSelectedDistricts(prev => {
    const updated = [...prev];
    updated[prodIdx] = districtOptions;
    return updated;
  });

  // ---- Update formData with all districts automatically
  setFormData(prev => {
    const updated = [...prev];

    updated[prodIdx].region.forEach(stateObj => {
      // All districts for this state
      const districtsForState = districtOptions
        .filter(d => d.value.split(":")[0] === stateObj.stateName)
        .map(d => ({
          districtName: d.label,
          pincodes: [] // empty for now, pincode selection will fill it
        }));

      stateObj.districts = districtsForState;
    });

    return updated;
  });

  // -----------------------------------------------------
  // OPTIONAL: auto-load pincodes when districts auto-selected
  // -----------------------------------------------------
  // If you want this ALSO, tell me — I can add it.
};

const handleSelectedDistrict = async (option, prodIdx) => {
  const districtObjs = option.map(d => ({
    stateName: d.value.split(":")[0],
    districtName: d.label
  }));

  // ---- UI update
  setSelectedDistricts(prev => {
    const updated = [...prev];
    updated[prodIdx] = option;
    return updated;
  });

  // ---- If district = empty → reset everything
  if (option.length === 0) {
    setSelectedPincode(prev => {
      const updated = [...prev];
      updated[prodIdx] = [];
      return updated;
    });

    setFormData(prev => {
      const updated = [...prev];
      updated[prodIdx].region.forEach(s => {
        s.districts.forEach(d => (d.pincodes = []));
      });
      return updated;
    });

    return;
  }

  // ---- Update formData with district list
  setFormData(prev => {
    const updated = [...prev];
    const selectedDistrictNames = districtObjs.map(d => d.districtName);

    updated[prodIdx].region.forEach(state => {
      state.districts = state.districts.filter(d =>
        selectedDistrictNames.includes(d.districtName)
      );
    });

    districtObjs.forEach(dObj => {
      const stateIndex = updated[prodIdx].region.findIndex(
        s => s.stateName === dObj.stateName
      );

      if (stateIndex !== -1) {
        const districtArr = updated[prodIdx].region[stateIndex].districts;

        if (!districtArr.some(d => d.districtName === dObj.districtName)) {
          districtArr.push({
            districtName: dObj.districtName,
            pincodes: []
          });
        }
      }
    });

    return updated;
  });

  // ---- Fetch pincode list
  const result = await axios.post(`${base_url}/pincode/filter-area`, {
    stateArray: selectedState[prodIdx].map(s => s.label),
    districtArray: districtObjs.map(d => d.districtName)
  });

  const pincodeOptions = result.data?.pincodeList?.map(p => ({
    label: `${p.pincode}__${p.districtName}`,
    value: `${p.stateName}:${p.districtName}:${p.pincode}`
  }));

  setPincodeOptionsByProduct(prev => ({ ...prev, [prodIdx]: pincodeOptions }));

  // Auto-select all pincodes
  setSelectedPincode(prev => {
    const updated = [...prev];
    updated[prodIdx] = pincodeOptions;
    return updated;
  });

  // Update formData with pincode list
  setFormData(prev => {
    const updated = [...prev];

    result.data.pincodeList.forEach(p => {
      const sIndex = updated[prodIdx].region.findIndex(
        s => s.stateName === p.stateName
      );

      const dIndex = updated[prodIdx].region[sIndex].districts.findIndex(
        d => d.districtName === p.districtName
      );

      const arr = updated[prodIdx].region[sIndex].districts[dIndex].pincodes;

      if (!arr.some(x => x.code === p.pincode)) {
        arr.push({ code: p.pincode, clientIds: [] });
      }
    });

    return updated;
  });
};

const handleSelectedPincode = (option, prodIdx) => {
  const pincodeObjs = option.map(p => {
    const [stateName, districtName, pincode] = p.value.split(":");
    return { stateName, districtName, pincode };
  });

  // ---- UI update
  setSelectedPincode(prev => {
    const updated = [...prev];
    updated[prodIdx] = option;
    return updated;
  });

  // ---- Update formData
  setFormData(prev => {
    const updated = [...prev];

    updated[prodIdx].region.forEach(state => {
      state.districts.forEach(district => {
        if (district.pincodes.length > 0) {
          district.pincodes = district.pincodes.filter(p =>
            pincodeObjs.some(
              x =>
                x.stateName === state.stateName &&
                x.districtName === district.districtName &&
                Number(x.pincode) === Number(p.code)
            )
          );
        }
      });
    });

    pincodeObjs.forEach(p => {
      const sIndex = updated[prodIdx].region.findIndex(
        s => s.stateName === p.stateName
      );
      const dIndex = updated[prodIdx].region[sIndex].districts.findIndex(
        d => d.districtName === p.districtName
      );

      const arr = updated[prodIdx].region[sIndex].districts[dIndex].pincodes;

      if (!arr.some(x => x.code === p.pincode)) {
        arr.push({ code: p.pincode, clientIds: [] });
      }
    });

    return updated;
  });
};



  const handleSaveData = () => {
    onSetPermissionData(formData);
    onClose();
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.heading}>
          <h2>Advance Permission</h2>
        </div>
        <div className={styles.body}>
          {selectAssignProduct.map((item, idx) => (
            <div className={styles.bodycontent}>
              <div>
                <h4>
                  Product {idx + 1} : {item.label}
                </h4>
              </div>
              <div>
                <div className={styles.subtitle}>
                  <h4> i. Minor Permission</h4>
                </div>
                <div className={styles["minor-permission"]}>
                  <span className={styles.permission}>
                    <label className="checkbox" htmlFor="">
                      Update
                    </label>
                    <input
                      type="checkbox"
                      checked={!!formData[idx].permission.update_P}
                      onChange={(e) => permissionChecked(e, "update_P", idx)}
                    />
                  </span>

                  {/* <span className={styles.permission}>
                    <label className="checkbox" htmlFor="">
                      Delete
                    </label>
                    <input
                      type="checkbox"
                      checked={!!formData[idx].permission.delete_P}
                      onChange={(e) => permissionChecked(e, "delete_P", idx)}
                    />
                  </span> */}
                  <span className={styles.permission}>
                    <label className="checkbox" htmlFor="">
                      Edit
                    </label>
                    <input
                      type="checkbox"
                      checked={!!formData[idx].permission.edit_P}
                      onChange={(e) => permissionChecked(e, "edit_P", idx)}
                    />
                  </span>
                  <span className={styles.permission}>
                    <label className="checkbox" htmlFor="">
                      View
                    </label>
                    <input
                      type="checkbox"
                      checked={!!formData[idx].permission.view_P}
                      onChange={(e) => permissionChecked(e, "view_P", idx)}
                    />
                  </span>
                </div>
                <div className={styles.subtitle}>
                  <h4> ii. Assign Area</h4>
                </div>
                <div className={styles.area}>
                  <span>
                    <label htmlFor="">State</label>
                    <CustomSelect
                      options={stateOptions}
                      onChange={(selectedOption) =>
                        handleSelectedState(selectedOption, idx)
                      }
                      value={selectedState[idx]}
                    />
                  </span>
                  <span>
                    <label htmlFor="">District</label>
                    <CustomSelect
                      options={districtOptionsByProduct[idx] || []}
                      onChange={(selectedOption) => {
                        handleSelectedDistrict(selectedOption, idx);
                      }}
                      value={selectedDistricts[idx]}
                    />
                  </span>
                  <span>
                    <label htmlFor="">Pincode</label>
                    <CustomSelect
                      options={pincodeOptionsByProduct[idx] || []}
                      onChange={(selectedOption) => {
                        handleSelectedPincode(selectedOption, idx);
                      }}
                      value={selectedPincode[idx]}
                    />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.btndiv}>
          <button
            onClick={() => {
              handleSaveData();
            }}
            className={styles.btnsave}
          >
            Save
          </button>
          <button onClick={onClose} className={styles.btnclose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default AdvancePermissionModal;
