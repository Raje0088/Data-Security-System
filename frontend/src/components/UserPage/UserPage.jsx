import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./UserPage.module.css";
import AddField from "../ClientPage/AddField";
import CustomInput from "../../UI/CustomInput";
import CustomSelect from "../CustomSelect";
import { BsShieldCheck } from "react-icons/bs";
import { FaAngleRight, FaTruckMonster } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import TimePickerComponent from "../../UI/TimePickerComponent";
import { FaUserClock } from "react-icons/fa6";
import History from "../HistoryPage/History";
import { HiOutlineRefresh } from "react-icons/hi";
import { IoReceipt } from "react-icons/io5";
import { base_url } from "../../config/config";
import { AuthContext } from "../../context-api/AuthContext";
import { useContext } from "react";
import DisplaySearchClientsPortal from "../ClientPage/DisplaySearchClientsPortal";
import MessagePortal from "../../UI/MessagePortal";

const UserPage = () => {
  const navigate = useNavigate();
  const { userLoginId } = useContext(AuthContext);
  const { state, from } = useLocation();
  const [getSelectedTime, setGetSelectedTime] = useState("");
  const [taskDetails, setTaskDetails] = useState(null);
  const [verifiedByEmployee, setVerifiedByEmploye] = useState("");
  const [quotationYesNo, setQuotationYesNo] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [isUnsavedNewForm, setIsUnsavedNewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const originalDataRef = useRef(null);
  const [getSelectedNewTime, setGetSelectedNewTime] = useState("");
  const initialClientDetails = {
    sr_no: "",
    clientId: "",
    bussinessNames: {},
    clientName: "",
    userSubscriptionId: "",
    numbers: {},
    emails: {},
    website: "",
    addresses: {},
    pincode: "",
    district: "",
    state: "",
    country: "",
    assignBy: "",
    assignTo: "",
    product: [],
    stage: [],
    quotationShare: "",
    expectedDate: "",
    remarks: "",
    callType: "",
    followUpDate: "",
    verifiedBy: "",
    time: "",
    action: "",
    database: "",
    isActive: "",
    tracker: {
      new_data_db: { completed: false },
      leads_db: { completed: false },
      training_db: { completed: false },
      followUp_db: { completed: false },
      installation_db: { completed: false },
      demo_db: { completed: false },
      amc_db: { completed: false },
      recovery_db: { completed: false },
      target_db: { completed: false },
      new_calls_db: { completed: false },
      support_db: { completed: false },
    },
    label: "",
    shopType: "",
    completion: {
      receivedProduct: "",
      status: "",
      newExpectedDate: "",
      newTime: "",
      newRemark: "",
      newStage: "",
    },
    amountDetails: {
      paymentId: "",
      totalAmount: "",
      paidAmount: "",
      extraCharges: "",
      finalCost: "",
      newAmount: "",
      balanceAmount: "",
      gst: "",
      referenceId: "",
      mode: "",
    },
    additional: {
      invalidNumber: false,
      callCut: false,
      callBusy: false,
      softwareAlreadyUsing: false,
      notRequire: false,
      callLater: false,
      seniorWillCall: false,
      shopClose: false,
    },
  };
  const [clientDetails, setClientDetails] = useState(initialClientDetails);
  const [originalData, setOriginalData] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [stageOptions, setStageOptions] = useState([
    { label: "Amc", value: "amc_db" },
    { label: "Demo", value: "demo_db" },
    { label: "Follow Up", value: "followUp_db" },
    { label: "Installation/Hosting/Sell", value: "installation_db" },
    { label: "Non Amc", value: "non_amc_db" },
    { label: "Recovery", value: "recovery_db" },
    { label: "Support", value: "support_db" },
    { label: "Training", value: "training_db" },
  ]);
  const [selectedStageOptions, setSelectedStageOptions] = useState([]);
  const [userProductList, setUserProductList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState(true);
  const [newClientFormId, setNewClientFormId] = useState("");
  const [checkPermissionManagement, setCheckPermissionManagement] = useState(
    {}
  );
  const [taskClientIdArray, setTaskClientIdArray] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentClientId, setCurrentClientId] = useState("");
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [clientCount, setClientCount] = useState("");
  const [currentClientCount, setCurrentClientCount] = useState(1);
  const [isClientIdAvailableInDb, setIsClientIdAvailableInDb] = useState("");
  const [checkRecovery, setCheckRecovery] = useState(true);
  const [checkInstallation, setCheckInstallation] = useState(false);
  const [checkHotClient, setCheckHotClient] = useState(false);
  const [checkDisplaySearchClients, setCheckDisplaySearchClients] =
    useState(false);
  const [allSearchClientData, setAllSearchClientData] = useState([]);
  const [selectedUserProduct, setSelectedUserProduct] = useState([]);
  const [storedtotalAmount, setStoredTotalAmount] = useState("");
  const [storedPaidAmount, setStoredPaidAmount] = useState("");
  const [storedBalanceAmount, setStoredBalanceAmount] = useState("");
  const [refreshHistory, setRefreshHistory] = useState(false);
  const [isNewDataEntry, setIsNewDataEntry] = useState(true);
  const [isNewDataExist, setIsNewDataExist] = useState(false);
  const [stageTab, setStageTab] = useState("Planner");
  const [selectNewStage, setSelectNewStage] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLock, setIsLock] = useState(false);
  const [amountHandle, setAmountHandle] = useState({
    prevTotal: 0,
    prevExtra: 0,
    prevFinal: 0,
    prevNewAmount: 0,
    prevPaid: 0,
    prevBalance: 0,
    paymentId: "",
  });
  const onlinePaymentMode = [
    "CASH",
    "DEBIT CARD",
    "CREDIT CARD",
    "NET BANKING",
    "UPI",
    "WALLET",
    "CHEQUE",
  ];
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);
  const [activedBackButton, setActivedBackButton] = useState(false);
  const [tempRecoveryType, setTempRecoveryType] = useState(false);

  useEffect(() => {
    if (!getSelectedNewTime) return;
    setClientDetails((prev) => ({
      ...prev,
      completion: {
        ...prev.completion,
        newTime: getSelectedNewTime,
      },
    }));
  }, [getSelectedNewTime]);

  //COMING FROM SEARCHPAGE WHEN VIEW IT SINGLE RECORD OR MULTIPLE RECORD
  useEffect(() => {
    const fetchState = async () => {
      if (state?.from === "searchClient") {
        setTaskClientIdArray(state.selectedClients);
        const id = state.selectedClients[taskIndex];
        setCurrentClientId(id);
        setActivedBackButton(true);
      } else if (state?.from === "userConfiguration") {
        setTaskDetails(state?.selectedClients);
        setActivedBackButton(true);
      } else if (state?.from === "remainder") {
        const id = state.id;
        setCurrentClientId(id);
        setStageTab("Completion");
      } else if (state?.from === "clientpage") {
        const id = state.id;
        setCurrentClientId(id);
      } else {
        handleClientNewForm();
      }
      setIsNewDataEntry(false);
    };
    fetchState();
  }, [state]);

  //FETCHING USER DETAILS USING CLIENT ID HERE RECORD FETCH FROM CLIENT HISTORY DB [DONE]
  useEffect(() => {
    if (!currentClientId) return; // Prevent call if ID is empty
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const result = await axios.get(
          `${base_url}/subscribe-user/search-subscribe-user/${currentClientId}`
        );
        const detail = result?.data?.result;
        if (detail) {
          mappedClientDetails(detail);
        }
      } catch (err) {
        console.log("internal error", err);
      }
    };

    fetchUserData();
  }, [currentClientId, refresh]);

  // MAP FUNCTION SO THAT FETCH CLEINT DETAIL INSERT IN CLIENTDETAILS STATE
  const mappedClientDetails = (detail) => {
    const todayDate = todaysDate();
    const businessFields = [
      { label: "Business Name", value: detail?.optical_name1_db },
      { label: "Business Name 2", value: detail?.optical_name2_db },
      { label: "Business Name 3", value: detail?.optical_name3_db },
    ];
    const emails = [
      { label: "Email 1", value: detail?.email_1_db },
      { label: "Email 2", value: detail?.email_2_db },
      { label: "Email 3", value: detail?.email_3_db },
    ];
    const addresses = [
      { label: "Address 1", value: detail?.address_1_db },
      { label: "Address 2", value: detail?.address_2_db },
      { label: "Address 3", value: detail?.address_3_db },
    ];

    const mobiles = [
      { label: "Primary Number", value: detail?.mobile_1_db },
      { label: "Secondary Number", value: detail?.mobile_2_db },
      { label: "Tertiary Number", value: detail?.mobile_3_db },
    ];
    setSelectedStageOptions(
      (detail.stage_db || []).filter((item) =>
        stageOptions.some((stg) => stg.value === item.value)
      )
    );

    setSelectNewStage((detail.stage_db || []).map((stage) => stage.label));
    setSelectedUserProduct(
      (detail.product_db || []).map((item) => ({
        label: item.label,
        value: item.value,
      }))
    );

    setAmountHandle({
      prevTotal: detail.amountDetails_db?.totalAmount || 0,
      prevExtra: detail.amountDetails_db?.extraCharges || 0,
      prevFinal: detail.amountDetails_db?.finalCost || 0,
      prevNewAmount: detail.amountDetails_db?.newAmount || 0,
      prevPaid: detail.amountDetails_db?.paidAmount || 0,
      prevBalance: detail.amountDetails_db?.balanceAmount || 0,
    });

    const mappedClient = {
      ...initialClientDetails,
      sr_no: detail.client_serial_no_id,
      clientId: detail.client_id,
      userSubscriptionId: detail.client_subscription_id,
      addresses: addresses,
      pincode: detail.pincode_db,
      district: detail.district_db,
      state: detail.state_db,
      country: detail.country_db,
      clientName: detail.client_name_db,
      bussinessNames: businessFields,
      followUpDate: detail.expectedDate_db || todayDate,
      numbers: mobiles,
      emails: emails,
      quotationShare: detail.quotationShare_db,
      expectedDate: "",
      remarks: detail.remarks_db || "",
      callType: detail.callType_db,
      verifiedBy: detail.verifiedBy_db,
      time: detail.time_db,
      label: detail.label_db || "",
      shopType: detail.shopType_db,
      website: detail.website_db,
      database: detail.database_status_db,
      amountDetails: {
        totalAmount: detail.amountDetails_db?.totalAmount || "",
        paidAmount: detail.amountDetails_db?.paidAmount || "",
        extraCharges: detail.amountDetails_db?.extraCharges || "",
        finalCost: detail.amountDetails_db?.finalCost || "",
        newAmount: 0,
        balanceAmount: detail.amountDetails_db?.balanceAmount || "",
        gst: detail.amountDetails_db?.gst || "",
        referenceId: detail.amountDetails_db?.referenceId || "",
        mode: detail.amountDetails_db?.mode || "",
        paymentId: detail?.amountDetails_db?.paymentId || "",
      },
      completion: {
        receivedProduct: detail?.product_db?.[0]?.label || "",
        status: detail?.completion_db?.status || "",
        newExpectedDate: "",
        newTime: "",
        newRemark: detail?.completion_db?.newRemark || "",
        newStage: detail?.completion_db?.newStage || "",
      },
      additional: {
        invalidNumber: detail?.additional_db?.invalidNumber,
        callCut: detail?.additional_db?.callCut,
        callBusy: detail?.additional_db?.callBusy,
        softwareAlreadyUsing: detail?.additional_db?.softwareAlreadyUsing,
        notRequire: detail?.additional_db?.notRequire,
        callLater: detail?.additional_db?.callLater,
        seniorWillCall: detail?.additional_db?.seniorWillCall,
        shopClose: detail?.additional_db?.shopClose,
      },
    };

    setVerifiedByEmploye(detail.verifiedBy_db);
    setClientDetails(mappedClient);
    setOriginalData(JSON.parse(JSON.stringify(mappedClient)));
    setLoading(false);
    setCheckHotClient(detail?.label_db === "Hot");
    setIsUnsavedNewForm(false);
    setDatabaseStatus(detail.database_status_db);

    if (detail.quotationShare_db && detail.quotationShare_db.trim() !== "") {
      setQuotationYesNo(true);
    } else {
      setQuotationYesNo(false);
    }

    if (!detail.isActive_db) {
      setMsg("User is Deactivated");
      setIsLock(true);
    } else {
      setIsLock(false);
    }

    setStoredTotalAmount(parseFloat(detail.amountDetails_db.totalAmount) || 0);
    setStoredPaidAmount(parseFloat(detail.amountDetails_db.paidAmount) || 0);
    setStoredBalanceAmount(
      parseFloat(detail.amountDetails_db.balanceAmount) || 0
    );
  };

  // =============================================================================

  //WHEN PINCODE ENTER AUTO FETCH STATE,DISTRICT, DEBOUNCING USED [DONE]
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (clientDetails.pincode?.length === 6) {
        const fetch = async () => {
          const searching = {
            pincode: clientDetails.pincode,
          };
          try {
            const pincode = await axios.get(
              `${base_url}/pincode/search-pincode`,
              {
                params: searching,
              }
            );
            const pin = pincode.data.results;
            setClientDetails((prev) => ({
              ...prev,
              district: pin.district_db,
              state: pin.state_db,
              country: pin.country_db,
            }));
          } catch (err) {
            console.error("Error fetching pincodes:", err);
            setMsg(err?.response?.data?.message);
          }
        };
        fetch();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [clientDetails.pincode, currentClientId]);

  //TRACKER FOR ANY FIELD UPDATE OR NOT
  const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  useEffect(() => {
    if (loading) return;
    setIsModified(!deepEqual(clientDetails, originalData));
  }, [clientDetails, originalData]);

  //FETCHING USER PRODUCTLIST [DONE]
  useEffect(() => {
    if (!userLoginId) return;
    const fetch = async () => {
      try {
        let productsList, result;
        if (userLoginId?.userId === "SA") {
          result = await axios.get(
            `${base_url}/setting/get-superadmin-product`
          );
          productsList = result?.data?.result?.map((prod) => ({
            label: prod.assign_product_name,
            value: prod.assign_product_name,
          }));
        } else {
          result = await axios.get(
            `${base_url}/users/search-by-user/${userLoginId?.userId}`
          );
          productsList = result?.data?.result?.assignProduct?.map((item) => ({
            label: item.label,
            value: item.label,
          }));
        }

        setUserProductList(productsList);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetch();
  }, [userLoginId]);

  //CREATE NEW FORM FOR CLIENT DB
  const handleClientNewForm = async () => {
    try {
      const result = await axios.get(`${base_url}/raw-data/global-id`);
      const lastSrno = result.data.getLastId;
      const getClientId = `C${String(lastSrno).padStart(7, "0")}`;
      const userId = getClientId.replace("C", "U");
      const TodaysDate = new Date().toISOString().split("T")[0];
      setClientDetails({
        ...initialClientDetails,
        clientId: getClientId,
        userSubscriptionId: userId,
        sr_no: lastSrno,
        followUpDate: TodaysDate,
        bussinessNames: [{ label: "Business Name", value: "" }],
        numbers: [{ label: "Primary Number", value: "" }],
        emails: [{ label: "Email 1", value: "" }],
        addresses: [{ label: "Address 1", value: "" }],
        assign: { assignBy: "", assignTo: "" },
        tracker: {
          new_data_db: { completed: false },
          leads_db: { completed: false },
          training_db: { completed: false },
          followUp_db: { completed: false },
          installation_db: { completed: false },
          demo_db: { completed: false },
          amc_db: { completed: false },
          recovery_db: { completed: false },
          target_db: { completed: false },
          new_calls_db: { completed: false },
          support_db: { completed: false },
        },
        label: "",
        completion: {
          receivedProduct: "",
          status: "",
          newExpectedDate: "",
          newTime: "",
          newRemark: "",
          newStage: "",
        },
        amountDetails: {
          totalAmount: "",
          paidAmount: "",
          extraCharges: "",
          finalCost: "",
          newAmount: "",
          balanceAmount: "",
          gst: "",
          referenceId: "",
          mode: "",
        },
      });

      setAmountHandle({
        prevTotal: 0,
        prevExtra: 0,
        prevFinal: 0,
        prevNewAmount: 0,
        prevPaid: 0,
        prevBalance: 0,
      });

      setCurrentClientId(getClientId);
      setSelectedStageOptions([]);
      setSelectedUserProduct([]);
      setStageTab("Planner");
      setCheckHotClient(false);
      setFeedback(false);
      handleTimeChange("HH:MM:SS AM/PM");
      handleNewTimeChange("HH:MM:SS AM/PM");
      setIsUnsavedNewForm(true);
      setIsNewDataEntry(true);
      setVerifiedByEmploye("");
    } catch (err) {
      console.log("internal errro", err);
    }
  };

  //CHECING RECORD ALREADY EXIST IN DB OR NOT  [DONE]
  useEffect(() => {
    if (
      clientDetails.bussinessNames?.length > 0 &&
      clientDetails.numbers[0].value !== "" &&
      clientDetails.emails?.length > 0 &&
      clientDetails.pincode.trim() &&
      clientDetails.state.trim() &&
      clientDetails.district.trim() &&
      isNewDataEntry
    ) {
      const debouncing = setTimeout(async () => {
        try {
          const result = await axios.post(
            `${base_url}/subscribe-user/check-already-exist`,
            {
              ...clientDetails,
              masterData: userLoginId,
            }
          );
          if (result?.data?.totalCount > 0) {
            alert(result.data.message);
            setIsNewDataExist(true);
            setCheckDisplaySearchClients(true);
            setAllSearchClientData(result?.data);
          } else {
            setIsNewDataExist(false);
          }
        } catch (err) {
          console.log("internal error", err);
        }
      }, 500);
      return () => {
        clearTimeout(debouncing);
      };
    }
  }, [
    clientDetails.bussinessNames,
    clientDetails.numbers,
    clientDetails.emails,
    clientDetails.pincode,
    clientDetails.state,
    clientDetails.district,
  ]);
  const handleSearchInput = (name, value) => {
    console.log(value);
    setClientDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // USER AMOUNT LEFT
  useEffect(() => {
    const fetchLeftAmount = async () => {
      try {
        const result = await axios.get(
          `${base_url}/payment/client-payment-record`,
          {
            params: { clientId: currentClientId },
          }
        );
        if (result.data.message) {
          setMsg(result.data.message);
        }
      } catch (err) {
        console.log("internal err", err);
      }
    };
    fetchLeftAmount();
  }, [currentClientId]);

  // ADDITIONAL FIELD LIKE SHOPCLOSE, CALL CUT, INVALID NO. HANDLE HERE [DONE]
  const handleAdditionalFields = (name, value) => {
    const isChecked = value;
    setClientDetails((prev) => ({
      ...prev,
      additional: {
        ...prev.additional,
        [name]: isChecked,
      },
    }));
  };

  // RESET ALL STATES [DONE]
  const handleNewVisit = () => {
    setSelectedUserProduct([]);
    setSelectedStageOptions([]);
    handleTimeChange("HH:MM:SS AM/PM");
    handleNewTimeChange("HH:MM:SS AM/PM");
    setCheckRecovery(false);
    setAmountHandle([]);
    setClientDetails((prev) => ({
      ...prev,
      followUpTime: "",
      expectedDate: "",
      remarks: "",
      callType: "",
      quotationShare: "",
      tracker: {
        new_data_db: { completed: false },
        leads_db: { completed: false },
        training_db: { completed: false },
        followUp_db: { completed: false },
        installation_db: { completed: false },
        demo_db: { completed: false },
        amc_db: { completed: false },
        recovery_db: { completed: false },
        target_db: { completed: false },
        new_calls_db: { completed: false },
        support_db: { completed: false },
      },
      label: "",
      completion: {
        receivedProduct: "",
        status: "",
        newExpectedDate: "",
        newTime: "",
        newRemark: "",
        newStage: "",
      },
      amountDetails: {
        totalAmount: "",
        paidAmount: "",
        extraCharges: "",
        finalCost: "",
        newAmount: "",
        balanceAmount: "",
      },
      amountHistory: [
        {
          date: "",
          time: "",
          totalAmount: "",
          paidAmount: "",
          extraCharges: "",
          finalCost: "",
          newAmount: "",
          balanceAmount: "",
          updatedBy: "",
        },
      ],
    }));
  };

  //FETCHING PERMISSION OF USER CREATE,UPDATE,DELETE
  useEffect(() => {
    async function fetch() {
      const result = await axios.get(
        `${base_url}/users/search-by-permission/${userLoginId?.userId}`
      );
      const permission = result.data;
      // setCheckPermissionManagement(permission);
    }
    fetch();
  }, []);

  //SAVE USER DETAILS
  const handleSaveUserDetails = async () => {
    if (isNewDataExist) {
      return alert("Record already exist in Database");
    }
    if (!clientDetails.bussinessNames[0]?.value) {
      return alert("First business name cannot be Empty");
    }
    if (!clientDetails.numbers[0]?.value) {
      return alert("First Mobile Field cannot be Empty");
    }
            if (clientDetails.numbers[0]?.value.length > 0 && clientDetails.numbers[0]?.value.length !== 10) {
      return alert("First Mobile Field must be 10 digit");
    }
    if (clientDetails.numbers[1]?.value.length > 0 && clientDetails.numbers[1]?.value.length !== 10) {
      return alert("Second Mobile Field must be 10 digit");
    }
    if (clientDetails.numbers[2]?.value.length > 0 && clientDetails.numbers[2]?.value.length !== 10) {
      return alert("Third Mobile Field must be 10 digit");
    }
    try {
      if (isNewDataEntry) {
        clientDetails.tracker.new_data_db = { completed: true };
      }
      if (clientDetails.tracker.demo_db.completed === true) {
        clientDetails.tracker.leads_db = { completed: true };
      }
      clientDetails.tracker.new_calls_db = {
        completed: true,
      };
      let paymentData;
      if (
        (clientDetails.tracker?.amc_db?.completed === true ||
          clientDetails.tracker?.installation_db?.completed === true ||
          clientDetails.tracker?.recovery_db?.completed === true) &&
        clientDetails.amountDetails.finalCost > 0 &&
        clientDetails.amountDetails.newAmount > 0 &&
        clientDetails.completion.status === "Done"
      ) {
        paymentData = await handlePaymentDetails();
      } else if (
        clientDetails.amountDetails.finalCost > 0 &&
        clientDetails.amountDetails.newAmount > 0
      ) {
        return alert("Please select status");
      }

      const result = await axios.post(
        `${base_url}/subscribe-user/create-subscribe-user`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: currentClientId,
          userId: userLoginId?.userId || clientDetails.assignTo,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          assignBy: clientDetails?.assignBy || "NA",
          assignTo: clientDetails?.assignTo || userLoginId?.userId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: userLoginId?.userId || clientDetails.assignTo,
          action: clientDetails.action,
          database: clientDetails.database,
          tracker: clientDetails.tracker,
          amountDetails: {
            ...clientDetails.amountDetails,
            paymentId: paymentData?.data?.result?.paymentId_db,
          },
          amountHistory: clientDetails.amountHistory,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          shopType: clientDetails.shopType,
          completion: clientDetails.completion,
          action: "Create User",
          database: "User",
        }
      );

      console.log("User Save Successfully", result);

      const resultHistory = await axios.post(
        `${base_url}/history/create-history`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: clientDetails.clientId,
          userId: userLoginId?.userId,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          country: clientDetails.country,
          assignBy: taskDetails?.assignBy_db || "NA",
          assignTo: taskDetails?.assignTo_db || userLoginId?.userId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          callType: clientDetails.callType,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: userLoginId?.userId || clientDetails.assignTo,
          database: "User",
          tracker: clientDetails.tracker,
          amountDetails: {
            ...clientDetails.amountDetails,
            paymentId: paymentData?.data?.result?.paymentId_db,
          },
          amountHistory: clientDetails.amountHistory,
          isUserPage: true,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          shopType: clientDetails.shopType,
          completion: clientDetails.completion,
          action: "Create User",
        }
      );
      console.log("Client History Save Succressfully", resultHistory);
      if (result && resultHistory) {
        alert("User successfully Save");
      }

      setRefreshHistory((prev) => !prev);
      setIsNewDataEntry(false);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  //UPDATE USER DETAILS
  const handleUpdateUserDetails = async () => {
    if (!clientDetails.bussinessNames[0]?.value) {
      return alert("First business name cannot be Empty");
    }
    if (!clientDetails.numbers[0]?.value) {
      return alert("First Mobile Field cannot be Empty");
    }
            if (clientDetails.numbers[0]?.value.length > 0 && clientDetails.numbers[0]?.value.length !== 10) {
      return alert("First Mobile Field must be 10 digit");
    }
    if (clientDetails.numbers[1]?.value.length > 0 && clientDetails.numbers[1]?.value.length !== 10) {
      return alert("Second Mobile Field must be 10 digit");
    }
    if (clientDetails.numbers[2]?.value.length > 0 && clientDetails.numbers[2]?.value.length !== 10) {
      return alert("Third Mobile Field must be 10 digit");
    }
    try {
      clientDetails.tracker.new_calls_db = {
        completed: true,
      };
      if (clientDetails.tracker.demo_db.completed === true) {
        clientDetails.tracker.leads_db = { completed: true };
      }
      let paymentData;

      if (
        (clientDetails.tracker?.amc_db?.completed === true ||
          clientDetails.tracker?.installation_db?.completed === true ||
          clientDetails.tracker?.recovery_db?.completed === true) &&
        clientDetails.amountDetails.finalCost > 0 &&
        clientDetails.amountDetails.newAmount > 0 &&
        clientDetails.completion.status === "Done"
      ) {
        paymentData = await handlePaymentDetails();
      } else if (
        clientDetails.amountDetails.finalCost > 0 &&
        clientDetails.amountDetails.newAmount > 0
      ) {
        return alert("Please select status");
      }

      const result = await axios.put(
        `${base_url}/subscribe-user/update-subscribe-user/${currentClientId}`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: clientDetails.userSubscriptionId,
          userId: userLoginId?.userId || clientDetails.assignTo,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          assignBy: clientDetails?.assignBy,
          assignTo: clientDetails?.assignTo || userLoginId?.userId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: clientDetails.verifiedBy,
          action: clientDetails.action,
          database: clientDetails.database,
          tracker: clientDetails.tracker,
          amountDetails: {
            ...clientDetails.amountDetails,
            paymentId: paymentData?.data?.result?.paymentId_db,
          },
          amountHistory: clientDetails.amountHistory,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          completion: clientDetails.completion,
          action: "update User",
          database: "User",
        }
      );

      console.log("User Updated Successfully", result);

      const resultHistory = await axios.post(
        `${base_url}/history/create-history`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: clientDetails.clientId,
          userId: userLoginId?.userId,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          country: clientDetails.country,
          assignBy: taskDetails?.assignBy_db || "NA",
          assignTo: taskDetails?.assignTo_db || userLoginId?.userId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          callType: clientDetails.callType,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: clientDetails.verifiedBy,
          database: "User",
          tracker: clientDetails.tracker,
          amountDetails: {
            ...clientDetails.amountDetails,
            paymentId: paymentData?.data?.result?.paymentId_db,
          },
          amountHistory: clientDetails.amountHistory,
          isUserPage: true,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          completion: clientDetails.completion,
          action: "update User",
        }
      );
      console.log("Client History Save Succressfully", resultHistory);
      if (result && resultHistory) {
        setMsg(result.data.message);
      }

      setRefreshHistory((prev) => !prev);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  // THIS SET TRACKER COMPLETED FIELDS TO TRUE [DONE]
  const handleStageChange = (selectedOptions) => {
    let updatedOptions = [...(selectedOptions || [])];

    setSelectedStageOptions(updatedOptions);
    const selectedStageValues = updatedOptions.map((item) => item.value);

    if (selectedStageValues.includes("installation_db")) {
      setCheckInstallation(true);
    } else {
      setCheckInstallation(false);
    }

    setClientDetails((prev) => {
      const updatedTracker = { ...(prev.tracker || {}) };
      Object.keys(updatedTracker).forEach((key) => {
        if (selectedStageValues.includes(key)) {
          updatedTracker[key] = {
            completed: true,
          };
        } else {
          updatedTracker[key] = {
            completed: false,
          };
        }
        // console.log(
        //   `Key: ${key}, Completed: ${updatedTracker[key].completed}, Date: ${updatedTracker[key].completedDate}`
        // );
      });

      return {
        ...prev,
        tracker: updatedTracker,
      };
    });
  };

  // ========================================================================

  function todaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const TodaysDate = `${year}-${month}-${day}`;
    // console.log("date", TodaysDate);
    return TodaysDate;
  }

  const hanldeAmountChange = (fieldType, rawValue) => {
    let value = rawValue;

    // ✅ convert to number only if not gst/mode/referenceId
    if (
      fieldType !== "gst" &&
      fieldType !== "mode" &&
      fieldType !== "referenceId"
    ) {
      value = Math.abs(Number(rawValue)) || 0;
    }

    // ✅ gst validation
    if (fieldType === "gst" && Number(value) > 99) {
      return; // stop update
    }

    // ✅ calculate
    const calculation = handleCalculation(fieldType, value);

    // ✅ update state
    setClientDetails((prev) => ({
      ...prev,
      amountDetails: {
        ...prev.amountDetails,
        [fieldType]: value,
        totalAmount: calculation.totalAmount,
        paidAmount: calculation.paidAmount,
        balanceAmount: calculation.balanceAmount,
        newAmount: calculation.newAmount, // always keep the latest correct newAmount
      },
    }));
  };

  const handleCalculation = (fieldType, value) => {
    const finalCost =
      Number(amountHandle.prevFinal) ||
      Number(clientDetails.amountDetails.finalCost) ||
      0;
    const extraCharges =
      Number(amountHandle.prevExtra) ||
      Number(clientDetails.amountDetails.extraCharges) ||
      0;
    const prevPaidAmount = Number(amountHandle.prevPaid) || 0;

    let updatedFinalCost = finalCost;
    let updatedExtraCharges = extraCharges;
    let newAmount = Number(clientDetails.amountDetails.newAmount) || 0; // keep current newAmount
    let updatedPaidAmount = prevPaidAmount;

    // ✅ update cost fields
    if (fieldType === "finalCost") updatedFinalCost = Number(value) || 0;
    if (fieldType === "extraCharges") updatedExtraCharges = Number(value) || 0;

    // ✅ only update if fieldType = newAmount
    if (fieldType === "newAmount") {
      newAmount = Number(value) || 0;
      updatedPaidAmount = prevPaidAmount + newAmount;
    } else {
      // when editing gst/mode/referenceId, keep same paid + newAmount
      updatedPaidAmount = prevPaidAmount + newAmount;
    }

    const totalAmount = updatedFinalCost + updatedExtraCharges;
    let balanceAmount = totalAmount - updatedPaidAmount;

    // ✅ Rule: if newAmount > totalAmount → reset newAmount, keep paid = prevPaid
    if (updatedPaidAmount > totalAmount) {
      alert("Paid Amount cannot exceed TotalCost");
      newAmount = 0;
      updatedPaidAmount = prevPaidAmount; // rollback to previous paid only
      balanceAmount = totalAmount - updatedPaidAmount;
    }

    return {
      totalAmount,
      paidAmount: updatedPaidAmount,
      balanceAmount,
      newAmount,
    };
  };

  const handlePaymentDetails = async () => {
    const prod = selectedUserProduct.map((prod) => prod.label);
    try {
      const result = await axios.post(
        `${base_url}/payment/history`,
        {
          amountDetails: clientDetails.amountDetails,
          userId: userLoginId?.userId,
          clientId: clientDetails.clientId,
          clientName: clientDetails.clientName,
          quotationShare: clientDetails.quotationShare,
          product: prod[0],
          opticalName: clientDetails.bussinessNames[0].value,
          mobile: clientDetails.numbers[0].value,
          pincode: clientDetails.pincode,
          tempRecoveryType: tempRecoveryType,
          stage: selectedStageOptions.find((s) =>
            ["Installation/Hosting/Sell", "Amc", "Recovery"].includes(s.label)
          ).label,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("payment Id ", result.data.result.paymentId_db);

      alert("Payment done");
      return result;
    } catch (err) {
      console.log("internal error", err);
    }
  };

  useEffect(() => {
    const fetchPayment = async () => {
      const prod = selectedUserProduct.map((prod) => prod.label);
      const stage = selectedStageOptions.find((s) =>
        ["Recovery"].includes(s.label)
      )?.label;

      if (!stage) return;
      try {
        let result;
        if (stage === "Recovery") {
          result = await axios.get(`${base_url}/payment/payment-details`, {
            params: {
              product: prod[0],
              clientId: currentClientId,
              stage: stage,
              recoveryType: tempRecoveryType,
              // paymentId:clientDetails?.amountDetails?.paymentId
            },
          });
        } else {
          // result = await axios.get(`${base_url}/payment/payment-details`, {
          //   params: {
          //     product: prod[0],
          //     clientId: currentClientId,
          //     stage: stage,
          //   },
          // });
        }

        const data = result.data;

        if (data.message) {
          alert(data.message);
        }

        const last = data.lastPayment;
        if (!data.allowNewEntry) {
          setAmountHandle({
            prevTotal: last.totalAmount_db,
            prevExtra: last.extraCharges_db,
            prevFinal: last.finalCost_db,
            prevNewAmount: last.newAmount_db,
            prevPaid: last.paidAmount_db,
            prevBalance: last.balanceAmount_db,
            paymentId: last.paymentId_db,
          });

          setClientDetails((prev) => ({
            ...prev,
            amountDetails: {
              totalAmount: last.totalAmount_db,
              paidAmount: last.paidAmount_db,
              extraCharges: last.extraCharges_db,
              finalCost: last.finalCost_db,
              newAmount: 0,
              balanceAmount: last.balanceAmount_db,
              gst: last.gst_db,
              referenceId: last.referenceId_db,
              mode: last.mode_db,
              paymentId: last.paymentId_db,
            },
          }));
        } else {
          setAmountHandle({
            prevTotal: 0,
            prevExtra: 0,
            prevFinal: 0,
            prevNewAmount: 0,
            prevPaid: 0,
            prevBalance: 0,
          });

          setClientDetails((prev) => ({
            ...prev,
            amountDetails: {
              ...prev.amountDetails,
              totalAmount: 0,
              paidAmount: 0,
              extraCharges: 0,
              finalCost: 0,
              newAmount: 0,
              balanceAmount: 0,
              gst: "",
              referenceId: "",
              mode: "",
            },
          }));
        }
      } catch (err) {
        console.log("internal error", err);
      }
    };

    if (
      currentClientId &&
      selectedUserProduct?.length > 0 &&
      selectedStageOptions?.length > 0 &&
      tempRecoveryType
    ) {
      fetchPayment();
    }
  }, [selectedUserProduct, selectedStageOptions, tempRecoveryType]);

  const handleSelectedUserProduct = (selectOptions) => {
    setSelectedUserProduct(selectOptions);
  };

  //FUNCTION FOR FETCH ALL USER [DONE]
  const handleAllSearchClientData = async () => {
    try {
      const result = await axios.get(
        `${base_url}/subscribe-user/search-alluser-match`,
        {
          params: {
            name: clientDetails.clientName || "",
            opticalName: clientDetails.bussinessNames[0].value || "",
            mobile: clientDetails.numbers[0].value || "",
            address: clientDetails.addresses[0].value || "",
            email: clientDetails.emails[0].value || "",
            pincode: clientDetails.pincode || "",
            district: clientDetails.district || "",
            state: clientDetails.state || "",
            clientId: clientDetails.clientId || "",
          },
        }
      );
      setAllSearchClientData(result.data);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleClientIdClick = (clickId) => {
    setCurrentClientId(clickId);
  };

  const handleSwichTo = () => {
    navigate("/client-page");
  };

  const handleTimeChange = (time) => {
    if (!time || time === "HH:MM:SS AM/PM") {
      setGetSelectedTime("NA");
    } else {
      setGetSelectedTime(time);
    }
  };

  const handleNewTimeChange = (time) => {
    if (!time || time === "HH:MM:SS AM/PM") {
      setGetSelectedNewTime("NA"); // ✅ use null, not "NA"
    } else {
      setGetSelectedNewTime(time);
    }
  };

  const handlePrevButton = () => {
    if (taskIndex > 0) {
      const index = taskIndex - 1;
      setCurrentClientId(taskClientIdArray[index]);
      setTaskIndex((prev) => prev - 1);
    }
    setIsNewDataEntry(false);
  };
  const handleNextButton = () => {
    if (taskIndex < taskClientIdArray.length - 1) {
      const index = taskIndex + 1;
      setCurrentClientId(taskClientIdArray[index]);
      setTaskIndex((prev) => prev + 1);
    }
    setIsNewDataEntry(false);
  };

  const handlePaymentReceipt = async (id) => {
    try {
      const result = await axios.get(`${base_url}/payment/receipt/${id}`);
      const paymentData = result.data.result;
      navigate("/receipt", {
        state: {
          paymentData,
          from: "payment-receipt",
          label: "Payment Details",
        },
      });
    } catch (err) {
      console.log("internal err", err);
    }
  };

  const goToBack = () => {
    navigate("/search-client");
  };

  const handleDeactive = async () => {
    try {
      const result = await axios.put(
        `${base_url}/subscribe-user/deactivate-user/${currentClientId}`
      );
      setMsg(result.data.message);
      setRefresh(p=>!p)
    } catch (err) {
      console.log("internal  error", err);
    }
  };
  return (
    <>
      <div className={styles.main}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.serialdiv}>
              <label htmlFor="">SrNo</label>
              <input type="text" value={clientDetails.sr_no} readOnly={true} />
              <input
                type="text"
                value={clientDetails.clientId}
                onChange={(e) => {
                  handleSearchInput("clientId", e.target.value);
                }}
              />
            </div>
            <div className={styles.heading}>
              <h2>
                User <strong>Details</strong>
              </h2>
              {checkHotClient && (
                <FaUserClock title="Hot Client" className={styles.hoticon} />
              )}
            </div>
            <div className={styles.db}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <span className={styles.verified}>
                  {verifiedByEmployee ? (
                    <span
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Verified by {verifiedByEmployee}
                      <BsShieldCheck
                        style={{
                          color: "green",
                          backgroundColor: "white",
                          fontSize: "18px",
                          borderRadius: "20px",
                        }}
                      />
                    </span>
                  ) : (
                    <span>Not verified</span>
                  )}
                </span>

                {/* {(userLoginId?.roleType === "Superadmin" ||
                  userLoginId?.roleType === "Admin") &&
                  (verifiedByEmployee === "" ||
                    verifiedByEmployee === undefined) && (
                    <SwitchToggle setVerifiedByEmploye={handleCheckboxChange} />
                  )} */}
              </div>

              <div className={styles.followupdiv}>
                <label htmlFor="">Follow Up Date </label>
                {clientDetails.time && <span>{clientDetails.time}</span>}

                <input
                  type="date"
                  name=""
                  id=""
                  value={clientDetails.followUpDate}
                  onChange={(e) => {
                    handleSearchInput("followUpDate", e.target.value);
                  }}
                />
              </div>
            </div>
          </header>

          <div className={styles.formlayout}>
            <div className={styles.heading2}>
              <h4>Basic </h4>
            </div>
            <div className={styles["basic-form-name"]}>
              <CustomInput
                type={"text"}
                label={"Client Name"}
                name={"clientName"}
                id={"clientName"}
                value={clientDetails.clientName}
                onChange={(e) => {
                  handleSearchInput("clientName", e.target.value);
                }}
                placeholder={"Enter Client Name"}
                required={false}
              />
            </div>

            <div className={styles["addfield-div"]}>
              <div className={styles.addfield}>
                <AddField
                  fieldType={"text"}
                  initialLabel={"Business Name"}
                  initialFields={clientDetails.bussinessNames}
                  onChange={(values) => {
                    //console.log("Bussiness name values", values);
                    const businessNames = values;
                    setClientDetails((prev) => ({
                      ...prev,
                      bussinessNames: businessNames,
                    }));
                  }}
                />
              </div>
              <div className={styles.addfield}>
                <AddField
                  userProduct={userProductList}
                  clientObj={{
                    name: clientDetails?.clientName || "",
                    clientNumber: clientDetails?.numbers || [],
                  }}
                  fieldType={"number"}
                  initialLabel={"Primary Number"}
                  initialFields={clientDetails.numbers}
                  onChange={(values) => {
                    //console.log("numbers", values);
                    setClientDetails((prev) => ({
                      ...prev,
                      numbers: values,
                    }));
                  }}
                />
              </div>

              <div className={styles.addfield}>
                <AddField
                  fieldType={"email"}
                  initialLabel={"Email 1"}
                  initialFields={clientDetails.emails}
                  onChange={(values) => {
                    //console.log("Email", values);
                    setClientDetails((prev) => ({
                      ...prev,
                      emails: values,
                    }));
                  }}
                />
              </div>
              <div className={styles.addfield}>
                <AddField
                  fieldType={"text"}
                  initialLabel={"Address 1"}
                  initialFields={clientDetails.addresses}
                  onChange={(values) => {
                    //console.log("Bussiness name values", values);
                    setClientDetails((prev) => ({
                      ...prev,
                      addresses: values,
                    }));
                  }}
                />
              </div>
            </div>

            <div className={styles["other-fields1"]}>
              <div className={styles["other-fields1-inner"]}>
                <CustomInput
                  type={"text"}
                  label={"Assign By"}
                  name={"assign_by"}
                  id={"assign_by"}
                  value={"NA"}
                  readonly={true}
                  onChange={(e) => {
                    handleSearchInput("assignBy", e.target.value);
                  }}
                  required={false}
                />
                <CustomInput
                  type={"text"}
                  label={"Assign To"}
                  name={"assign_to"}
                  id={"assign_to"}
                  value={userLoginId?.userId}
                  readonly={true}
                  onChange={(e) => {
                    handleSearchInput("assignTo", e.target.value);
                  }}
                  required={false}
                />
              </div>
              <CustomInput
                type={"text"}
                label={"Website"}
                name={"website"}
                id={"website"}
                value={clientDetails.website}
                onChange={(e) => {
                  handleSearchInput("website", e.target.value);
                }}
                placeholder={"Enter Website"}
                required={false}
              />
            </div>

            <div className={styles["other-fields2"]}>
              <CustomInput
                type={"number"}
                label={"Pincode"}
                name={"pincode"}
                id={"pincode"}
                value={clientDetails.pincode}
                onChange={(e) => {
                  handleSearchInput("pincode", e.target.value);
                }}
                placeholder={"Enter pincode"}
                required={false}
              />
              <CustomInput
                type={"text"}
                label={"District"}
                name={"district"}
                id={"district"}
                value={clientDetails.district}
                onChange={(e) => {
                  handleSearchInput("district", e.target.value);
                }}
                placeholder={"Enter district"}
                required={false}
              />

              <CustomInput
                type={"text"}
                label={"State"}
                name={"state"}
                id={"state"}
                value={clientDetails.state}
                onChange={(e) => {
                  handleSearchInput("state", e.target.value);
                }}
                placeholder={"Enter state"}
                required={false}
              />
              <CustomInput
                type={"text"}
                label={"Country"}
                name={"country"}
                id={"country"}
                value={clientDetails.country}
                onChange={(e) => {
                  handleSearchInput("country", e.target.value);
                }}
                placeholder={"Enter Country"}
                required={false}
              />
            </div>

            {/* =========================FEEDBACK================================ */}

            <div className={styles.feedback}>
              <div className={styles.scheduleTab}>
                <p
                  onClick={() => {
                    setStageTab("Planner");
                  }}
                  className={stageTab === "Planner" && styles.scheduleTab1}
                >
                  Planner
                </p>
                <p
                  onClick={() => {
                    setStageTab("Completion");
                  }}
                  className={stageTab === "Completion" && styles.scheduleTab1}
                >
                  Completion
                </p>
              </div>
              <div className={styles["feedback-heading"]}>
                <h4>Feedback </h4>
              </div>
              <div className={styles["feedback-btndiv"]}>
                <button onClick={handleNewVisit}>New Visit</button>
              </div>
            </div>

            {/* ================================= PLANNER ============================================================= */}

            <div
              style={{ display: stageTab === "Planner" ? "" : "none" }}
              className={styles["feedback-layout"]}
            >
              <div>
                <label htmlFor="">Product</label>
                <CustomSelect
                  options={userProductList}
                  value={selectedUserProduct}
                  isMulti={false}
                  onChange={(selectedOptions) => {
                    handleSelectedUserProduct(selectedOptions);
                  }}
                />
              </div>
              <div className={styles.quo}>
                <span>
                  <label htmlFor="">Quotation Share </label>
                  <label htmlFor="yes">Yes </label>
                  <input
                    type="radio"
                    name="quotation"
                    id="yes"
                    value="yes"
                    checked={quotationYesNo === true}
                    style={{ marginRight: "5px" }}
                    onChange={() => {
                      setQuotationYesNo(true);
                    }}
                  />
                  <label htmlFor="no">No </label>
                  <input
                    type="radio"
                    name="quotation"
                    id="no"
                    value="no"
                    checked={quotationYesNo === false}
                    onChange={() => {
                      setQuotationYesNo(false);
                      handleSearchInput("quotationShare", "");
                    }}
                  />
                </span>
                {quotationYesNo && (
                  <input
                    type="text"
                    name=""
                    id=""
                    value={clientDetails.quotationShare}
                    onChange={(e) => {
                      handleSearchInput("quotationShare", e.target.value);
                    }}
                  />
                )}
              </div>
              <div style={{ position: "relative" }}>
                <label htmlFor="">Stage</label>

                <CustomSelect
                  options={stageOptions}
                  value={selectedStageOptions}
                  onChange={(selected) => {
                    handleStageChange(selected);
                  }}
                  isMulti={true}
                />
                {clientDetails.tracker?.recovery_db?.completed && (
                  <span className={styles["recovery-popup"]}>
                    <label htmlFor="">Select Recovery Type</label>
                    <select
                      name=""
                      id=""
                      value={tempRecoveryType}
                      onChange={(e) => {
                        setTempRecoveryType(e.target.value);
                      }}
                      className={styles["recovery-select"]}
                    >
                      <option value="Amc">Amc</option>
                      <option value="Installation/Hosting/Sell">
                        Installation
                      </option>
                    </select>
                  </span>
                )}
              </div>
              {checkRecovery === true && (
                <div className={styles.recovery}>
                  <span
                    className={styles.receiptspan}
                    onClick={() => {
                      handlePaymentReceipt(clientDetails.clientId);
                      setHistoryOpen(true);
                    }}
                  >
                    <IoReceipt className={styles.icon} />
                  </span>

                  <CustomInput
                    type="number"
                    label={"Final Cost"}
                    readonly={amountHandle.prevFinal > 0}
                    value={clientDetails.amountDetails.finalCost}
                    onChange={(e) => {
                      hanldeAmountChange("finalCost", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Extra Charges"}
                    readonly={amountHandle.prevExtra > 0}
                    value={clientDetails.amountDetails.extraCharges}
                    onChange={(e) => {
                      hanldeAmountChange("extraCharges", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Total"}
                    readonly={true}
                    value={clientDetails.amountDetails.totalAmount}
                    onChange={(e) => {
                      hanldeAmountChange("totalAmount", e.target.value);
                    }}
                  />

                  <CustomInput
                    type="number"
                    label={"New Amount"}
                    readonly={amountHandle.prevBalance === 0}
                    value={
                      amountHandle.prevTotal > 0 &&
                      amountHandle.prevTotal === amountHandle.prevPaid
                        ? 0
                        : clientDetails.amountDetails.newAmount
                    }
                    onChange={(e) => {
                      hanldeAmountChange("newAmount", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    readonly={true}
                    label={"Paid"}
                    value={clientDetails.amountDetails.paidAmount}
                    onChange={(e) => {
                      hanldeAmountChange("paidAmount", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Balance"}
                    readOnly={true}
                    value={clientDetails.amountDetails.balanceAmount}
                    onChange={(e) => {
                      hanldeAmountChange("balanceAmount", e.target.value);
                    }}
                  />

                  <CustomInput
                    type="text"
                    label={"GST %"}
                    readOnly={
                      clientDetails.amountDetails.gst > 10 ? true : false
                    }
                    value={clientDetails.amountDetails.gst}
                    onChange={(e) => {
                      hanldeAmountChange("gst", e.target.value);
                    }}
                  />

                  <div className={styles.modediv}>
                    <label htmlFor="">Mode</label>
                    <select
                      name=""
                      id=""
                      className={styles.customselect}
                      value={clientDetails.amountDetails.mode}
                      onChange={(e) => {
                        hanldeAmountChange("mode", e.target.value);
                      }}
                    >
                      {onlinePaymentMode.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CustomInput
                    type="text"
                    label={"Reference Id"}
                    value={clientDetails.amountDetails.referenceId}
                    onChange={(e) => {
                      hanldeAmountChange("referenceId", e.target.value);
                    }}
                  />
                </div>
              )}
              <div>
                <label htmlFor="">Follow Up Time</label>
                <TimePickerComponent
                  value={getSelectedTime}
                  onTimeChange={handleTimeChange}
                />
              </div>

              <div>
                Expected Close Date
                <input
                  type="date"
                  name=""
                  id=""
                  value={clientDetails.expectedDate}
                  className={styles.exdate}
                  onChange={(e) => {
                    handleSearchInput("expectedDate", e.target.value);
                  }}
                />
              </div>
              <div>
                Call Type
                <select
                  name=""
                  id=""
                  value={clientDetails.callType}
                  className={styles.customselect}
                  onChange={(e) => {
                    const selectCallType = e.target.value;
                    if (selectCallType === "Out-bound") {
                      setClientDetails((prev) => ({
                        ...prev,
                        tracker: {
                          ...prev.tracker,
                          out_bound_db: {
                            completed: true,
                            completedDate: new Date().toLocaleDateString(
                              "en-GB"
                            ),
                          },
                        },
                      }));
                    } else if (selectCallType === "In-bound") {
                      setClientDetails((prev) => ({
                        ...prev,
                        tracker: {
                          ...prev.tracker,
                          in_bound_db: {
                            completed: true,
                            completedDate: new Date().toLocaleDateString(
                              "en-GB"
                            ),
                          },
                        },
                      }));
                    }
                    handleSearchInput("callType", e.target.value);
                  }}
                >
                  <option value="Out-bound">Out-bound</option>
                  <option value="In-bound">In-bound</option>
                </select>
              </div>
              <div>
                <label htmlFor="">Label</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.label}
                  onChange={(e) => {
                    handleSearchInput("label", e.target.value);
                  }}
                >
                  <option value="NA">--Select--</option>
                  <option value="Hot">Hot</option>
                  <option value="Interested">Interested</option>
                  <option value="Less Interested">Less Interested</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label htmlFor="">ShopType</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.shopType}
                  onChange={(e) => {
                    handleSearchInput("shopType", e.target.value);
                  }}
                >
                  <option value="Retail">Retail</option>
                  <option value="Whole Saler">Whole Saler</option>
                  <option value="Fitter">Fitter</option>
                </select>
              </div>
            </div>
            <div
              style={{ display: stageTab === "Planner" ? "" : "none" }}
              className={styles.remarkdiv}
            >
              <label htmlFor="">Remark</label>
              <textarea
                className={styles["remarks-field"]}
                value={clientDetails.remarks}
                onChange={(e) => {
                  handleSearchInput("remarks", e.target.value);
                }}
              ></textarea>
            </div>

            {/* =================================== COMPLETION ========================================================             */}

            <div
              style={{ display: stageTab === "Completion" ? "" : "none" }}
              className={styles["feedback-layout"]}
            >
              <div>
                <label htmlFor="">Product</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.completion.receivedProduct}
                />
              </div>

              <div>
                <label htmlFor="">Stage</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.completion.newStage}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        newStage: e.target.value,
                      },
                    }));
                  }}
                >
                  <option value="">--Select--</option>
                  {(selectNewStage || []).map((item, idx) => (
                    <option key={idx} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="">Status</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.completion.status}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        status: e.target.value,
                      },
                    }));
                  }}
                >
                  <option value="">--Select--</option>
                  <option value="Cancel">Cancel</option>
                  <option value="Done">Done</option>
                  <option value="Defaulter">Defaulter</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Postponed">Postponed</option>
                </select>
              </div>
              <div>
                Expected Close Date
                <input
                  type="date"
                  name=""
                  id=""
                  className={styles.exdate}
                  value={clientDetails.completion.newExpectedDate}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        newExpectedDate: e.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div>
                <label htmlFor="">Follow Up Time</label>
                <TimePickerComponent
                  value={getSelectedNewTime}
                  onTimeChange={handleNewTimeChange}
                />
              </div>
            </div>
            <div
              style={{ display: stageTab === "Completion" ? "" : "none" }}
              className={styles.remarkdiv}
            >
              <label htmlFor="">Remark</label>
              <textarea
                className={styles["remarks-field"]}
                value={clientDetails.completion.newRemark}
                onChange={(e) => {
                  setClientDetails((prev) => ({
                    ...prev,
                    completion: {
                      ...prev.completion,
                      newRemark: e.target.value,
                    },
                  }));
                }}
              ></textarea>
            </div>

            <div className={styles.quickfeed}>
              <label htmlFor="shopClose">
                <input
                  type="checkbox"
                  id="shopClose"
                  checked={!!clientDetails.additional.shopClose}
                  onChange={(e) => {
                    handleAdditionalFields("shopClose", e.target.checked);
                  }}
                />{" "}
                Shop Close
              </label>
              <label htmlFor="invalid">
                <input
                  type="checkbox"
                  id="invalid"
                  checked={!!clientDetails.additional.invalidNumber}
                  onChange={(e) => {
                    handleAdditionalFields("invalidNumber", e.target.checked);
                  }}
                />{" "}
                Invalid Number
              </label>
              <label htmlFor="cut">
                <input
                  type="checkbox"
                  id="cut"
                  checked={!!clientDetails.additional.callCut}
                  onChange={(e) => {
                    handleAdditionalFields("callCut", e.target.checked);
                  }}
                />{" "}
                Call Cut
              </label>
              <label htmlFor="busy">
                <input
                  type="checkbox"
                  id="busy"
                  checked={!!clientDetails.additional.callBusy}
                  onChange={(e) => {
                    handleAdditionalFields("callBusy", e.target.checked);
                  }}
                />{" "}
                Call Busy
              </label>
              <label htmlFor="using">
                <input
                  type="checkbox"
                  id="using"
                  checked={!!clientDetails.additional.softwareAlreadyUsing}
                  onChange={(e) => {
                    handleAdditionalFields(
                      "softwareAlreadyUsing",
                      e.target.checked
                    );
                  }}
                />{" "}
                Already have software
              </label>
              <label htmlFor="not-require">
                <input
                  type="checkbox"
                  id="not-require"
                  checked={!!clientDetails.additional.notRequire}
                  onChange={(e) => {
                    handleAdditionalFields("notRequire", e.target.checked);
                  }}
                />{" "}
                Not require
              </label>
              <label htmlFor="call-later">
                <input
                  type="checkbox"
                  id="call-later"
                  checked={!!clientDetails.additional.callLater}
                  onChange={(e) => {
                    handleAdditionalFields("callLater", e.target.checked);
                  }}
                />{" "}
                Call later/Busy
              </label>
              <label htmlFor="senior-call">
                <input
                  type="checkbox"
                  id="senior-call"
                  checked={!!clientDetails.additional.seniorWillCall}
                  onChange={(e) => {
                    handleAdditionalFields("seniorWillCall", e.target.checked);
                  }}
                />{" "}
                Senior will call/Senior not available
              </label>
            </div>

            <div className={styles.btn}>
              <div
                className={styles["arrow-icon"]}
                style={{
                  position: "relative",
                  backgroundColor: taskIndex === 0 ? "white" : "",
                }}
                onClick={handlePrevButton}
              >
                {taskClientIdArray.length > 0 && (
                  <span className={styles.btncounterleft}>{taskIndex}</span>
                )}
                <FaAngleLeft />
              </div>
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  backgroundColor: "rgb(92, 55, 55)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100%",
                  fontSize: "140px",
                }}
                onClick={() => {
                  handleSwichTo();
                }}
              >
                <HiOutlineRefresh
                  style={{ fontSize: "40px", color: "white" }}
                />
              </div>
              <button
                onClick={() => {
                  handleClientNewForm();
                  setIsNewDataEntry(true);
                }}
              >
                New
              </button>
              {isUnsavedNewForm === true ? (
                <button onClick={handleSaveUserDetails}>Save</button>
              ) : (
                <button
                  disabled={!isModified || isLock ===true}
                  style={
                    !isModified || isLock ===true ? { background: "gray", opacity: 0.5 } : {}
                  }
                  onClick={handleUpdateUserDetails}
                >
                  Update
                </button>
              )}
              <button
                onClick={() => {
                  handleAllSearchClientData();
                  setCheckDisplaySearchClients((prev) => !prev);
                }}
              >
                Search
              </button>
              {userLoginId?.permission.delete_P && (
                <button
                     style={
                    isLock === true ? { background: "gray", opacity: 0.5 } : {}
                  }
                  disabled={isLock === true}
                  onClick={() => {
                    handleDeactive();
                  }}
                >
                  Deactivate
                </button>
              )}
              <button
                style={{ display: activedBackButton === true ? "" : "none" }}
                onClick={() => {
                  goToBack();
                }}
              >
                Back
              </button>
              {checkDisplaySearchClients && (
                <DisplaySearchClientsPortal
                  onClientIdClick={handleClientIdClick}
                  onAllSearchClientData={allSearchClientData}
                  onClose={() => {
                    setCheckDisplaySearchClients(false);
                  }}
                />
              )}
              <div
                className={styles["arrow-icon"]}
                style={{
                  position: "relative",
                  backgroundColor:
                    taskIndex === taskClientIdArray.length - 1 ? "white" : "",
                }}
                onClick={handleNextButton}
              >
                <FaAngleRight />
                {taskClientIdArray.length > 0 && (
                  <span className={styles.btncounterright}>
                    {" "}
                    {taskClientIdArray.length - (taskIndex + 1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.history}>
          <div className={styles.viewhistory}>
            <button
              onClick={() => {
                setHistoryPop((prev) => !prev);
              }}
            >
              View
            </button>
          </div>
          <History
            onRefresh={refreshHistory}
            onCurrentClientId={clientDetails.clientId}
          />
        </div>
        {historyPop && (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "fixed",
              background: "gray",
              top: "0",
              left: "0",
              fontSize: "36px",
              padding: "50px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <History
                onRefresh={refreshHistory}
                onCurrentClientId={clientDetails.clientId}
                sorts={"des"}
              />
              <div
                style={{
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "end",
                  padding: "10px",
                  borderTop: "1px solid #ccc",
                  background: "white",
                }}
              >
                <button
                  onClick={() => {
                    setHistoryPop(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {msg && (
          <MessagePortal
            message1={msg}
            message2={""}
            onClose={() => {
              setMsg("");
            }}
          />
        )}
      </div>
    </>
  );
};

export default UserPage;
