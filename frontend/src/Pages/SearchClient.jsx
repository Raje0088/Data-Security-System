import React, { useState, useEffect } from "react";
import styles from "./SearchClient.module.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import * as xlsx from "xlsx";
import { MdClose } from "react-icons/md";
import { TbArrowMerge } from "react-icons/tb";
import { AiTwotoneDelete } from "react-icons/ai";
import { base_url } from "../config/config";
import { useContext } from "react";
import { AuthContext } from "../context-api/AuthContext";
import { IoMenu } from "react-icons/io5";
import { setSelectedData, setField, resetAll } from "../redux/Redux";
import { useSelector, useDispatch } from "react-redux";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import MessagePortal from "../UI/MessagePortal.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { LuCirclePlus } from "react-icons/lu";

const SearchClient = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const selectedDataRedux = useSelector(
    (state) => state.filterStore.selectedData
  );
  const filterRawRedux = useSelector((state) => state.filterStore.filterRaw);
  // console.log("state", location.state);
  const { DumpId, DumpBy, DumpURL } = location.state || {};
  // console.log("yo", selectedDataRedux, filterRawRedux);
  const { userLoginId } = useContext(AuthContext);
  const [searchFrom, setSearchFrom] = useState("");
  const [filterRaw, setFilterRaw] = useState({
    clientType: "",
    clientId: "",
    clientName: "",
    opticalName: "",
    address: "",
    mobile: "",
    email: "",
    district: "",
    state: "",
    country: "",
    hot: null,
    followUp: null,
    demo: null,
    installation: null,
    amc: null,
    product: "",
    defaulter: null,
    recovery: null,
    lost: null,
    deactivate: null,
    dateFrom: "",
    dateTo: "",
    pincode: "",
    userId: "",
  });
  const [newData, setNewData] = useState({
    clientId: "",
    clientName: "",
    opticalName1: "",
    opticalName2: "",
    opticalName3: "",
    address: "",
    mobile1: "",
    mobile2: "",
    mobile3: "",
    email1: "",
    email2: "",
    email3: "",
    district: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [selectedEmail, setSelectedEmail] = useState([]);
  const [selectedMobile, setSelectedMobile] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState([]);
  const [selectedOpticalName, setSelectedOpticalName] = useState([]);
  const [selectNewDataOption, setSelectNewDataOption] = useState([]);
  const [totalDuplicateRecordCount, setTotalDuplicateRecordCont] = useState(0);
  const [fields, setFields] = useState({
    clientId: "",
    clientName: "",
    opticalName1: "",
    opticalName2: "",
    opticalName3: "",
    address1: "",
    address2: "",
    address3: "",
    mobile1: "",
    mobile2: "",
    mobile3: "",
    email1: "",
    email2: "",
    email3: "",
    district: "",
    state: "",
    country: "",
    pincode: [],
  });
  const [page, setPage] = useState(1);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [openSlide, setOpenSlide] = useState(false);
  // const [fetchedRawData, setFetchedRawData] = useState([]);
  const [fetchedRawData, setFetchedRawData] = useState({
    result: [],
    totalCount: 0,
    page: 1,
    limit: 50,
    db: "",
    message: "",
    counts: { r: 0, c: 0, u: 0 },
  });

  const [totalPageSize, setTotalPageSize] = useState(1);
  const [selectedClients, setSelectedClients] = useState([]);
  const [redirectClientId, setRediretClientId] = useState(null);
  const [getPresentDistrict, setGetPresentDistrict] = useState([]);
  const [pincodeOptionList, setPincodeOptionList] = useState([]);
  const [selectPincodeOption, setSelectPincodeOption] = useState([]);
  const [getPresentCountry, setGetPresentCountry] = useState([]);
  const [selectedExcelName, setSelectedExcelName] = useState(null);
  const [getPresentPlace, setGetPresentPlace] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [searchDuplicateRecord, setSearchDuplicateRecord] = useState([]);
  const [duplicateRecord, setDuplicateRecord] = useState([]);
  const [tempRecord, setTempRecord] = useState([]);
  const [tempCount, setTempCount] = useState({ raw: 0, client: 0, user: 0 });
  const [remStatus, setRemStatus] = useState("ALL");
  const [isRemMode, setIsRemMode] = useState(false);
  const [totalDone, setTotalDone] = useState(0);
  const [duplicateCheckerThreeDB, setDuplicateCheckerThreeDB] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isMigrate, setIsMigrate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSearchDuplicate, setIsSearchDuplicate] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [groupIndexTracker, setGroupIndexTracker] = useState(null);
  const [disableSetter, setDisableSetter] = useState(null);
  const [isAssignTaskMode, setIsAssignTaskMode] = useState(false);
  const [assignTaskUserId, setAssignTaskUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const [userProductList, setUserProductList] = useState([]);
  const [duplicateFilterField, setDuplicateFilterField] = useState({
    clientName: true,
    opticalName: true,
  });
  const [openDuplicateFieldPopup, setOpenDuplicateFieldPopup] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.from === "assignTask") {
      setIsAssignTaskMode(true);
      setFilterRaw((prev) => ({
        ...prev,
        clientType: state.assignType,
      }));
      setDisableSetter(state.assignType);
      setAssignTaskUserId(state.userId);
    }
  }, [state]);

  useEffect(() => {
    const showExcelData = async () => {
      setIsLoading(true);
      try {
        const result = await axios.get(
          `${base_url}/raw-data/excel-data/${DumpId}`
        );

        console.log("jsonData", result.data);
        // const resultClient = await axios.get(`${base_url}/raw-data/excel-data/`)
        setExcelData(result.data.result);
      } catch (err) {
        console.log("internal error", err);
      }
      setIsLoading(false);
    };
    if (DumpId) {
      showExcelData();
      // setIsLoading(true)
    }
  }, [DumpId]);
  // console.log("yo", trueSetter);

  useEffect(() => {
    if (!userLoginId) return;
    const fetchPlaces = async () => {
      const result = await axios.get(`${base_url}/pincode/fetch-pincode-rawdb`);
      console.log("place", result.data);
      setGetPresentPlace(result.data);
    };
    if (userLoginId.roleType === "Executive") {
      let obj = {};

      console.log("masterData earch", userLoginId);
      if (!filterRaw.product) {
        const stateRegion = userLoginId.masterData?.productPermissions?.flatMap(
          (item, idx) => item.region.map((stateObj) => stateObj.stateName)
        );
        const uniqueState = new Set(stateRegion);
        obj.stateArray = [...uniqueState];

        const districtRegion =
          userLoginId.masterData?.productPermissions?.flatMap((item) =>
            item.region.flatMap((stateObj) =>
              stateObj.districts.map((dist) => dist.districtName)
            )
          );
        const uniqueDistrict = new Set(districtRegion);
        obj.districtArray = [...uniqueDistrict];
        setGetPresentPlace(obj);
      } else {
        const prodRegion = userLoginId.masterData?.productPermissions?.filter(
          (item, idx) => item.productName === filterRaw.product
        );
        obj.stateArray = prodRegion[0]?.region.map(
          (stateObj, i) => stateObj.stateName
        );

        // const distFlatArray =  prodRegion[0]?.region.flatMap((stateObj,i)=> stateObj.districts.map((dist,j)=>dist.districtName)).sort()
        const distFlatArray = prodRegion[0]?.region
          .filter((stateObj, i) => stateObj.stateName === filterRaw.state)
          .flatMap((stateObj, i) =>
            stateObj.districts.map((dist) => dist.districtName)
          )
          .sort();

        console.log("distFlatArray", distFlatArray);
        obj.districtArray = distFlatArray;

        obj.excelArray = userLoginId.masterData.excelId;
        obj.pincodeArray = prodRegion[0]?.region.flatMap((stateObj, i) =>
          stateObj.districts.map((dist, j) =>
            dist.pincodes.map((pin, k) => pin.code)
          )
        );
        setGetPresentPlace(obj);
        console.log("getPresentPlace", obj);
      }
    } else {
      fetchPlaces();
    }
  }, [userLoginId, filterRaw?.product, filterRaw?.state]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const getPincode = await axios.get(
          `${base_url}/pincode/search-getplaces`,
          {
            params: {
              state: filterRaw.state,
              district: filterRaw.district,
            },
          }
        );
        const regionData = getPincode.data;
        const uniqueState = regionData.statename;
        const uniquedistrict = regionData.districtname;
        setStateList(uniqueState);
        setDistrictList(uniquedistrict);
      } catch (err) {
        console.error("Error fetching pincodes:", err);
      }
    };
    fetch();
  }, [filterRaw.state, filterRaw.district]);

  useEffect(() => {
    if (isAssignTaskMode || state?.from === "assignTask") return;

    if (!filterRawRedux || !selectedDataRedux || !selectedDataRedux.result) {
      console.log("Redux empty — you may call API here to fetch data");
      return;
    }
    if (!selectedDataRedux || Object.keys(selectedDataRedux).length === 0)
      return;

    console.log("Redux Selected Data:", selectedDataRedux);
    setFilterRaw((prev) => ({
      ...prev,
      clientType: filterRawRedux.clientType,
      state: filterRawRedux.state,
      district: filterRawRedux.district,
      clientId: filterRawRedux.clientId,
      clientName: filterRawRedux.clientName,
      mobile: filterRawRedux.mobile,
      email: filterRawRedux.email,
      opticalName: filterRawRedux.opticalName,
    }));

    // Sync Redux into local state
    if (!selectedDataRedux || !selectedDataRedux.result) return;

    console.log(
      "Redux Selected Data ready:",
      filterRawRedux,
      selectedDataRedux
    );
    setFetchedRawData({
      result: selectedDataRedux.result || [],
      totalCount: selectedDataRedux.totalCount || 0,
      page: selectedDataRedux.page || 1,
      limit: selectedDataRedux.limit || 50,
      db: selectedDataRedux.db || "",
      message: selectedDataRedux.message || "",
      counts: {
        r: selectedDataRedux.counts?.r,
        c: selectedDataRedux.counts?.c,
        u: selectedDataRedux.counts?.u,
      },
    });

    setSearchFrom(selectedDataRedux.db || "");
    setPage(selectedDataRedux.page || 1);
    setTotalPageSize(
      Math.ceil(
        (selectedDataRedux.totalCount || 0) / (selectedDataRedux.limit || 50)
      )
    );
  }, [filterRawRedux, selectedDataRedux, isAssignTaskMode]);

  //FETCHING USER PRODUCTLIST ASSIGN BY SA
  useEffect(() => {
    if (!userLoginId) return;
    const fetch = async () => {
      try {
        let result;
        let productsList;
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
          // console.log("User");
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

  const handleSearchInput = (name, value) => {
    console.log(name, value);
    if (name === "clientType") {
      setDisableSetter(value);
    }
    setFetchedRawData([]);
    setIsRemMode(false);
    setFilterRaw((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "state" && value === "") {
      setFilterRaw((prev) => ({
        ...prev,
        district: value,
      }));
    }
  };
  const handleCheckboxInput = (name, value) => {
    setFilterRaw((prev) => ({
      ...prev,
      [name]: value ? true : null,
    }));
  };

  useEffect(() => {
    if (!isRemMode) return;
    let filters;
    if (remStatus === "PENDING") {
      filters = tempRecord?.result?.filter((item) => item.status_db === false);
    } else if (remStatus === "COMPLETED") {
      filters = tempRecord?.result?.filter((item) => item.status_db === true);
    } else {
      filters = tempRecord?.result;
    }
    const data = {
      ...tempRecord,
      result: filters,
      totalCount: filters?.length,
    };
    setFetchedRawData(data);
    setSelectedClients([]);
  }, [remStatus]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await axios.get(
          `${base_url}/pincode/assign-task-pincode`,
          {
            params: { district: filterRaw.district },
          }
        );
        const pin = result.data.result;
        const pincode = pin.map((p) => ({ label: p, value: p }));
        setPincodeOptionList(pincode);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    if (filterRaw.district) {
      fetch();
    }
  }, [filterRaw.district]);

  const handleSearchData = async (pageNum = 1) => {
    if (!filterRaw.clientType) return alert("please select user");
    setIsLoading(true);
    try {
      let result;
      if (filterRaw.clientType === "ALL") {
        result = await axios.post(`${base_url}/raw-data/filters-alldb`, {
          ...filterRaw,
          page: pageNum,
          userId: userLoginId?.userId,
          masterData: userLoginId,
        });
      }
      if (filterRaw.clientType === "RAW") {
        console.log("raw");
        result = await axios.post(`${base_url}/raw-data/filters-rawdata`, {
          ...filterRaw,
          page: pageNum,
          userId: userLoginId?.userId,
          masterData: userLoginId,
        });
      }
      if (filterRaw.clientType === "CLIENT") {
        result = await axios.post(`${base_url}/clients/filter-clientdata`, {
          ...filterRaw,
          page: pageNum,
          userId: userLoginId?.userId,
          masterData: userLoginId,
        });
      }
      if (filterRaw.clientType === "USER") {
        console.log("user");
        result = await axios.post(
          `${base_url}/subscribe-user/filter-clientsubscribedata`,
          {
            ...filterRaw,
            page: pageNum,
            userId: userLoginId?.userId,
            masterData: userLoginId,
          }
        );
      }
      if (filterRaw.clientType === "REMINDER") {
        console.log("reminder");
        if (!filterRaw.dateFrom || !filterRaw.dateTo) {
          setIsLoading(false);
          return alert("Date From and To must require");
        }
        result = await axios.get(
          `${base_url}/remainders/get-assign-remainder`,
          {
            params: { ...filterRaw, page: pageNum },
          }
        );
        setTempRecord(result.data);
      }

      if (filterRaw.clientType === "EXCEL") {
        console.log("reminder");
        result = await axios.get(`${base_url}/view-excel/get-excel-record`, {
          params: {
            ...filterRaw,
            page: pageNum,
            assignTo: `${userLoginId?.userId} - ${userLoginId?.userName}`,
            roleType: userLoginId.roleType,
          },
        });
        setTempRecord(result.data);
      }

      setSearchFrom(result.data.db);
      setPage(pageNum);
      const totalPageSizes = Math.ceil(
        result.data.totalCount / result.data.limit
      );
      setFetchedRawData(result.data);
      setTotalPageSize(totalPageSizes);
      setIsMigrate(false);
      setIsDuplicate(false);
      setIsSearch(true);
      dispatch(
        setSelectedData({
          result: result.data.result,
          totalCount: result.data.totalCount,
          page: result.data.page,
          limit: result.data.limit,
          db: result.data.db,
          message: result.data.message,
          counts: {
            r: result.data?.counts?.r,
            c: result.data?.counts?.c,
            u: result.data?.counts?.u,
          },
        })
      );
      dispatch(setField({ key: "clientType", value: filterRaw.clientType }));
      handleReduxField();
    } catch (err) {
      console.log("internal error", err);
    }
    setIsLoading(false);
  };

  const handleReduxField = () => {
    if (filterRaw.clientType)
      dispatch(setField({ key: "clientType", value: filterRaw.clientType }));
    if (filterRaw.clientId)
      dispatch(setField({ key: "clientId", value: filterRaw.clientId }));
    if (filterRaw.clientName)
      dispatch(setField({ key: "clientName", value: filterRaw.clientName }));
    if (filterRaw.opticalName)
      dispatch(setField({ key: "opticalName", value: filterRaw.opticalName }));
    if (filterRaw.mobile)
      dispatch(setField({ key: "mobile", value: filterRaw.mobile }));
    if (filterRaw.email)
      dispatch(setField({ key: "email", value: filterRaw.email }));
    if (filterRaw.district)
      dispatch(setField({ key: "district", value: filterRaw.district }));
    if (filterRaw.state)
      dispatch(setField({ key: "state", value: filterRaw.state }));
  };

  const handleDuplicateData = async (onClickDuplicateButton = "false") => {
    setIsLoading(true);
    if (onClickDuplicateButton === "true") {
      await handleUndoSkip();
    }
    try {
      let result;
      if (
        filterRaw.clientId ||
        filterRaw.opticalName ||
        filterRaw.mobile ||
        filterRaw.email ||
        filterRaw.clientName ||
        filterRaw.pincode
      ) {
        result = await axios.get(
          `${base_url}/raw-data/search-duplicate-records-rawdata`,
          {
            params: { ...filterRaw },
          }
        );
        setSearchDuplicateRecord(result.data);
        setIsMigrate(false);
        setIsSearch(false);
        setIsDuplicate(false);
        setSelectedEmail([]);
        setSelectedMobile([]);
        setSelectedAddress([]);
        setSelectedOpticalName([]);
        setSelectNewDataOption([]);
        setFields(() => ({
          clientId: "",
          clientName: "",
          opticalName1: "",
          opticalName2: "",
          opticalName3: "",
          address: "",
          mobile1: "",
          mobile2: "",
          mobile3: "",
          email1: "",
          email2: "",
          email3: "",
          district: "",
          state: "",
          country: "",
          pincode: "",
        }));
      } else {
        result = await axios.get(
          `${base_url}/raw-data/duplicate-records-rawdata`,
          {
            params: {
              page: 1,
              opticalName: duplicateFilterField.opticalName,
              clientName: duplicateFilterField.clientName,
            },
          }
        );
        setTotalDuplicateRecordCont(result.data.totalDuplicateRecord);
        setDuplicateRecord(result.data);
        setIsMigrate(false);
        setIsSearch(false);
        setIsSearchDuplicate(false);
      }
    } catch (err) {
      console.log("internal error", err);
    }
    setOpenDuplicateFieldPopup(false);
    setIsLoading(false);
  };

  // COPY OF DUPLICATE RECORD FOR FINDING ALL DUPLICATE IN RAW DB
  // const handleDuplicateData = async () => {
  //   setIsLoading(true);
  //   try {
  //     let result;
  //     if (
  //       filterRaw.opticalName ||
  //       filterRaw.mobile ||
  //       filterRaw.email ||
  //       filterRaw.clientName ||
  //       filterRaw.pincode
  //     ) {
  //       result = await axios.get(
  //         `http://localhost:3000/raw-data/search-duplicate-records-rawdata`,
  //         {
  //           params: { ...filterRaw },
  //         }
  //       );
  //       console.log("duplicatre hai bhia", result.data);
  //       setSearchDuplicateRecord(result.data);
  //       setIsMigrate(false);
  //       setIsSearch(false);
  //       setIsDuplicate(false);
  //       setSelectedEmail([]);
  //       setSelectedMobile([]);
  //       setSelectedAddress([]);
  //       setSelectedOpticalName([]);
  //       setSelectNewDataOption([]);
  //       setFields(() => ({
  //         clientId: "",
  //         clientName: "",
  //         opticalName1: "",
  //         opticalName2: "",
  //         opticalName3: "",
  //         address: "",
  //         mobile1: "",
  //         mobile2: "",
  //         mobile3: "",
  //         email1: "",
  //         email2: "",
  //         email3: "",
  //         district: "",
  //         state: "",
  //         country: "",
  //         pincode: "",
  //       }));
  //     } else {
  //       result = await axios.get(
  //         `http://localhost:3000/raw-data/duplicate-records-rawdata`,
  //         {
  //           params: { page: 1 },
  //         }
  //       );
  //       console.log("duplicate", result.data);
  //       console.log("total count", result.data.totalCounts[0]?.totalGroups);
  //       setTotalDuplicateRecordCont(result.data.totalCounts[0]?.totalGroups);
  //       setDuplicateRecord(result.data);
  //       setIsMigrate(false);
  //       setIsSearch(false);
  //       setIsSearchDuplicate(false);
  //     }
  //   } catch (err) {
  //     console.log("internal error", err);
  //   }
  //   setIsLoading(false);
  // };

  const handleSelectAll = () => {
    if (selectedClients.length === fetchedRawData.result?.length) {
      setSelectedClients([]);
    } else {
      const allClientIds = fetchedRawData?.result.map((item) => item.client_id);
      setSelectedClients(allClientIds);
    }
  };

  const handleViewExcelSelectAll = () => {
    if (selectedClients.length === excelData?.length) {
      setSelectedClients([]);
    } else {
      // console.log("excelmap",excelData?.map((item) => item.ClientId))
      const allViewClientIds = excelData?.map((item) => item.client_id);
      setSelectedClients(allViewClientIds);
    }
  };
  const handleCheckboxChange = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter((id) => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
    console.log("clientId", clientId);
    console.log("selectedClient", selectedClients);
  };

  const handleRedirectClient = () => {
    try {
      if (selectedClients.length === 0) {
        return alert("Please select at least one client");
      }
      if (filterRaw.clientType === "ALL") {
        navigate("/client-page", {
          state: { selectedClients, from: "searchClient" },
        });
      }
      if (filterRaw.clientType === "CLIENT" || filterRaw.clientType === "RAW") {
        navigate("/client-page", {
          state: { selectedClients, from: "searchClient" },
        });
      }
      if (filterRaw.clientType === "USER") {
        navigate("/userpage", {
          state: { selectedClients, from: "searchClient" },
        });
      }
      if (excelData.length > 0) {
        navigate("/client-page", {
          state: { selectedClients, from: "searchClient" },
        });
      }
      console.log("jump to client page");
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleFieldsChange = (name, value) => {
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchDuplicateMergeAndDelete = async () => {
    try {
      if (
        !fields.clientId &&
        !fields.mobile1 &&
        !fields.clientName &&
        !fields.opticalName1 &&
        !fields.address1
      ) {
        return alert("Please select checkboxes");
      }
      const result = await axios.post(
        `${base_url}/raw-data/mergeanddelete`,
        { ...fields, selectedClients },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("merge successfully", result.data);
      alert(result.data.message);
      await handleDuplicateData("false");
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleDeactivate = async (clientId, db) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to deactivate this record?"
    );
    if (!isConfirmed) return;
    try {
      let result;
      if (db === "Raw") {
        result = await axios.put(
          `${base_url}/raw-data/deactivate-rawdata/${clientId}`
        );
      } else if (db === "Client") {
        result = await axios.put(
          `${base_url}/clients/deactivate-client/${clientId}`
        );
      } else if (db === "User") {
        result = await axios.put(
          `${base_url}/subscribe-user/deactivate-user/${clientId}`
        );
      }
      console.log("result", result);
      alert(result.data.message);
      await handleSearchData();
      setSelectedClients([]);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleActivate = async (clientId, db) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to Activate this record?"
    );
    if (!isConfirmed) return;
    try {
      let result;
      if (db === "Raw") {
        result = await axios.put(
          `${base_url}/raw-data/activate-rawdata/${clientId}`
        );
      } else if (db === "Client") {
        result = await axios.put(
          `${base_url}/clients/activate-client/${clientId}`
        );
      } else if (db === "User") {
        result = await axios.put(
          `${base_url}/subscribe-user/activate-user/${clientId}`
        );
      }
      alert(result.data.message);
      await handleSearchData();
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleDuplicateDelete = async (clientId, db) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!isConfirmed) return;
    try {
      let result;
      if (db === "Raw") {
        result = await axios.put(
          `${base_url}/raw-data/deactivate-rawdata/${clientId}`
        );
      }
      alert(result.data.message);
      await handleDuplicateData("false");
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleAllMergeAndDelete = async (clientId) => {
    try {
      const result = await axios.post(
        `${base_url}/raw-data/duplicate-mergedelete`,
        { selectedClients: selectedClients, mergeId: clientId }
      );
      await handleDuplicateData();
      alert(result.data.message);
      setSelectedClients([]);
    } catch (err) {
      console.log("intenal error", err);
      if (
        err &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        alert(err.response.data.message);
      }
    }
  };
  const handleSelectAllMergeDelete = (index) => {
    setGroupIndexTracker(index);
    if (selectedClients.length === duplicateRecord?.arr[index]?.length) {
      setSelectedClients([]);
    } else {
      const clientId = duplicateRecord?.arr[index]?.map(
        (item) => item.client_id
      );
      setSelectedClients(clientId);
    }
  };

  const handleAndMergeInThreeDB = async (pageNum = 1) => {
    setIsLoading(true);
    setPage(pageNum);
    try {
      const result = await axios.get(`${base_url}/raw-data/mergefrom-alldb`, {
        params: { page: pageNum },
      });
      console.log("result", result.data);
      setDuplicateCheckerThreeDB(result.data);
      setIsLoading(false);
      setIsDuplicate(false);
      setIsSearch(false);
      setTotalPageSize(result.data.totalPage);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  // console.log("seelect client", selectedClients);


  // const handleExcelDownload = async () => {
  //   if (!fetchedRawData.result) {
  //     return alert("please filter first");
  //   }
  //   try {
  //     const url = "http://localhost:3000/utils/excel-download";
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         dataArray: fetchedRawData.result,
  //         sheetName: filterRaw.state,
  //       }),
  //     });

  //     const blob = await response.blob();
  //     console.log("blob",blob)
  //     const urls = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = urls;
  //     link.setAttribute("download", `${filterRaw.state || "Excel"}Sheet.xlsx`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (err) {
  //     console.log("internal error", err);
  //   }
  // };

  const handleExcelDownload = async () => {
    if (!fetchedRawData.result) {
      return alert("please filter first");
    }
    if (!filterRaw.clientType || !filterRaw.state) {
      // return alert("please select USER type and State")
    }
    setIsLoading(true);
    try {
      
      const url = `${base_url}/utils/excel-download`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          database: filterRaw.clientType,
           ...filterRaw
        }),
      });
      const blob = await response.blob();
      console.log(blob)
      const urls = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urls;
      link.setAttribute("download", `${filterRaw.state || "Excel"}Sheet.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log("internal error", err);
    }finally{
      setIsLoading(false) 
    }
  };

  const handleViewExcelSheet = async (dumpId) => {
    console.log("dumpId", dumpId, isLoading);
    try {
      const result = await axios.get(
        `${base_url}/raw-data/excel-data/${dumpId}`
      );

      console.log("jsonData", result.data);
      setExcelData(result.data.result);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleUpdateInput = (name, value) => {
    console.log(name, value);
    setNewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hanldeCheckBoxforEmail = (e, key, email) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (selectedEmail.length >= 3) {
        alert("You can only select up to 3 emails");
        return;
      }
      const updatedEmails = [...selectedEmail, { key, email }];
      setSelectedEmail(updatedEmails);
      setNewData((prev) => ({
        ...prev,
        email1: updatedEmails[0]?.email || "",
        email2: updatedEmails[1]?.email || "",
        email3: updatedEmails[2]?.email || "",
      }));
    } else {
      const updatedEmails = selectedEmail.filter((item) => item.key !== key);
      setSelectedEmail(updatedEmails);
      setNewData((prev) => ({
        ...prev,
        email1: updatedEmails[0]?.email || "",
        email2: updatedEmails[1]?.email || "",
        email3: updatedEmails[2]?.email || "",
      }));
    }
  };

  const handleCheckBoxForMobile = (e, key, phone) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (selectedMobile.length >= 3) {
        alert("You can only select up to 3 mobiles");
        return;
      }
      const updatedMobile = [...selectedMobile, { key, phone }];
      setSelectedMobile(updatedMobile);
      setNewData((prev) => ({
        ...prev,
        mobile1: updatedMobile[0]?.phone || "",
        mobile2: updatedMobile[1]?.phone || "",
        mobile3: updatedMobile[2]?.phone || "",
      }));
    } else {
      const updatedMobile = selectedMobile.filter((item) => item.key !== key);
      setSelectedMobile(updatedMobile);
      setNewData((prev) => ({
        ...prev,
        mobile1: updatedMobile[0]?.phone || "",
        mobile2: updatedMobile[1]?.phone || "",
        mobile3: updatedMobile[2]?.phone || "",
      }));
    }
  };
  const handleCheckBoxforOpticalName = (e, key, opticalName) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (selectedOpticalName.length >= 3) {
        return alert("You can only select up to 3 opticalName");
      }

      const updatedOpticalName = [...selectedOpticalName, { key, opticalName }];
      setSelectedOpticalName(updatedOpticalName);
      setNewData((prev) => ({
        ...prev,
        opticalName1: updatedOpticalName[0]?.opticalName || "",
        opticalName2: updatedOpticalName[1]?.opticalName || "",
        opticalName3: updatedOpticalName[2]?.opticalName || "",
      }));
    } else {
      const updatedOpticalName = selectedOpticalName.filter(
        (item) => item.key !== key
      );
      setSelectedOpticalName(updatedOpticalName);
      setNewData((prev) => ({
        ...prev,
        opticalName1: updatedOpticalName[0]?.opticalName || "",
        opticalName2: updatedOpticalName[1]?.opticalName || "",
        opticalName3: updatedOpticalName[2]?.opticalName || "",
      }));
    }
  };
  const handleSearchDuplicateCheckBoxforOpticalName = (e, key, opticalName) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (selectedOpticalName.length >= 3) {
        return alert("You can only select up to 3 opticalName");
      }

      const updatedOpticalName = [...selectedOpticalName, { key, opticalName }];
      setSelectedOpticalName(updatedOpticalName);
      setFields((prev) => ({
        ...prev,
        opticalName1: updatedOpticalName[0]?.opticalName || "",
        opticalName2: updatedOpticalName[1]?.opticalName || "",
        opticalName3: updatedOpticalName[2]?.opticalName || "",
      }));
    } else {
      const updatedOpticalName = selectedOpticalName.filter(
        (item) => item.key !== key
      );
      setSelectedOpticalName(updatedOpticalName);
      setFields((prev) => ({
        ...prev,
        opticalName1: updatedOpticalName[0]?.opticalName || "",
        opticalName2: updatedOpticalName[1]?.opticalName || "",
        opticalName3: updatedOpticalName[2]?.opticalName || "",
      }));
    }
  };

  const handleSearchDuplicateCheckBoxforEmail = (e, key, email) => {
    const isChecked = e.target.checked;
    console.log(isChecked, key, email);
    if (isChecked) {
      if (selectedEmail.length >= 3) {
        return alert("You can only select upto 3 Emails");
      }
      const updatedEmails = [...selectedEmail, { key, email }];
      setSelectedEmail(updatedEmails);
      setFields((prev) => ({
        ...prev,
        email1: updatedEmails[0]?.email || "",
        email2: updatedEmails[1]?.email || "",
        email3: updatedEmails[2]?.email || "",
      }));
    } else {
      const updatedEmails = selectedEmail.filter((item) => item.key !== key);
      setSelectedEmail(updatedEmails);
      setFields((prev) => ({
        ...prev,
        email1: updatedEmails[0]?.email || "",
        email2: updatedEmails[1]?.email || "",
        email3: updatedEmails[2]?.email || "",
      }));
    }
  };
  const handleSearchDuplicateCheckBoxforMobile = (e, key, mobile) => {
    const isChecked = e.target.checked;
    console.log(isChecked, key, mobile);
    if (isChecked) {
      if (selectedMobile.length >= 3) {
        return alert("You can only select upto 3 Mobiles");
      }
      const updatedMobiles = [...selectedMobile, { key, mobile }];
      setSelectedMobile(updatedMobiles);
      setFields((prev) => ({
        ...prev,
        mobile1: updatedMobiles[0]?.mobile || "",
        mobile2: updatedMobiles[1]?.mobile || "",
        mobile3: updatedMobiles[2]?.mobile || "",
      }));
    } else {
      const updatedMobiles = selectedMobile.filter((item) => item.key !== key);
      setSelectedMobile(updatedMobiles);
      setFields((prev) => ({
        ...prev,
        mobile1: updatedMobiles[0]?.mobile || "",
        mobile2: updatedMobiles[1]?.mobile || "",
        mobile3: updatedMobiles[2]?.mobile || "",
      }));
    }
  };
  const handleSearchDuplicateCheckBoxforAddress = (e, key, address) => {
    const isChecked = e.target.checked;
    console.log(isChecked, key, address);
    if (isChecked) {
      if (selectedAddress.length >= 3) {
        return alert("You can only select upto 3 Address");
      }
      const updatedAddress = [...selectedAddress, { key, address }];
      setSelectedAddress(updatedAddress);
      setFields((prev) => ({
        ...prev,
        address1: updatedAddress[0]?.address || "",
        address2: updatedAddress[1]?.address || "",
        address3: updatedAddress[2]?.address || "",
      }));
    } else {
      const updatedAddress = selectedAddress.filter((item) => item.key !== key);
      setSelectedMobile(updatedAddress);
      setSelectedAddress(updatedAddress);
      setFields((prev) => ({
        ...prev,
        address1: updatedAddress[0]?.address || "",
        address2: updatedAddress[1]?.address || "",
        address3: updatedAddress[2]?.address || "",
      }));
    }
  };
  const handleSelectNewDataOption = (e, clientId, index) => {
    const isChecked = e.target.checked;
    const totalCount =
      duplicateCheckerThreeDB.duplicates[index].fuzzyClientCount +
      duplicateCheckerThreeDB.duplicates[index].fuzzySubscriptionCount +
      duplicateCheckerThreeDB.duplicates[index].rawCount;
    console.log("totalcont", index);
    if (isChecked) {
      const updatedValue = [...selectNewDataOption, clientId];
      setSelectNewDataOption(updatedValue);
    } else {
      const updatedValue = selectNewDataOption.filter(
        (item) => item !== clientId
      );
      setSelectNewDataOption(updatedValue);
    }
  };

  const handleSelectClient = (e, clientId, grpIdx) => {
    setGroupIndexTracker(grpIdx);
    const isChecked = e.target.checked;
    if (isChecked) {
      const updatedId = [...selectedClients, clientId];
      setSelectedClients(updatedId);
    } else {
      const updatedId = selectedClients.filter((item) => item !== clientId);
      setSelectedClients(updatedId);
    }
  };
  const handleNewUpdateData = async () => {
    try {
      console.log(newData, selectNewDataOption);
      const result = await axios.post(
        `${base_url}/clients/updateclient-merge-delete`,
        {
          newData,
          selectNewDataOption,
          userId: userLoginId?.userId,
        }
      );
      const deleteIds = selectNewDataOption.filter(
        (item) => item !== newData.clientId
      );
      const recordTracker = {
        totalCount_db: selectNewDataOption.length,
        mergeCount_db: 1,
        mergeId_db: newData.clientId,
        deletedCount_db: deleteIds.length,
        deleteId_db: deleteIds,
      };
      const resultRecordTracker = await axios.put(
        `${base_url}/view-excel/recordtracker`,
        {
          userId: userLoginId?.userId,
          recordTracker: recordTracker,
        }
      );
      console.log("result", resultRecordTracker.data);
      alert(result.data.message);
      alert(resultRecordTracker.data.message);
      handleAndMergeInThreeDB(1);
    } catch (err) {
      console.log("internal error", err);
      if (
        err &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        alert(err.response.data.message);
      }
    }
  };

  const handleSkipIds = async (grpIndex, group) => {
    const idsInThisGroup = group
      .filter((item) => selectedClients.includes(item.client_id))
      .map((item) => item.client_id);

    if (idsInThisGroup.length === 0) {
      alert("Please select clients in this group");
      return;
    }

    if (grpIndex !== groupIndexTracker) {
      alert("Please select Valid group");
      setSelectedClients([]);
      return;
    }
    if (group.length !== selectedClients.length) {
      alert("Please select group");
      setSelectedClients([]);
      return;
    }
    try {
      const result = await axios.post(
        `${base_url}/raw-data/skip-ids`,
        {
          selectedClientId: selectedClients,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert(result.data.message);
      handleDuplicateData("false");
      setSelectedClients([]);
      setGroupIndexTracker(null);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleUndoSkip = async () => {
    try {
      const result = await axios.get(`${base_url}/raw-data/undo-skip`);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  // const handleSkipIds = (grpIndex) => {
  //   console.log("index", grpIndex);
  //   console.log("duplicateRecord", duplicateRecord);
  //   const temp = [...duplicateRecord.arr];
  //   console.log("temp", temp[grpIndex]);
  //   temp[grpIndex] = temp[grpIndex].filter(
  //     (item) => !selectedClients.includes(item.client_id)
  //   );
  //   // console.log("temp after",temp[grpIndex])
  //   const updatedData = {
  //     ...duplicateRecord, // keep message, totalDuplicateRecord, totalRawRecordCount
  //     arr: temp, // replace arr with updated array
  //   };
  //   console.log("updatedData ", updatedData);

  //   setDuplicateRecord(updatedData);

  //   setSelectedClients([]);
  // };

  const handleChangePincodeSelectOption = (selectedOption) => {
    setSelectPincodeOption(selectedOption);
    setFilterRaw((prev) => ({
      ...prev,
      pincode: selectedOption.map((item) => item.value),
    }));
  };

  const handleAssignTask = async () => {
    try {
      const result = await axios.post(
        `${base_url}/task/task-assign`,
        {
          assignBy: userLoginId?.userId,
          assignTo: assignTaskUserId,
          taskType: filterRaw.clientType,
          selectedClients: selectedClients,
          target: state.target,
          taskMode: state.taskMode,
          productRange: state.userProduct,
          date: state.date,
          deadline: state.deadline,
          district: filterRaw.district,
          state: filterRaw.state,
          pincode: filterRaw.pincode,
          excelId:
            filterRaw.clientType === "EXCEL"
              ? { title: selectedExcelName, excelId: selectedClients }
              : { title: "NA", excelId: "NA" },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (result.data.askConfirmation) {
        const confirm = window.confirm(
          `${result.data.message} Do you want to assign it again?`
        );
        if (confirm) {
          const forceResult = await axios.post(
            `${base_url}/task/task-assign`,
            {
              assignBy: userLoginId?.userId,
              assignTo: assignTaskUserId,
              taskType: filterRaw.clientType,
              selectedClients: selectedClients,
              target: state.target,
              taskMode: state.taskMode,
              productRange: state.userProduct,
              date: state.date,
              deadline: state.deadline,
              district: filterRaw.district,
              state: filterRaw.state,
              pincode: filterRaw.pincode,
              excelId:
                filterRaw.clientType === "EXCEL"
                  ? { title: selectedExcelName, excelId: selectedClients }
                  : { title: "NA", excelId: "NA" },
              forceAssign: true,
            },
            { headers: { "Content-Type": "application/json" } }
          );
          alert(forceResult.data.message);
        }
      } else {
        alert(result.data.message);
      }
      console.log("Task Assign Successfully", result);
    } catch (err) {
      console.log("internal error", err);
      // setMsg(err.response.data.message);
    }
    dispatch(resetAll());
  };

  const handleRawDataDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!isConfirmed) return;
    try {
      let result;
      if (filterRaw.clientType === "RAW") {
        result = await axios.delete(`${base_url}/raw-data/delete-allrawId`, {
          data: { selectedClients },
        });
      } else if (filterRaw.clientType === "CLIENT") {
        result = await axios.delete(`${base_url}/clients/delete-allclientIds`, {
          data: { selectedClients },
        });
      }

      alert(result.data.message);
      await handleSearchData();
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleDupliateFilterField = (e, name) => {
    const isCheck = e.target.checked;
    setDuplicateFilterField((p) => ({
      ...p,
      [name]: isCheck,
    }));
  };

  const handleReset = () => {
    setFilterRaw((p) => ({
      ...p,
      clientType: "",
      clientId: "",
      clientName: "",
      opticalName: "",
      address: "",
      mobile: "",
      email: "",
      district: "",
      state: "",
      country: "",
      hot: null,
      followUp: null,
      demo: null,
      installation: null,
      amc: null,
      product: "",
      defaulter: null,
      recovery: null,
      lost: null,
      deactivate: null,
      dateFrom: "",
      dateTo: "",
      pincode: "",
      userId: "",
    }));

    setFields({
      clientId: "",
      clientName: "",
      opticalName1: "",
      opticalName2: "",
      opticalName3: "",
      address1: "",
      address2: "",
      address3: "",
      mobile1: "",
      mobile2: "",
      mobile3: "",
      email1: "",
      email2: "",
      email3: "",
      district: "",
      state: "",
      country: "",
      pincode: [],
    });
    setSelectedClients([]);
    setDuplicateRecord([])
    setFetchedRawData([])
    handleSearchDuplicateCancel()
    handleFetchRawDataClose()
    handleDuplicateRecordClose()
    setIsLoading(false);
    dispatch(resetAll());
  };

    const handleSearchDuplicateCancel = () => {
    setSearchDuplicateRecord([]);
    setSelectedClients([]);
  };
  const handleFetchRawDataClose = () => {
    setFetchedRawData([]);
    setTempRecord([]);
    setTempCount({ raw: 0, client: 0, user: 0 });
    setSelectedClients([]);
    dispatch(resetAll());
  };
  const handleDuplicateRecordClose = () => {
    setDuplicateRecord([]);
    setSelectedClients([]);
    setDuplicateCheckerThreeDB([]);
    setSelectNewDataOption([]);
    setNewData([]);
    setSelectedEmail([]);
    setSelectedMobile([]);
    setSelectedOpticalName([]);
  };

  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <div className={styles.headers}>
          {!isAssignTaskMode ? (
            <h2>Search Page</h2>
          ) : (
            <h2 style={{ background: "", padding: "2px" }}>
              Task Mode On :{" "}
              <span style={{ background: "", padding: "2px", color: "red" }}>
                {assignTaskUserId}
              </span>
            </h2>
          )}
        </div>
        <div className={styles.menu}>
          <IoMenu
            className={styles.menuicon}
            onClick={() => {
              setToggleMenu((prev) => !prev);
            }}
          />
        </div>
        <div className={`${styles.filters} ${toggleMenu ? styles.open : ""}`}>
          <span className={styles.fields}>
            <h4
              id={styles.moreFilter}
              onClick={() => {
                setOpenSlide((prev) => !prev);
              }}
            >
              More Filters
            </h4>
          </span>
          <span className={styles.fields}></span>
          <span className={styles.fields}>
            <label htmlFor="product">Database Type </label>
            <select
              name=""
              id=""
              value={filterRaw.clientType}
              className={styles["custom-input"]}
              onChange={(e) => {
                handleSearchInput("clientType", e.target.value);
              }}
            >
              <option value="">--select</option>
              <option value="ALL">ALL</option>
              <option value="RAW">RAW</option>
              <option value="CLIENT">CLIENT</option>
              <option value="USER">USER</option>
              <option value="REMINDER">REMINDER</option>
              <option value="EXCEL">EXCEL</option>
            </select>
          </span>

          <span className={styles.fields}>
            <label htmlFor="product">Product </label>
            <select
              name=""
              id=""
              value={filterRaw.product}
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              onChange={(e) => {
                handleSearchInput("product", e.target.value);
              }}
            >
              <option value="">--select</option>
              {userProductList.map((item, idx) => (
                <option value={item.label} key={idx}>
                  {item.label}
                </option>
              ))}
            </select>
          </span>
          <span className={styles.fields}>
            <label htmlFor="">From</label>
            <input
              type="date"
              value={filterRaw.dateFrom}
              onChange={(e) => {
                handleSearchInput("dateFrom", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">To</label>
            <input
              type="date"
              value={filterRaw.dateTo}
              className={styles["filterfield-input"]}
              onChange={(e) => {
                handleSearchInput("dateTo", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Country</label>
            <select
              name=""
              id=""
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              value={filterRaw.country}
              onChange={(e) => {
                handleSearchInput("country", e.target.value);
              }}
            >
              <option value="">--select--</option>
              {getPresentPlace.countryArray?.map((list) => (
                <>
                  <option value={list}>{list}</option>
                </>
              ))}
            </select>
          </span>
          <span className={styles.fields}>
            <label htmlFor="product">Client Id </label>
            <input
              type="text"
              value={filterRaw.clientId}
              className={styles["filterfield-input"]}
              onChange={(e) => {
                handleSearchInput("clientId", e.target.value);
              }}
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Shop Name</label>
            <input
              type="text"
              value={filterRaw.opticalName}
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              onChange={(e) => {
                handleSearchInput("opticalName", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Mobile</label>
            <input
              className={styles["custom-input"]}
              type="text"
              value={filterRaw.mobile}
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              onChange={(e) => {
                handleSearchInput("mobile", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Client Name</label>
            <input
              type="text"
              value={filterRaw.clientName}
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              onChange={(e) => {
                handleSearchInput("clientName", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Place</label>
            <input
              type="text"
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              value={filterRaw.address}
              onChange={(e) => {
                handleSearchInput("address", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Email</label>
            <input
              type="email"
              disabled={
                disableSetter === "EXCEL" || disableSetter === "REMINDER"
              }
              value={filterRaw.email}
              onChange={(e) => {
                handleSearchInput("email", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">State</label>
            <select
              name=""
              id=""
              disabled={disableSetter === "REMINDER"}
              value={filterRaw.state}
              onChange={(e) => {
                handleSearchInput("state", e.target.value);
              }}
            >
              <option value="">--select--</option>
              {getPresentPlace.stateArray?.map((list) => (
                <>
                  <option value={list}>{list}</option>
                </>
              ))}
            </select>
          </span>
          <span className={styles.fields}>
            <label htmlFor="">District</label>
            <select
              name=""
              id=""
              disabled={disableSetter === "REMINDER"}
              value={filterRaw.district}
              onChange={(e) => {
                handleSearchInput("district", e.target.value);
              }}
            >
              <option value="">--select--</option>
              {getPresentPlace.districtArray?.map((list) => (
                <>
                  <option value={list}>{list}</option>
                </>
              ))}
            </select>
          </span>

          <span className={styles.fields}>
            <label htmlFor="pincode">Pincode </label>
            {isAssignTaskMode ? (
              <CustomSelect
                options={pincodeOptionList}
                value={selectPincodeOption}
                isMulti={true}
                onChange={handleChangePincodeSelectOption}
              />
            ) : (
              <input
                type="text"
                id="pincode"
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                value={filterRaw.pincode}
                onChange={(e) => {
                  handleSearchInput("pincode", e.target.value);
                }}
              />
            )}
          </span>
        </div>
        <div className={styles.minorfielddiv}>
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="hot">Hot</label>
              <input
                type="checkbox"
                id="hot"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.hot === true}
                onChange={(e) => {
                  handleCheckboxInput("hot", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="followup">Follow Up</label>
              <input
                type="checkbox"
                id="followup"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.followUp === true}
                onChange={(e) => {
                  handleCheckboxInput("followUp", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="demo">Demo</label>
              <input
                type="checkbox"
                id="demo"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.demo === true}
                onChange={(e) => {
                  handleCheckboxInput("demo", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="installation">Installation/ Hosting</label>
              <input
                type="checkbox"
                id="installation"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.installation === true}
                onChange={(e) => {
                  handleCheckboxInput("installation", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="installation">AMC</label>
              <input
                type="checkbox"
                id="amc"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.amc === true}
                onChange={(e) => {
                  handleCheckboxInput("amc", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="defaulter">Defaulter</label>
              <input
                type="checkbox"
                id="defaulter"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.defaulter === true}
                onChange={(e) => {
                  handleCheckboxInput("defaulter", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="recovery">Recovery</label>
              <input
                type="checkbox"
                id="recovery"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.recovery === true}
                onChange={(e) => {
                  handleCheckboxInput("recovery", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="lost">Lost</label>
              <input
                type="checkbox"
                id="lost"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.lost === true}
                onChange={(e) => {
                  handleCheckboxInput("lost", e.target.checked);
                }}
              />
            </span>
          )}
          {openSlide && (
            <span className={styles.minorfields}>
              <label htmlFor="deactivate">Deactivate</label>
              <input
                type="checkbox"
                id="deactivate"
                className={styles["checkbox-input"]}
                disabled={
                  disableSetter === "EXCEL" || disableSetter === "REMINDER"
                }
                checked={filterRaw.deactivate === true}
                onChange={(e) => {
                  handleCheckboxInput("deactivate", e.target.checked);
                }}
              />
            </span>
          )}
        </div>

        {/* <div className={`${styles.filters} ${toggleMenu ? styles.open : ""}`}>
          <span className={styles.fields}>
            <label htmlFor="">Shop Name</label>
            <input
              type="text"
              value={filterRaw.opticalName}
              onChange={(e) => {
                handleSearchInput("opticalName", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Mobile</label>
            <input
              className={styles["custom-input"]}
              type="text"
              value={filterRaw.mobile}
              onChange={(e) => {
                handleSearchInput("mobile", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Client Name</label>
            <input
              type="text"
              value={filterRaw.clientName}
              onChange={(e) => {
                handleSearchInput("clientName", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Place</label>
            <input
              type="text"
              value={filterRaw.address}
              onChange={(e) => {
                handleSearchInput("address", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Email</label>
            <input
              type="email"
              value={filterRaw.email}
              onChange={(e) => {
                handleSearchInput("email", e.target.value);
              }}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">State</label>
            <select
              name=""
              id=""
              value={filterRaw.state}
              onChange={(e) => {
                handleSearchInput("state", e.target.value);
              }}
            >
              <option value="">--select--</option>
              {getPresentPlace.stateArray?.map((list) => (
                <>
                  <option value={list}>{list}</option>
                </>
              ))}
            </select>
          </span>
          <span className={styles.fields}>
            <label htmlFor="">District</label>
            <select
              name=""
              id=""
              value={filterRaw.district}
              onChange={(e) => {
                handleSearchInput("district", e.target.value);
              }}
            >
              <option value="">--select--</option>
              {getPresentPlace.districtArray?.map((list) => (
                <>
                  <option value={list}>{list}</option>
                </>
              ))}
            </select>
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Country</label>
            <select
              name=""
              id=""
              value={filterRaw.country}
              onChange={(e) => {
                handleSearchInput("country", e.target.value);
              }}
            >
              <option value="">--select--</option>
              {getPresentPlace.countryArray?.map((list) => (
                <>
                  <option value={list}>{list}</option>
                </>
              ))}
            </select>
          </span>
        </div> */}
        {/* {openSlide && (
          <div className={styles.filters}>
            <span className={styles.minorfields}>
              <label htmlFor="hot">Hot</label>
              <input
                type="checkbox"
                id="hot"
                className={styles["checkbox-input"]}
                checked={filterRaw.hot === true}
                onChange={(e) => {
                  handleCheckboxInput("hot", e.target.checked);
                }}
              />
            </span>
            <span className={styles.minorfields}>
              <label htmlFor="followup">Follow Up</label>
              <input
                type="checkbox"
                id="followup"
                className={styles["checkbox-input"]}
                checked={filterRaw.followUp === true}
                onChange={(e) => {
                  handleCheckboxInput("followUp", e.target.checked);
                }}
              />
            </span>
            <span className={styles.minorfields}>
              <label htmlFor="demo">Demo</label>
              <input
                type="checkbox"
                id="demo"
                className={styles["checkbox-input"]}
                checked={filterRaw.demo === true}
                onChange={(e) => {
                  handleCheckboxInput("demo", e.target.checked);
                }}
              />
            </span>
            <span className={styles.minorfields}>
              <label htmlFor="installation">Installation</label>
              <input
                type="checkbox"
                id="installation"
                className={styles["checkbox-input"]}
                checked={filterRaw.installation === true}
                onChange={(e) => {
                  handleCheckboxInput("installation", e.target.checked);
                }}
              />
            </span>

            <span className={styles.minorfields}>
              <label htmlFor="defaulter">Defaulter</label>
              <input
                type="checkbox"
                id="defaulter"
                className={styles["checkbox-input"]}
                checked={filterRaw.defaulter === true}
                onChange={(e) => {
                  handleCheckboxInput("defaulter", e.target.checked);
                }}
              />
            </span>
            <span className={styles.minorfields}>
              <label htmlFor="recovery">Recovery</label>
              <input
                type="checkbox"
                id="recovery"
                className={styles["checkbox-input"]}
                checked={filterRaw.recovery === true}
                onChange={(e) => {
                  handleCheckboxInput("recovery", e.target.checked);
                }}
              />
            </span>
            <span className={styles.minorfields}>
              <label htmlFor="lost">Lost</label>
              <input
                type="checkbox"
                id="lost"
                className={styles["checkbox-input"]}
                checked={filterRaw.lost === true}
                onChange={(e) => {
                  handleCheckboxInput("lost", e.target.checked);
                }}
              />
            </span>
            <span className={styles.fields}>
              <label htmlFor="pincode">Pincode </label>
              <input
                type="text"
                id="pincode"
                value={filterRaw.pincode}
                onChange={(e) => {
                  handleSearchInput("pincode", e.target.value);
                }}
              />
            </span>
          </div>
        )} */}
      </div>
      <div className={styles.btn}>
        {!isAssignTaskMode && (
          <button
            onClick={() => {
              handleReset();
            }}
          >
            Reset
          </button>
        )}
        {!isAssignTaskMode && <button>Print</button>}
        {!isAssignTaskMode && (
          <button onClick={handleExcelDownload}>Excel</button>
        )}
        {!isAssignTaskMode && (
          <button onClick={handleRedirectClient}>View</button>
        )}
        <button
          onClick={() => {
            handleSearchData();
            setIsSearch(true);
          }}
        >
          Search
        </button>

        {!isAssignTaskMode && (
          <button
            onClick={() => {
              handleAndMergeInThreeDB(1);
              setIsMigrate(true);
            }}
          >
            Migrate
          </button>
        )}
        {!isAssignTaskMode && (
          <button
            onClick={() => {
              setIsDuplicate(true);
              setIsSearchDuplicate(true);
              setOpenDuplicateFieldPopup(true);
            }}
          >
            Duplicate Tracker
          </button>
        )}
        {openDuplicateFieldPopup && (
          <div className={styles["duplicate-popup"]}>
            <div className={styles["duplicate-content"]}>
              <h3 className={styles.headers}>Duplicate Filters</h3>
              <div className={styles["duplicate-filters"]}>
                <label htmlFor="">
                  <input
                    type="checkbox"
                    checked={!!duplicateFilterField.opticalName}
                    onChange={(e) => {
                      handleDupliateFilterField(e, "opticalName");
                    }}
                  />{" "}
                  Optical Name
                </label>
                <label htmlFor="">
                  <input
                    type="checkbox"
                    checked={!!duplicateFilterField.clientName}
                    onChange={(e) => {
                      handleDupliateFilterField(e, "clientName");
                    }}
                  />{" "}
                  Client Name
                </label>
                <label htmlFor="">
                  <input type="checkbox" disabled checked={true} /> Mobile
                </label>
                <label htmlFor="">
                  <input type="checkbox" disabled checked={true} /> Email
                </label>
                <label htmlFor="">
                  <input type="checkbox" disabled checked={true} /> Pincode
                </label>
              </div>
              <h5>
                Note: Duplicate works on Optical Name, Client Name, Mobile,
                Email, Pincode{" "}
              </h5>
              <div className={styles.closediv}>
                <button
                  onClick={() => {
                    handleDuplicateData("true");
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
        {isAssignTaskMode && selectedClients.length > 0 && (
          <button
            onClick={() => {
              handleAssignTask();
            }}
          >
            Assign Task
          </button>
        )}
      </div>

      <div className={styles["content-body"]}>
        {/* SEARCHING EXCEL*/}
        {!isLoading &&
          filterRaw.clientType === "EXCEL" &&
          fetchedRawData.result?.length > 0 && (
            <div className={styles.tablediv}>
              <div className={styles["table-heading"]}>
                <h2 className={styles["heading-text"]}>{searchFrom}</h2>
              </div>
              <div className={styles["table-subheading"]}>
                <h4>Total Record Found : {fetchedRawData.result.length}</h4>
                {/* <select name="" id="" value={remStatus} onChange={(e)=>{setRemStatus(e.target.value)}}>
                <option value="ALL">All</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
              </select> */}
                <div className={styles.pagebtn}>
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      handleSearchData(page - 1);
                    }}
                  >
                    Prev
                  </button>
                  <span>
                    {" "}
                    {page} of {totalPageSize}
                  </span>
                  <button
                    disabled={page === totalPageSize}
                    onClick={() => {
                      handleSearchData(page + 1);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className={styles["table-content"]}>
                <table>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>SrNo</th>
                      <th>UserId</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Excel Name</th>
                      <th>Excel Id</th>
                      <th>Total Record</th>
                      <th>View</th>
                      {/* <th>View</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {(fetchedRawData?.result).map((item, idx) => [
                      <tr
                      // onClick={() => {
                      //   handleCheckboxChange(item.dumpBy_db);
                      // }}
                      >
                        <td>
                          <input
                            type="radio"
                            className={styles["checkbox-input-table"]}
                            checked={selectedClients.includes(item.dumpBy_db)}
                            onChange={() => {
                              setSelectedExcelName(item.excel_title_db);
                              setSelectedClients(item.dumpBy_db);
                            }}
                            name="excelId"
                          />
                        </td>

                        <td>{idx + 1}</td>
                        <td>{item.userId_db}</td>
                        <td>{item.date_db}</td>
                        <td>{item.time_db}</td>
                        <td>{item.excel_title_db}</td>
                        <td>{item.dumpBy_db}</td>
                        <td>{item.total_db}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => {
                              handleViewExcelSheet(item.dumpBy_db);
                            }}
                            className={styles.custombtn}
                          >
                            Open
                          </button>
                        </td>
                      </tr>,
                    ])}
                  </tbody>
                </table>
              </div>
              <div className={styles.closediv}>
                <button
                  className={styles.custombtn}
                  onClick={() => {
                    handleFetchRawDataClose();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        {/* SEARCHING REMINDER*/}
        {!isLoading &&
          filterRaw.clientType === "REMINDER" &&
          fetchedRawData.result?.length > 0 && (
            <div className={styles.tablediv}>
              <div className={styles["table-heading"]}>
                <h2 className={styles["heading-text"]}>{searchFrom}</h2>
              </div>
              <div className={styles["table-subheading"]}>
                <h4>Total Record Found : {fetchedRawData.result.length}</h4>
                <select
                  name=""
                  id=""
                  value={remStatus}
                  onChange={(e) => {
                    setRemStatus(e.target.value);
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                </select>
                <div className={styles.pagebtn}>
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      handleSearchData(page - 1);
                    }}
                  >
                    Prev
                  </button>
                  <span>
                    {" "}
                    {page} of {totalPageSize}
                  </span>
                  <button
                    disabled={page === totalPageSize}
                    onClick={() => {
                      handleSearchData(page + 1);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className={styles["table-content"]}>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <span id={styles.selectAll}>
                          <input
                            type="checkbox"
                            className={styles["checkbox-input-table"]}
                            checked={
                              selectedClients?.length ===
                                fetchedRawData.result?.length &&
                              fetchedRawData.result?.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                          Select All ({selectedClients.length})
                        </span>
                      </th>
                      <th>SrNo</th>
                      <th>Stage</th>
                      <th>Client Id</th>
                      <th>Client Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fetchedRawData?.result).map((item, idx) => [
                      <tr
                        onClick={() => {
                          handleCheckboxChange(item.client_id);
                        }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            className={styles["checkbox-input-table"]}
                            checked={selectedClients.includes(item.client_id)}
                            onChange={() => {
                              handleCheckboxChange(item.client_id);
                            }}
                          />
                        </td>

                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: "bold" }}>{item.stage_db}</td>
                        <td>{item.client_id}</td>
                        <td>{item.client_name_db}</td>
                        <td>{item.date_db}</td>
                        <td>{item.time_db}</td>
                        <td>{item.operation_db}</td>
                        <td>
                          {item.status_db == true ? (
                            <MdOutlineDownloadDone />
                          ) : (
                            <IoHourglassOutline />
                          )}
                        </td>
                      </tr>,
                    ])}
                  </tbody>
                </table>
              </div>
              <div className={styles.closediv}>
                <button
                  className={styles.custombtn}
                  onClick={() => {
                    handleFetchRawDataClose();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

        {/* SEARCHING RECORD FROM RAW DB */}

        {!isLoading &&
          filterRaw.clientType !== "REMINDER" &&
          filterRaw.clientType !== "EXCEL" &&
          fetchedRawData.result?.length > 0 && (
            <div className={styles.tablediv}>
              <div className={styles["table-heading"]}>
                <h2 className={styles["heading-text"]}>{searchFrom}</h2>
              </div>
              <div className={styles["table-subheading"]}>
                <h4>
                  Total Record Found :{" "}
                  {fetchedRawData.limit < fetchedRawData.totalCount
                    ? `${
                        Math.ceil(
                          fetchedRawData.totalCount / fetchedRawData.limit
                        ) === fetchedRawData.page
                          ? fetchedRawData.totalCount -
                            fetchedRawData.limit * (fetchedRawData.page - 1)
                          : fetchedRawData.limit
                      } of ${fetchedRawData.totalCount} `
                    : `${fetchedRawData.totalCount} of ${fetchedRawData.totalCount} `}{" "}
                </h4>
                {fetchedRawData.db === "All Database" && (
                  <h4>
                    [ Raw-
                    {fetchedRawData?.counts?.r}, Client-
                    {fetchedRawData?.counts?.c}, User-
                    {fetchedRawData?.counts?.u}]
                  </h4>
                )}
                <div className={styles.pagebtn}>
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      handleSearchData(page - 1);
                    }}
                  >
                    Prev
                  </button>
                  <span>
                    {" "}
                    {page} of {totalPageSize}
                  </span>
                  <button
                    disabled={page === totalPageSize}
                    onClick={() => {
                      handleSearchData(page + 1);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className={styles["table-content"]}>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <span id={styles.selectAll}>
                          <input
                            type="checkbox"
                            className={styles["checkbox-input-table"]}
                            disabled={
                              !fetchedRawData?.result?.some(
                                (item, idx) =>
                                  item?.master_data_db?.assignTo ===
                                  userLoginId?.userId
                              ) && userLoginId?.userId !== "SA"
                            }
                            checked={
                              selectedClients?.length ===
                                fetchedRawData.result?.length &&
                              fetchedRawData.result?.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                          Select All ({selectedClients.length})
                        </span>
                      </th>
                      <th>Status</th>
                      <th>SrNo</th>
                      {filterRaw.deactivate && <th>Reason</th>}
                      <th>Last FollowUp</th>
                      <th>Next FollowUp</th>
                      <th>Client Id</th>
                      <th>Shop Name</th>
                      <th>Client Name</th>
                      <th>Mobile 1</th>
                      <th>Mobile 2</th>
                      <th>Mobile 3 </th>
                      <th>Address</th>
                      <th>Pincode</th>
                      <th>District</th>
                      <th>State</th>
                      <th>Email 1</th>
                      <th>Email 2</th>
                      <th>Email 3</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fetchedRawData?.result
                      ? fetchedRawData?.result
                      : excelData || []
                    ).map((item, idx) => [
                      <tr
                        style={!item.isActive_db ? { color: "gray" } : {}}
                        onClick={() => {
                          !item.isView && userLoginId?.userId !== "SA"
                            ? ""
                            : handleCheckboxChange(item.client_id);
                        }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            disabled={
                              !item.isView && userLoginId?.userId !== "SA"
                            }
                            className={styles["checkbox-input-table"]}
                            checked={selectedClients.includes(item.client_id)}
                            onChange={() => {
                              handleCheckboxChange(item.client_id);
                            }}
                          />
                        </td>
                        <td
                          style={
                            item.database_status_db === "User"
                              ? {
                                  backgroundColor: "#00ff2673",
                                  fontWeight: "bold",
                                }
                              : item.database_status_db === "Client"
                              ? {
                                  backgroundColor: "orange",
                                  fontWeight: "bold",
                                }
                              : { fontWeight: "bold" }
                          }
                        >
                          {item.database_status_db}
                        </td>
                        <td>{idx + 1 + (page - 1) * fetchedRawData.limit}</td>
                        {filterRaw.deactivate && (
                          <td>
                            {item?.additional_db?.invalidNumber
                              ? "Invalid Number"
                              : item?.additional_db?.shopClose
                              ? "Shop Close"
                              : ""}
                          </td>
                        )}
                        <td>{item.date_db || "NA"}</td>
                        <td>{item?.expectedDate_db || "NA"}</td>
                        <td>{item.client_id || "NA"}</td>

                        <td>{item.optical_name1_db || "NA"}</td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.client_name_db || "NA"}
                        </td>

                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.mobile_1_db}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.mobile_2_db}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.mobile_3_db}
                        </td>
                        <td>{item.address_1_db}</td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.pincode_db || "NA"}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.district_db || "NA"}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.state_db || "NA"}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.email_1_db || "NA"}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.email_2_db || "NA"}
                        </td>
                        <td className={!item.isView ? styles.blurs : ""}>
                          {item.email_3_db || "NA"}
                        </td>
                        {item.isActive_db ? (
                          <td>
                            <AiTwotoneDelete
                              style={{
                                cursor: "pointer",
                                color: "red",
                                fontSize: "18px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                item.isDelete
                                  ? handleDeactivate(
                                      item.client_id,
                                      item.database_status_db
                                    )
                                  : alert("Permission not allow");
                              }}
                            />
                          </td>
                        ) : (
                          <td>
                            <LuCirclePlus
                              style={{
                                cursor: "pointer",
                                color: "green",
                                fontSize: "18px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                item.isDelete
                                  ? handleActivate(
                                      item.client_id,
                                      item.database_status_db
                                    )
                                  : alert("Permission not allow");
                              }}
                            />
                          </td>
                        )}
                      </tr>,
                    ])}
                  </tbody>
                </table>
              </div>
              <div>
                <h5>
                  Note: Records in Client/User DBs are excluded from Raw DB
                  view.
                </h5>
              </div>
              <div className={styles.closediv}>
                <div className={styles.colorindicator}>
                  <p>
                    <span style={{ background: "#00ff2673" }}></span> User{" "}
                  </p>
                  <p>
                    <span style={{ background: "orange" }}></span> Client{" "}
                  </p>
                  <p>
                    <span style={{ background: "white" }}></span> Raw{" "}
                  </p>
                </div>
                {userLoginId?.roleType === "Superadmin" &&
                  (filterRaw?.clientType === "RAW" ||
                    filterRaw?.clientType === "CLIENT") && (
                    <button
                      className={styles.custombtn}
                      onClick={() => {
                        handleRawDataDelete();
                      }}
                    >
                      Delete
                    </button>
                  )}
                <button
                  className={styles.custombtn}
                  onClick={() => {
                    handleFetchRawDataClose();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

        {/* FINDING DUPLICATE BY SEARCHING RECORDS */}
        {!isLoading && searchDuplicateRecord.result?.length > 0 && (
          <div className={styles.tablediv}>
            <div className={styles["table-heading"]}>
              <h2 className={styles["heading-text"]}>Duplicate Tracker</h2>
            </div>
            <div className={styles["table-subheading"]}>
              <h4>
                Total Duplicate Record Found in Raw :{" "}
                {`${searchDuplicateRecord.result?.length} of ${searchDuplicateRecord.result?.length} from Raw- ${searchDuplicateRecord.totalRawRecord}`}
              </h4>
              <div className={styles.pagebtn}>
                <button
                  disabled={page === 1}
                  onClick={() => {
                    handleSearchData(page - 1);
                  }}
                >
                  Prev
                </button>
                <span>
                  {" "}
                  {page} of {totalPageSize}
                </span>
                <button
                  disabled={page === totalPageSize}
                  onClick={() => {
                    handleSearchData(page + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
            <div className={styles["table-content"]}>
              <table>
                <thead>
                  <tr>
                    <th>
                      <span id={styles.selectAll}>
                        <input
                          type="checkbox"
                          className={styles["checkbox-input-table"]}
                          checked={
                            selectedClients?.length === excelData?.length &&
                            excelData?.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                        Select All ({selectedClients.length})
                      </span>
                    </th>
                    <th>SrNo</th>
                    <th>Client Id</th>
                    <th>Shop Name 1</th>
                    <th>Shop Name 2</th>
                    <th>Shop Name 3</th>
                    <th>Client Name</th>
                    <th>Email 1</th>
                    <th>Email 2</th>
                    <th>Email 3</th>
                    <th>Mobile 1</th>
                    <th>Mobile 2</th>
                    <th>Mobile 3</th>
                    <th>Address</th>
                    <th>Pincode</th>
                    <th>District</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchDuplicateRecord.result || []).map((item, idx) => [
                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          className={styles["checkbox-input-table"]}
                          checked={selectedClients.includes(item.client_id)}
                          onChange={() => {
                            handleCheckboxChange(item.client_id);
                          }}
                        />
                      </td>
                      <td>{idx + 1}</td>
                      <td>
                        <input
                          type="radio"
                          name="clientId"
                          // checked={fields.clientId === item.client_id}
                          onChange={() => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleFieldsChange("clientId", item.client_id);
                          }}
                        />{" "}
                        {item.client_id || "NA"}
                      </td>
                      <td className={styles.tds}>
                        {" "}
                        <input
                          type="checkbox"
                          name="opticalname"
                          checked={selectedOpticalName.some(
                            (el) => el.key === `${idx}1_opto1`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforOpticalName(
                              e,
                              `${idx}1_opto1`,
                              item.optical_name1_db
                            );
                          }}
                        />{" "}
                        {item.optical_name1_db || "NA"}
                      </td>
                      <td className={styles.tds}>
                        {" "}
                        <input
                          type="checkbox"
                          name="opticalname"
                          checked={selectedOpticalName.some(
                            (el) => el.key === `${idx}1_opto2`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforOpticalName(
                              e,
                              `${idx}1_opto2`,
                              item.optical_name2_db
                            );
                          }}
                        />{" "}
                        {item.optical_name2_db || "NA"}
                      </td>
                      <td className={styles.tds}>
                        {" "}
                        <input
                          type="checkbox"
                          name="opticalname"
                          checked={selectedOpticalName.some(
                            (el) => el.key === `${idx}1_opto3`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforOpticalName(
                              e,
                              `${idx}1_opto3`,
                              item.optical_name1_db
                            );
                          }}
                        />{" "}
                        {item.optical_name3_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="radio"
                          name="clientname"
                          // checked={fields.clientName === item.client_name_db}
                          onChange={() => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleFieldsChange(
                              "clientName",
                              item.client_name_db
                            );
                          }}
                        />{" "}
                        {item.client_name_db || "NA" }
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="email1"
                          checked={selectedEmail.some(
                            (el) => el.key === `${idx}1`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforEmail(
                              e,
                              `${idx}1`,
                              item.email_1_db
                            );
                          }}
                        />{" "}
                        {item.email_1_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="email2"
                          checked={selectedEmail.some(
                            (el) => el.key === `${idx}2`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforEmail(
                              e,
                              `${idx}2`,
                              item.email_2_db
                            );
                          }}
                        />{" "}
                        {item.email_2_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="email3"
                          checked={selectedEmail.some(
                            (el) => el.key === `${idx}3`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforEmail(
                              e,
                              `${idx}3`,
                              item.email_3_db
                            );
                          }}
                        />{" "}
                        {item.email_3_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="mobile1"
                          checked={selectedMobile.some(
                            (item) => item.key === `${idx}1`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforMobile(
                              e,
                              `${idx}1`,
                              item.mobile_1_db
                            );
                          }}
                        />{" "}
                        {item.mobile_1_db}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="mobile2"
                          checked={selectedMobile.some(
                            (item) => item.key === `${idx}2`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforMobile(
                              e,
                              `${idx}2`,
                              item.mobile_2_db
                            );
                          }}
                        />{" "}
                        {item.mobile_2_db}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="mobile3"
                          checked={selectedMobile.some(
                            (e) => e.key === `${idx}3`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforMobile(
                              e,
                              `${idx}3`,
                              item.mobile_3_db
                            );
                          }}
                        />{" "}
                        {item.mobile_3_db}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="checkbox"
                          name="address1"
                          checked={selectedAddress.some(
                            (item) => item.key === `${idx}1address`
                          )}
                          onChange={(e) => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleSearchDuplicateCheckBoxforAddress(
                              e,
                              `${idx}1address`,
                              item.address_1_db
                            );
                          }}
                        />{" "}
                        {item.address_1_db}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="radio"
                          name="pincode"
                          // checked={fields.pincode === item.pincode_db}
                          onChange={() => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleFieldsChange("pincode", item.pincode_db);
                          }}
                        />{" "}
                        {item.pincode_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="radio"
                          name="district"
                          // checked={fields.district === item.district_db}
                          onChange={() => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleFieldsChange("district", item.district_db);
                          }}
                        />{" "}
                        {item.district_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="radio"
                          name="state"
                          // checked={fields.state === item.state_db}
                          onChange={() => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleFieldsChange("state", item.state_db);
                          }}
                        />{" "}
                        {item.state_db || "NA"}
                      </td>
                      <td>
                        {" "}
                        <input
                          type="radio"
                          name="country"
                          // checked={fields.country === item.country_db}
                          onChange={() => {
                            if (!selectedClients.includes(item.client_id)) {
                              setSelectedClients((prev) => [
                                ...prev,
                                item.client_id,
                              ]);
                            }
                            handleFieldsChange("country", item.country_db);
                          }}
                        />{" "}
                        {item.country_db || "NA"}
                      </td>

                      <td>
                        <AiTwotoneDelete
                          onClick={() => {
                            handleDuplicateDelete(
                              item.client_id,
                              item.database_status_db
                            );
                          }}
                        />
                      </td>
                    </tr>,
                  ])}
                </tbody>
              </table>
            </div>
            <div className={styles.closediv}>
              <button
                className={styles.custombtn}
                onClick={handleSearchDuplicateMergeAndDelete}
              >
                Merge
              </button>
              <button
                className={styles.custombtn}
                onClick={handleSearchDuplicateCancel}
              >
                Cancel
              </button>
            </div>
            <div className={styles.newtable}>
              <table>
                <thead>
                  <tr>
                    <th>Client Id</th>
                    <th>Shop Name 1</th>
                    <th>Shop Name 2</th>
                    <th>Shop Name 3</th>
                    <th>Client Name</th>
                    <th>Email 1</th>
                    <th>Email 2</th>
                    <th>Email 3</th>
                    <th>Mobile 1</th>
                    <th>Mobile 2</th>
                    <th>Mobile 3</th>
                    <th>Address 1</th>
                    <th>Address 2</th>
                    <th>Address 3</th>
                    <th>Pincode</th>
                    <th>District</th>
                    <th>State</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input type="text" readOnly value={fields.clientId} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.opticalName1} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.opticalName2} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.opticalName3} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.clientName} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.email1} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.email2} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.email3} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.mobile1} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.mobile2} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.mobile3} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.address1} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.address2} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.address3} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.pincode} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.district} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.state} />
                    </td>
                    <td>
                      <input type="text" readOnly value={fields.country} />
                    </td>
                  </tr>
                  ,
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FETCHING ALL DUPLICATE FROM RAW DB */}
        {!isLoading && isDuplicate && duplicateRecord?.arr?.length > 0 && (
          <div className={styles.tablediv}>
            <div className={styles["table-heading"]}>
              <h2 className={styles["heading-text"]}>
                Duplicate Group Tracker
              </h2>
            </div>
            <div className={styles["table-subheading"]}>
              <h4>
                Total Duplicate Groups :{" "}
                {totalDuplicateRecordCount >= duplicateRecord?.arr?.length
                  ? duplicateRecord?.arr?.length
                  : totalDuplicateRecordCount}{" "}
                of {totalDuplicateRecordCount} / Total{" "}
                {duplicateRecord.totalRawRecordCount} of Raw
              </h4>
              {/* <div className={styles.pagebtn}>
                <button
                  disabled={page === 1}
                  onClick={() => {
                    handleSearchData(page - 1);
                  }}
                >
                  Prev
                </button>
                <span>
                  {" "}
                  {page} of {totalPageSize}
                </span>
                <button
                  disabled={page === totalPageSize}
                  onClick={() => {
                    handleSearchData(page + 1);
                  }}
                >
                  Next
                </button>
              </div> */}
            </div>
            {duplicateRecord?.arr?.map((group, idx) => (
              <React.Fragment key={idx}>
                <div className={styles.dupTables}>
                  <h2>Total Match Duplicated : {group?.length}</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <span id={styles.selectAll}>
                            <input
                              type="checkbox"
                              className={styles["checkbox-input-table"]}
                              checked={
                                duplicateRecord?.arr[idx].every((doc) =>
                                  selectedClients.includes(doc.client_id)
                                ) && group.length > 0
                              }
                              onChange={() => {
                                handleSelectAllMergeDelete(idx);
                              }}
                            />
                            Select All ({selectedClients.length})
                          </span>
                        </th>
                        <th>SrNo</th>
                        <th>Client Id</th>
                        <th>Shop Name</th>
                        <th>Client Name</th>
                        <th>Email 1</th>
                        <th>Email 2</th>
                        <th>Email 3</th>
                        <th>Mobile 1</th>
                        <th>Mobile 2</th>
                        <th>Mobile 3</th>
                        <th>Address</th>
                        <th>Pincode</th>
                        <th>District</th>
                        <th>State</th>
                        <th>Merge</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(group || []).map((item, grpIdx) => [
                        <tr key={item.client_id}>
                          <td>
                            <input
                              type="checkbox"
                              className={styles["checkbox-input-table"]}
                              checked={selectedClients.includes(item.client_id)}
                              onChange={(e) => {
                                handleSelectClient(e, item.client_id, idx);
                              }}
                            />
                          </td>
                          <td>{idx + 1}</td>
                          <td>{item.client_id}</td>
                          <td>{item.optical_name1_db}</td>
                          <td>{item.client_name_db}</td>
                          <td>{item.email_1_db}</td>
                          <td>{item.email_2_db}</td>
                          <td>{item.email_3_db}</td>
                          <td>{item.mobile_1_db}</td>
                          <td>{item.mobile_2_db}</td>
                          <td>{item.mobile_3_db}</td>
                          <td>{item.address_1_db}</td>
                          <td>{item.pincode_db}</td>
                          <td>{item.district_db}</td>
                          <td>{item.state_db}</td>
                          <td>
                            <TbArrowMerge
                              style={{ fontSize: "20px", cursor: "pointer" }}
                              onClick={() =>
                                handleAllMergeAndDelete(item.client_id)
                              }
                            />
                          </td>
                          <td>
                            <AiTwotoneDelete
                              onClick={() => {
                                handleDuplicateDelete(
                                  item.client_id,
                                  item.database_status_db
                                );
                              }}
                            />
                          </td>
                        </tr>,
                      ])}
                    </tbody>
                  </table>
                </div>
                <div className={styles.closediv}>
                  <button
                    className={styles.custombtn}
                    onClick={() => handleSkipIds(idx, group)}
                  >
                    Hide
                  </button>
                </div>
              </React.Fragment>
            ))}
            <div>
              <h5>
                Note: If you want to skip record using Hide Button instead of
                Delete
              </h5>
            </div>
            <div className={styles.closediv}>
              <button
                className={styles.custombtn}
                onClick={handleDuplicateRecordClose}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!isLoading && isMigrate && duplicateCheckerThreeDB.totalCount > 0 && (
          <div className={styles.tablediv}>
            <div className={styles["table-heading"]}>
              <h2 className={styles["heading-text"]}>Migrate Data</h2>
            </div>
            <div className={styles["table-subheading"]}>
              <h3>
                Total Duplicate Groups :{" "}
                {`${duplicateCheckerThreeDB.totalCount} of ${duplicateCheckerThreeDB.totalMigrateCount} `}
              </h3>
              <div className={styles.pagebtn}>
                <div className={styles.pagebtn}>
                  <button
                    disabled={page === 1}
                    style={{ backgroundColor: page === 1 ? "lightgray" : "" }}
                    onClick={() => {
                      handleAndMergeInThreeDB(page - 1);
                    }}
                  >
                    Prev
                  </button>
                  <span>
                    {" "}
                    {page} of {totalPageSize}
                  </span>
                  <button
                    disabled={page === totalPageSize}
                    style={{
                      backgroundColor:
                        page === totalPageSize ? "lightgray" : "",
                    }}
                    onClick={() => {
                      handleAndMergeInThreeDB(page + 1);
                    }}
                  >
                    Next
                  </button>
                </div>
                <button
                  className={styles.custombtn}
                  onClick={handleDuplicateRecordClose}
                >
                  Close
                </button>
              </div>
            </div>
            <h5>Note: Get filtered by ClientName, OpticalName, Pincode</h5>
            {duplicateCheckerThreeDB.duplicates.map((group, groupIdx) => (
              <div className={styles.threedbcol}>
                <div className={styles.tablethreedb} key={groupIdx}>
                  <h4>Total Raw Duplicated : {group.rawCount}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <span id={styles.selectAll}>
                            Select ({selectNewDataOption.length})
                          </span>
                        </th>
                        <th>SrNo</th>
                        <th>Client Id</th>
                        <th>Shop Name 1</th>
                        <th>Shop Name 2</th>
                        <th>Shop Name 3</th>
                        <th>Client Name</th>
                        <th>Email 1</th>
                        <th>Email 2</th>
                        <th>Email 3</th>
                        <th>Mobile 1</th>
                        <th>Mobile 2</th>
                        <th>Mobile 3</th>
                        <th>Address</th>
                        <th>Pincode</th>
                        <th>District</th>
                        <th>State</th>
                        <th>Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(group.rawDocs || []).map((item, idx) => [
                        <tr
                        // onClick={(e) => {
                        //   handleSelectNewDataOption(
                        //     e,
                        //     item.client_id,
                        //     groupIdx
                        //   );
                        // }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              className={styles["checkbox-input-table"]}
                              checked={selectNewDataOption.includes(
                                item.client_id
                              )}
                              onChange={(e) => {
                                handleSelectNewDataOption(
                                  e,
                                  item.client_id,
                                  groupIdx
                                );
                              }}
                            />
                          </td>
                          <td>{idx + 1}</td>
                          <td>
                            {" "}
                            <input
                              type="radio"
                              name="clientId"
                              onChange={() => {
                                handleUpdateInput("clientId", item.client_id);
                              }}
                            />{" "}
                            {item.client_id}
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOpticalName.some(
                                (el) => el.key === `${idx}${groupIdx}r1`
                              )}
                              onChange={(e) => {
                                handleCheckBoxforOpticalName(
                                  e,
                                  `${idx}${groupIdx}r1`,
                                  item.optical_name1_db
                                );
                              }}
                            />{" "}
                            {item.optical_name1_db}
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOpticalName.some(
                                (el) => el.key === `${idx}${groupIdx}r2`
                              )}
                              onChange={(e) => {
                                handleCheckBoxforOpticalName(
                                  e,
                                  `${idx}${groupIdx}r2`,
                                  item.optical_name2_db
                                );
                              }}
                            />{" "}
                            {item.optical_name2_db}
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOpticalName.some(
                                (el) => el.key === `${idx}${groupIdx}r3`
                              )}
                              onChange={(e) => {
                                handleCheckBoxforOpticalName(
                                  e,
                                  `${idx}${groupIdx}r3`,
                                  item.optical_name3_db
                                );
                              }}
                            />{" "}
                            {item.optical_name3_db}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="radio"
                              name="client"
                              onChange={() => {
                                handleUpdateInput(
                                  "clientName",
                                  item.client_name_db
                                );
                              }}
                            />{" "}
                            {item.client_name_db}
                          </td>

                          <td>
                            <input
                              type="checkbox"
                              checked={selectedEmail.some(
                                (el) => el.key === `${groupIdx}_email1_${idx}`
                              )}
                              onChange={(e) =>
                                hanldeCheckBoxforEmail(
                                  e,
                                  `${groupIdx}_email1_${idx}`,
                                  item.email_1_db
                                )
                              }
                            />{" "}
                            {item.email_1_db}
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedEmail.some(
                                (item) =>
                                  item.key === `${groupIdx}_email2_${idx}`
                              )}
                              onChange={(e) => {
                                hanldeCheckBoxforEmail(
                                  e,
                                  `${groupIdx}_email2_${idx}`,
                                  item.email_2_db
                                );
                              }}
                            />{" "}
                            {item.email_2_db}
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedEmail.some(
                                (item) =>
                                  item.key === `${groupIdx}_email3_${idx}`
                              )}
                              onChange={(e) => {
                                hanldeCheckBoxforEmail(
                                  e,
                                  `${groupIdx}_email3_${idx}`,
                                  item.email_3_db
                                );
                              }}
                            />{" "}
                            {item.email_3_db}
                          </td>

                          <td>
                            <input
                              type="checkbox"
                              checked={selectedMobile.some(
                                (item) => item.key === `1${idx}`
                              )}
                              onChange={(e) => {
                                handleCheckBoxForMobile(
                                  e,
                                  `1${idx}`,
                                  item.mobile_1_db
                                );
                              }}
                            />{" "}
                            {item.mobile_1_db}
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedMobile.some(
                                (item) => item.key === `2${idx}`
                              )}
                              onChange={(e) => {
                                handleCheckBoxForMobile(
                                  e,
                                  `2${idx}`,
                                  item.mobile_2_db
                                );
                              }}
                            />{" "}
                            {item.mobile_2_db}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="checkbox"
                              checked={selectedMobile.some(
                                (item) => item.key === `3${idx}`
                              )}
                              onChange={(e) => {
                                handleCheckBoxForMobile(
                                  e,
                                  `3${idx}`,
                                  item.mobile_3_db
                                );
                              }}
                            />{" "}
                            {item.mobile_3_db}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="radio"
                              name="address"
                              onChange={() => {
                                handleUpdateInput("address", item.address_1_db);
                              }}
                            />{" "}
                            {item.address_1_db}
                          </td>
                          <td>
                            <input
                              type="radio"
                              name="pincode"
                              onChange={() => {
                                handleUpdateInput("pincode", item.pincode_db);
                              }}
                            />{" "}
                            {item.pincode_db}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="radio"
                              name="district"
                              onChange={() => {
                                handleUpdateInput("district", item.district_db);
                              }}
                            />{" "}
                            {item.district_db}
                          </td>
                          <td>
                            <input
                              type="radio"
                              name="state"
                              onChange={() => {
                                handleUpdateInput("state", item.state_db);
                              }}
                            />{" "}
                            {item.state_db}
                          </td>
                          <td>
                            <input
                              type="radio"
                              name="country"
                              onChange={() => {
                                handleUpdateInput("country", item.country_db);
                              }}
                            />{" "}
                            {item.country_db}
                          </td>
                        </tr>,
                      ])}
                    </tbody>
                  </table>
                </div>
                <div className={styles.tablethreedb} key={`client-${groupIdx}`}>
                  <h4>Total Client Duplicated : {group.clientCount}</h4>
                  {group.clientCount > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <span id={styles.selectAll}>
                              Select ({selectNewDataOption.length})
                            </span>
                          </th>
                          <th>SrNo</th>
                          <th>Client Id</th>
                          <th>Shop Name 1</th>
                          <th>Shop Name 2</th>
                          <th>Shop Name 3</th>
                          <th>Client Name</th>
                          <th>Email 1</th>
                          <th>Email 2</th>
                          <th>Email 3</th>
                          <th>Mobile 1</th>
                          <th>Mobile 2</th>
                          <th>Mobile 3</th>
                          <th>Address</th>
                          <th>Pincode</th>
                          <th>District</th>
                          <th>State</th>
                          <th>Country</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(group.fuzzyMatchedClients || []).map((item, idx) => [
                          <tr
                          // onClick={(e) => {
                          //   handleSelectNewDataOption(
                          //     e,
                          //     item.client_id,
                          //     groupIdx
                          //   );
                          // }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                className={styles["checkbox-input-table"]}
                                checked={selectNewDataOption.includes(
                                  item.client_id
                                )}
                                onChange={(e) => {
                                  handleSelectNewDataOption(
                                    e,
                                    item.client_id,
                                    groupIdx
                                  );
                                }}
                              />
                            </td>
                            <td>{idx + 1}</td>
                            <td>
                              <input
                                type="radio"
                                name="clientId"
                                onChange={() => {
                                  handleUpdateInput("clientId", item.client_id);
                                }}
                              />{" "}
                              {item.client_id}
                            </td>
                            <td>
                              {" "}
                              <input
                                type="checkbox"
                                checked={selectedOpticalName.some(
                                  (el) => el.key === `${idx}${groupIdx}-opto2`
                                )}
                                onChange={(e) => {
                                  handleCheckBoxforOpticalName(
                                    e,
                                    `${idx}${groupIdx}-opto2`,
                                    item.optical_name1_db
                                  );
                                }}
                              />{" "}
                              {item.optical_name1_db}
                            </td>

                            <td>
                              {" "}
                              <input
                                type="checkbox"
                                checked={selectedOpticalName.some(
                                  (el) => el.key === `${idx}${groupIdx}-opto2c2`
                                )}
                                onChange={(e) => {
                                  handleCheckBoxforOpticalName(
                                    e,
                                    `${idx}${groupIdx}-opto2c2`,
                                    item.optical_name2_db
                                  );
                                }}
                              />{" "}
                              {item.optical_name2_db}
                            </td>
                            <td>
                              {" "}
                              <input
                                type="checkbox"
                                checked={selectedOpticalName.some(
                                  (el) => el.key === `${idx}${groupIdx}-opto2c3`
                                )}
                                onChange={(e) => {
                                  handleCheckBoxforOpticalName(
                                    e,
                                    `${idx}${groupIdx}-opto2c3`,
                                    item.optical_name3_db
                                  );
                                }}
                              />{" "}
                              {item.optical_name3_db}
                            </td>
                            <td>
                              {" "}
                              <input
                                type="radio"
                                name="client"
                                id={idx}
                                onChange={() => {
                                  handleUpdateInput(
                                    "clientName",
                                    item.client_name_db
                                  );
                                }}
                              />{" "}
                              {item.client_name_db}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedEmail.some(
                                  (el) => el.key === `${groupIdx}_email4_${idx}`
                                )}
                                onChange={(e) =>
                                  hanldeCheckBoxforEmail(
                                    e,
                                    `${groupIdx}_email4_${idx}`,
                                    item.email_1_db
                                  )
                                }
                              />{" "}
                              {item.email_1_db}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedEmail.some(
                                  (item) =>
                                    item.key === `${groupIdx}_email5_${idx}`
                                )}
                                onChange={(e) => {
                                  hanldeCheckBoxforEmail(
                                    e,
                                    `${groupIdx}_email5_${idx}`,
                                    item.email_2_db
                                  );
                                }}
                              />{" "}
                              {item.email_2_db}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedEmail.some(
                                  (item) =>
                                    item.key === `${groupIdx}_email6_${idx}`
                                )}
                                onChange={(e) => {
                                  hanldeCheckBoxforEmail(
                                    e,
                                    `${groupIdx}_email6_${idx}`,
                                    item.email_3_db
                                  );
                                }}
                              />{" "}
                              {item.email_3_db}
                            </td>

                            <td>
                              <input
                                type="checkbox"
                                checked={selectedMobile.some(
                                  (item) => item.key === `4${idx}`
                                )}
                                onChange={(e) => {
                                  handleCheckBoxForMobile(
                                    e,
                                    `4${idx}`,
                                    item.mobile_1_db
                                  );
                                }}
                              />{" "}
                              {item.mobile_1_db}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedMobile.some(
                                  (item) => item.key === `5${idx}`
                                )}
                                onChange={(e) => {
                                  handleCheckBoxForMobile(
                                    e,
                                    `5${idx}`,
                                    item.mobile_2_db
                                  );
                                }}
                              />{" "}
                              {item.mobile_2_db}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedMobile.some(
                                  (item) => item.key === `6${idx}`
                                )}
                                onChange={(e) => {
                                  handleCheckBoxForMobile(
                                    e,
                                    `6${idx}`,
                                    item.mobile_3_db
                                  );
                                }}
                              />{" "}
                              {item.mobile_3_db}
                            </td>
                            <td>
                              <input
                                type="radio"
                                name="address"
                                onClick={() => {
                                  handleUpdateInput(
                                    "address",
                                    item.address_1_db
                                  );
                                }}
                              />
                              {item.address_1_db}
                            </td>
                            <td>
                              <input
                                type="radio"
                                name="pincode"
                                onClick={() => {
                                  handleUpdateInput("pincode", item.pincode_db);
                                }}
                              />{" "}
                              {item.pincode_db}
                            </td>
                            <td>
                              <input
                                type="radio"
                                name="district"
                                onClick={() => {
                                  handleUpdateInput(
                                    "district",
                                    item.district_db
                                  );
                                }}
                              />{" "}
                              {item.district_db}
                            </td>
                            <td>
                              <input
                                type="radio"
                                name="state"
                                onClick={() => {
                                  handleUpdateInput("state", item.state_db);
                                }}
                              />{" "}
                              {item.state_db}
                            </td>
                            <td>
                              <input
                                type="radio"
                                name="country"
                                onClick={() => {
                                  handleUpdateInput("country", item.country_db);
                                }}
                              />{" "}
                              {item.country_db}
                            </td>
                          </tr>,
                        ])}
                      </tbody>
                    </table>
                  ) : (
                    <div className={styles["tablediv-header"]}>
                      <strong>No Record Found in Client DB</strong>
                    </div>
                  )}
                </div>
                <div className={styles.tablethreedb} key={`user-${groupIdx}`}>
                  <h4>
                    Total User Duplicated : {group.fuzzySubscriptionCount}
                  </h4>
                  {group.fuzzySubscriptionCount > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <span id={styles.selectAll}>
                              Select ({selectNewDataOption.length})
                            </span>
                          </th>
                          <th>SrNo</th>
                          <th>Client Id</th>
                          <th>Shop Name</th>
                          <th>Client Name</th>
                          <th>Email 1</th>
                          <th>Email 2</th>
                          <th>Email 3</th>
                          <th>Mobile 1</th>
                          <th>Mobile 2</th>
                          <th>Mobile 3</th>
                          <th>Address</th>
                          <th>Pincode</th>
                          <th>District</th>
                          <th>State</th>
                          <th>Country</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(group.fuzzyMatchedSubscriptions || []).map(
                          (item, idx) => [
                            <tr
                            // onClick={(e) => {
                            //   handleSelectNewDataOption(
                            //     e,
                            //     item.client_id,
                            //     groupIdx
                            //   );
                            // }}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  className={styles["checkbox-input-table"]}
                                  checked={selectNewDataOption.includes(
                                    item.client_id
                                  )}
                                  onChange={(e) => {
                                    handleSelectNewDataOption(
                                      e,
                                      item.client_id,
                                      groupIdx
                                    );
                                  }}
                                />
                              </td>
                              <td>{idx + 1}</td>
                              <td>
                                <input
                                  type="radio"
                                  name="client"
                                  onChange={() => {
                                    handleUpdateInput(
                                      "clientName",
                                      item.client_name_db
                                    );
                                  }}
                                />{" "}
                                {item.client_id}
                              </td>
                              <td>
                                {" "}
                                <input
                                  type="checkbox"
                                  checked={selectedOpticalName.some(
                                    (el) => el.key === `${idx}${groupIdx}-opto3`
                                  )}
                                  onChange={(e) => {
                                    handleCheckBoxforOpticalName(
                                      e,
                                      `${idx}${groupIdx}-opto3`,
                                      item.optical_name1_db
                                    );
                                  }}
                                />{" "}
                                {item.optical_name1_db}
                              </td>
                              <td>
                                <input type="radio" name="client" />{" "}
                                {item.client_name_db}
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedEmail.some(
                                    (el) =>
                                      el.key === `${groupIdx}_email17_${idx}`
                                  )}
                                  onChange={(e) =>
                                    hanldeCheckBoxforEmail(
                                      e,
                                      `${groupIdx}_email7_${idx}`,
                                      item.email_1_db
                                    )
                                  }
                                />{" "}
                                {item.email_1_db}
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedEmail.some(
                                    (item) =>
                                      item.key === `${groupIdx}_email8_${idx}`
                                  )}
                                  onChange={(e) => {
                                    hanldeCheckBoxforEmail(
                                      e,
                                      `${groupIdx}_email8_${idx}`,
                                      item.email_2_db
                                    );
                                  }}
                                />{" "}
                                {item.email_2_db}
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedEmail.some(
                                    (item) =>
                                      item.key === `${groupIdx}_email9_${idx}`
                                  )}
                                  onChange={(e) => {
                                    hanldeCheckBoxforEmail(
                                      e,
                                      `${groupIdx}_email9_${idx}`,
                                      item.email_3_db
                                    );
                                  }}
                                />{" "}
                                {item.email_3_db}
                              </td>
                              <td>
                                {" "}
                                <input
                                  type="checkbox"
                                  checked={selectedMobile.some(
                                    (item) => item.key === `7${idx}`
                                  )}
                                  onChange={(e) => {
                                    handleCheckBoxForMobile(
                                      e,
                                      `7${idx}`,
                                      item.mobile_1_db
                                    );
                                  }}
                                />{" "}
                                {item.mobile_1_db}
                              </td>
                              <td>
                                {" "}
                                <input
                                  type="checkbox"
                                  checked={selectedMobile.some(
                                    (item) => item.key === `8${idx}`
                                  )}
                                  onChange={(e) => {
                                    handleCheckBoxForMobile(
                                      e,
                                      `8${idx}`,
                                      item.mobile_2_db
                                    );
                                  }}
                                />{" "}
                                {item.mobile_2_db}
                              </td>
                              <td>
                                {" "}
                                <input
                                  type="checkbox"
                                  checked={selectedMobile.some(
                                    (item) => item.key === `9${idx}`
                                  )}
                                  onChange={(e) => {
                                    handleCheckBoxForMobile(
                                      e,
                                      `9${idx}`,
                                      item.mobile_3_db
                                    );
                                  }}
                                />{" "}
                                {item.mobile_3_db}
                              </td>

                              <td>
                                {" "}
                                <input
                                  type="radio"
                                  name="address"
                                  onChange={() => {
                                    handleUpdateInput(
                                      "address",
                                      item.address_1_db
                                    );
                                  }}
                                />{" "}
                                {item.address_1_db}
                              </td>
                              <td>
                                <input
                                  type="radio"
                                  name="pincode"
                                  onChange={() => {
                                    handleUpdateInput(
                                      "pincode",
                                      item.pincode_db
                                    );
                                  }}
                                />{" "}
                                {item.pincode_db}
                              </td>
                              <td>
                                <input
                                  type="radio"
                                  name="district"
                                  onChange={() => {
                                    handleUpdateInput(
                                      "district",
                                      item.district_db
                                    );
                                  }}
                                />{" "}
                                {item.district_db}
                              </td>
                              <td>
                                <input
                                  type="radio"
                                  name="state"
                                  onChange={() => {
                                    handleUpdateInput("state", item.state_db);
                                  }}
                                />{" "}
                                {item.state_db}
                              </td>
                              <td>
                                <input
                                  type="radio"
                                  name="country"
                                  onChange={() => {
                                    handleUpdateInput(
                                      "country",
                                      item.country_db
                                    );
                                  }}
                                />{" "}
                                {item.country_db}
                              </td>
                            </tr>,
                          ]
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className={styles["tablediv-header"]}>
                      <strong>No Record Found in User DB</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className={styles.closediv}>
              <button
                className={styles.custombtn}
                onClick={() => {
                  handleNewUpdateData();
                }}
              >
                Update
              </button>
            </div>
            <div className={styles.newtable}>
              <div className={styles.newtable}>
                <table>
                  <thead>
                    <tr>
                      <th>Client Id</th>
                      <th>Shop Name 1</th>
                      <th>Shop Name 2</th>
                      <th>Shop Name 3</th>
                      <th>Client Name</th>
                      <th>Email 1</th>
                      <th>Email 2</th>
                      <th>Email 3</th>
                      <th>Mobile 1</th>
                      <th>Mobile 2</th>
                      <th>Mobile 3</th>
                      <th>Address</th>
                      <th>Pincode</th>
                      <th>District</th>
                      <th>State</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <input type="text" readOnly value={newData.clientId} />
                      </td>
                      <td>
                        <input
                          type="text"
                          readOnly
                          value={newData.opticalName1}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          readOnly
                          value={newData.opticalName2}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          readOnly
                          value={newData.opticalName3}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          readOnly
                          value={newData.clientName}
                        />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.email1} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.email2} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.email3} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.mobile1} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.mobile2} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.mobile3} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.address} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.pincode} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.district} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.state} />
                      </td>
                      <td>
                        <input type="text" readOnly value={newData.country} />
                      </td>
                    </tr>
                    ,
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!isLoading && excelData?.length > 0 && (
          <div className={styles.tablediv}>
            <div className={styles["table-heading"]}>
              <h2 className={styles["heading-text"]}>Excel Record Sheet</h2>
            </div>
            <div className={`${styles["table-subheading"]} ${styles.wrapper}`}>
              {/* <h4 style={{ color: "red" }}>View Mode Only</h4> */}
              <h4>Total Record Found : {excelData?.length}</h4>
              <h4>Record Done : {totalDone}</h4>
              <h4>DumpBy:{DumpBy}</h4>
              <h4>Excel-Id:{DumpId}</h4>
              <div className={styles.pagebtn}>
                <button
                  disabled={page === 1}
                  onClick={() => {
                    handleSearchData(page - 1);
                  }}
                >
                  Prev
                </button>
                <span>
                  {" "}
                  {page} of {totalPageSize || 1}
                </span>
                <button
                  disabled={page === totalPageSize}
                  onClick={() => {
                    handleSearchData(page + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </div>

            <div className={styles["table-content"]}>
              <table>
                <thead>
                  <tr>
                    <th>
                      <span id={styles.selectAll}>
                        <input
                          type="checkbox"
                          className={styles["checkbox-input-table"]}
                          checked={
                            selectedClients?.length === excelData?.length &&
                            excelData?.length > 0
                          }
                          onChange={handleViewExcelSelectAll}
                        />
                        Select All ({selectedClients.length})
                      </span>
                    </th>
                    <th>SrNo</th>
                    <th>Client Id</th>
                    <th>Shop Name</th>
                    <th>Client Name</th>
                    <th>Email 1</th>
                    <th>Email 2</th>
                    <th>Address</th>
                    <th>Pincode</th>
                    <th>District</th>
                    <th>State</th>
                    <th>Mobile 1</th>
                    <th>Mobile 2</th>
                    <th>Mobile 3</th>
                    <th>FollowUp</th>
                  </tr>
                </thead>
                <tbody>
                  {(excelData || []).map((item, idx) => [
                    <tr
                      style={{
                        backgroundColor:
                          item.database_status_db === "user_db"
                            ? "#ffe5ac"
                            : item.database_status_db === "client_db"
                            ? "#00ff2673"
                            : "",
                      }}
                      onClick={() => {
                        handleCheckboxChange(item.client_id);
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className={styles["checkbox-input-table"]}
                          checked={selectedClients.includes(item.client_id)}
                          onChange={() => {
                            handleCheckboxChange(item.client_id);
                          }}
                        />
                      </td>
                      <td>{idx + 1}</td>
                      <td>{item.client_id}</td>
                      <td>{item.optical_name1_db}</td>
                      <td>{item.client_name_db}</td>
                      <td>{item.email_1_db}</td>
                      <td>{item.email_2_db}</td>
                      <td>{item.address_1_db}</td>
                      <td>{item.pincode_db}</td>
                      <td>{item.district_db}</td>
                      <td>{item.state_db}</td>
                      <td>{item.mobile_1_db}</td>
                      <td>{item.mobile_2_db}</td>
                      <td>{item.mobile_3_db}</td>
                      <td>{item.Followup}</td>
                    </tr>,
                  ])}
                </tbody>
              </table>
            </div>
            <div className={styles.excelclosebtn}>
              <button
                className={styles.custombtn}
                onClick={() => {
                  setExcelData([]);
                  setSelectedClients([]);
                }}
              >
                Close
              </button>
            </div>

            <div className={styles.colorindicator}>
              <p>
                <span style={{ background: "#ffe5ac" }}></span> User{" "}
              </p>
              <p>
                <span style={{ background: "#00ff2673" }}></span> Client{" "}
              </p>
              <p>
                <span style={{ background: "" }}></span> Raw{" "}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <span className={styles.norecord}>
            <h1 style={{ textAlign: "center" }}>Loading... Please Wait</h1>
          </span>
        )}
        {!isLoading && isSearch && fetchedRawData.result?.length === 0 && (
          <span className={styles.norecord}>
            <h2>No Data Found</h2>
          </span>
        )}

        {!isLoading &&
          isMigrate &&
          duplicateCheckerThreeDB.totalCount === 0 && (
            <span className={styles.norecord}>
              <h2>No Duplicate Match Found</h2>
            </span>
          )}
        {!isLoading && isDuplicate && duplicateRecord.arr?.length === 0 && (
          <span className={styles.norecord}>
            <h2>No Duplicate Match Found.</h2>
          </span>
        )}
        {!isLoading &&
          isSearchDuplicate &&
          searchDuplicateRecord.result?.length === 0 && (
            <span className={styles.norecord}>
              <h2>No Duplicate Search Found</h2>
            </span>
          )}
      </div>
      {msg && (
        <MessagePortal
          message1={msg}
          onClose={() => {
            setMsg("");
          }}
        />
      )}

      {/* ==================== */}
    </div>
 
  );
};

export default SearchClient;
