import { useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotFound from "./NotFound";
import Dashboard from "./screens/Dashboard";
import NFL from "./screens/NFL";
import Users from "./screens/Users";
import Cookies from "js-cookie";
import { useAxios } from "../contexts/AxiosContext";

const MainPage = () => {
  const axiosService = useAxios();
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "dashboard";
  const { logout, isLoggedIn, login, apiToken } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const session = Cookies.get('__session');
    if (session && apiToken === null) {
      axiosService.get('/api/user-details')
        .then((response) => {
          login(response.data.token);
          setCurrentUser(response.data.user);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
          // logout();
        });
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'nfl':
        return <NFL />;
      case 'users':
        return <Users />;
      default:
        return <NotFound />;
    }
  };

  return (
    <Layout children={renderPage()} currentUser={currentUser} />
  );
};

export default MainPage;