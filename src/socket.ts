import { io, Socket } from "socket.io-client";

const apiUrl = process.env.REACT_APP_API_URL;

export const socket: Socket = io(apiUrl, {
    transports: ["websocket"],
    autoConnect: false,
});

export const connectSocket = () => {
    const token = localStorage.getItem('token');

    if (!socket.connected) {
        if (token) {
            socket.auth = { token };
        }
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};