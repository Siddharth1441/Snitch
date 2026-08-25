import { setUser, setLoading, setError, setInitialized } from "../state/auth.slice.js";
import { register, login, getMe } from "../service/auth.api.js";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();

  async function handleRegister({ email, contact, password, fullname, isSeller = false }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await register({ email, contact, password, fullname, isSeller });
      dispatch(setUser(data.user));
      return data;
    } catch (err) {
      let errorMessage = 'Failed to register. Please try again.';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map((e) => e.msg).join(' | ');
      } else if (err?.message) {
        errorMessage = err.message;
      }

      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await login({ email, password });
      dispatch(setUser(data.user));
      return data;
    } catch (err) {
      let errorMessage = 'Failed to login. Please check your credentials.';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map((e) => e.msg).join(' | ');
      } else if (err?.message) {
        errorMessage = err.message;
      }

      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      const data = await getMe();
      if (data?.user) {
        dispatch(setUser(data.user));
      }
    } catch {
      // No valid session — user stays null
      dispatch(setUser(null));
    } finally {
      dispatch(setInitialized(true));
    }
  }

  function handleLogout() {
    dispatch(setUser(null));
    dispatch(setError(null));
    // Clear the token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  };
};
