import { useState } from "react";
import "./mobile.css";
import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Register from "./components/Register.jsx";
import Setting from "./components/Setting.jsx";
import ClientPage from "./components/ClientPage/ClientPage.jsx";
import Addplus from "./components/ClientPage/AddField.jsx";
import UserPage from "./components/UserPage/UserPage.jsx";
import ExecutiveDashboard from "./components/Dashboard/Executive/ExecutiveDashboard.jsx";
import SuperAdminDashboard from "./components/Dashboard/SuperAdmin/SuperAdminDashboard.jsx";
import AdminDashboard from "./components/Dashboard/Admin/AdminDashboard.jsx";
import Login from "./Pages/Login.jsx";
import ProgressReport from "./components/UserReport/ProgressReport.jsx";
import SearchClient from "./Pages/SearchClient.jsx";
import HomeNavigator from "./Pages/HomeNavigator.jsx";
import ViewExcel from "./Pages/ViewExcel.jsx";
import Backup from "./Pages/Backup.jsx";
import Receipt from "./Pages/Receipt.jsx";
import AuthProvider from "./context-api/AuthContext.jsx";
import Protected from "./Pages/Protected.jsx";
import RequestModal from "./UI/RequestModal.jsx";
import GlobalModalProvider from "./context-api/GlobalModalContext.jsx";
import SocketListner from "./components/SocketListner.jsx";
import ReportDashboard from "./components/Reports/ReportDashboard.jsx";
import ReminderToast from "./UI/ReminderToast.jsx";
// import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalModalProvider>
          <SocketListner />
          <ReminderToast />
          <HomeNavigator />
          <Routes>
            <Route path="/client-page" element={<ClientPage />} />
            <Route path="/user-dashboard" element={<ExecutiveDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route
              path="/"
              element={
                <Protected>
                  <SuperAdminDashboard />
                </Protected>
              }
            />
            {/* <Route path="/" element={<SuperAdminDashboard />} /> */}
            <Route path="/register" element={<Register />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/userpage" element={<UserPage />} />
            <Route path="/add" element={<Addplus />} />
            <Route path="/login" element={<Login />} />
            <Route path="/progress" element={<ProgressReport />} />
            <Route path="/search-client" element={<SearchClient />} />
            <Route path="/view-excel" element={<ViewExcel />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/report" element={<ReportDashboard/>} />
            {/* <Route path="/m" element={<RequestModal />} /> */}
          </Routes>
          <RequestModal />
        </GlobalModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
