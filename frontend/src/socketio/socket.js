import { io } from 'socket.io-client'

const host = window.location.hostname;
const socket = io(`http://${host}:3000`, {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,      // ♾ keep trying
    reconnectionDelay: 1000,             // start at 1s
    reconnectionDelayMax: 10000,
}) // backend port

export default socket;  