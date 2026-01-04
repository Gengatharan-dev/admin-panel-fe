import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './components/layout/AppLayout';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import Roles from './pages/Roles';
import Users from './pages/Users';
import { useEffect } from 'react';
import { connectSocket, socket } from './socket';

function App() {

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const roleId = localStorage.getItem('role');
  useEffect(() => {
    if (token) connectSocket();

    const handleBeforeUnload = () => {
      if (roleId === "2")
        socket.emit('user-offline', userId);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={!token ? <Login /> : <Navigate to="/users" />} />
        <Route path='/register' element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path='/profile' element={<Profile />} />

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
