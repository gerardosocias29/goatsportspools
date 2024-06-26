import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  useEffect(() => {
    logout();
  },[logout]);
  return '';
}

export default Logout;