import { useState, useEffect } from 'react';

const CREDENTIALS = { username: 'jack0706', password: 'jack0706' };
const KEY = 'jsr_auth';

export function useAuth() {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem(KEY));

  const login = (username, password) => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      localStorage.setItem(KEY, '1');
      setIsAuth(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setIsAuth(false);
  };

  return { isAuth, login, logout };
}
