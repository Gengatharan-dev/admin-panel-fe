import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './components/layout/AppLayout';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import Roles from './pages/Roles';
import Users from './pages/Users';

function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Login />} />
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
