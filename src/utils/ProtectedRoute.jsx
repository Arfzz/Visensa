import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const userString = localStorage.getItem('user');

  // 1. Kalau beneran belum login (nggak ada token), baru tendang ke login / home
  if (!token || !userString) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(userString);

  // 2. Kalau udah login TAPI role-nya nggak diundang ke halaman ini
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    // Cek identitas aslinya, lalu pulangkan ke "rumahnya" masing-masing
    if (user.role === 'patient') {
      // Karena pasien nggak boleh ke sini, balikin ke dashboard pasien
      return <Navigate to="/patient-dashboard" replace />; 
    } 
    
    if (user.role === 'doctor') {
      // Karena dokter nggak boleh ke rute pasien, balikin ke dashboard dokter
      return <Navigate to="/admin-dashboard" replace />;
    }

    // Jaga-jaga kalau role-nya aneh (bukan patient/doctor)
    return <Navigate to="/login" replace />;
  }

  // 3. Kalau token aman dan role sesuai, silakan masuk
  return <Outlet />;
};

export default ProtectedRoute;