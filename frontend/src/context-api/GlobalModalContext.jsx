import React, { useContext, useState } from "react";
import { createContext } from "react";
import socket from "../socketio/socket";
export const RequestModalContext = createContext();

const GlobalModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);
  const [remainderTotalCount, setRemainderTotalCount] = useState(0);
  const [remainder, setRemainder] = useState([]);
  const [reminderPopup, setReminderPopup] = useState("");
  const [socketOnline,setSocketOnline] = useState(socket.connected)

  const handleOpenModal = (content, onResponse) => {
    console.log(
      "GlobalModalProvider: openModal called with ->",
      content,
      onResponse
    );
    setModalContent({ ...content, onResponse }); //passing data in 1st argument and in 2nd -> getting response from receiver side accept/reject
  };

  const handleCloseModal = () => {
    console.log("GlobalModalProvider: closeModal called");
    setModalContent(null);
  };

  return (
    <RequestModalContext.Provider
      value={{
        modalContent,
        handleOpenModal,
        handleCloseModal,
        remainderTotalCount,
        setRemainderTotalCount,
        remainder,
        setRemainder,
        reminderPopup,
        setReminderPopup,
        socketOnline,
        setSocketOnline
      }}
    >
      {children}
    </RequestModalContext.Provider>
  );
};

export default GlobalModalProvider;
