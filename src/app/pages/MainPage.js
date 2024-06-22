import { useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotFound from "./NotFound";
import Page from "./screens/Page";
import { useAxios } from "../contexts/AxiosContext";

const MainPage = () => {
  const axiosService = useAxios();  
  const location = useLocation();
  const currentPage = new URLSearchParams(location.search).get("page") || "dashboard";
  const { logout, isLoggedIn, apiToken} = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    if (!isLoggedIn && !apiToken) {
      logout();
    }
  }, [isLoggedIn, apiToken, logout]); 

  useEffect(() => {
    axiosService.get('/api/me_user').then((response) => {
      if(response.data.status){
        setCurrentUser(response.data.user);
      } else {
        logout();
      }
    }).catch((error) => {
      logout();
    });
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': 
        return <Page/>
      default:
        return (
          <NotFound/>
        );
    }
  };

  return(
    <Layout children={renderPage()} />
  )
}

export default MainPage;