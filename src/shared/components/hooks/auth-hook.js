import { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState(null);
  const [tokenExpirationDates, setTokenExpirationDates] = useState();
  const [userId, setUserId] = useState(null);

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);

    setTokenExpirationDates(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      }) // special To string method to store important information
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDates(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(()=>{
    if (token && tokenExpirationDates){
      const remainingTime = tokenExpirationDates.getTime()- new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime)
    }else {
      clearTimeout(logoutTimer);
    }

  },[token, logout, tokenExpirationDates])

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData")); // JSON.parse >> convert JSON strings back to regular JS object
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return {token, login, logout, userId};

}