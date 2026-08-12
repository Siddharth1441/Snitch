import { setUser, setLoading, setError } from "../state/auth.slice.js";
import { register, login } from "../service/auth.api.js";
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

  function handleLogout() {
    dispatch(setUser(null));
    dispatch(setError(null));
  }

  return {
    handleRegister,
    handleLogin,
    handleLogout,
  };
};

