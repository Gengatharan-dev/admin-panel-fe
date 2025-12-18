import { io, Socket } from "socket.io-client";

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem('token');

export const socket: Socket = io(apiUrl, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
});
