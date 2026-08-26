import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  const userStr = sessionStorage.getItem('user');

  const getLoginRoute = () => {
    if (allowedRoles?.includes('SUPER_ADMIN')) return '/login/super-admin';
    if (allowedRoles?.includes('INSTITUTION')) return '/login/institution';
    if (allowedRoles?.includes('OPERATOR')) return '/login/operator';
    return '/';
  };

  const loginRoute = getLoginRoute();

  if (!token || !userStr) {
    return <Navigate to={loginRoute} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && user.roles) {
      const hasAllowedRole = user.roles.some(role => 
        allowedRoles.includes(role.replace('ROLE_', ''))
      );
      if (!hasAllowedRole) {
        return <Navigate to={loginRoute} replace />;
      }
    }
  } catch (e) {
    return <Navigate to={loginRoute} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
