// hook for useUser
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

interface IUserContext<T> {
  isLoading: boolean;
  error?: string;
  user?: T;
  isError: boolean;
}

const UserContext = createContext(null);

function UserContextProvider({
  children,
  user,
  loginUrl = process.env.NEXT_PUBLIC_P1_AUTH_LOGIN_ENDPOINT || '/api/login',
}) {
  const [state, setState] = useState<IUserContext<typeof user>>({
    isLoading: true,
    error: null,
    user: user,
    isError: false,
  });

  const login = useCallback(async () => {
    try {
      const response = await fetch(loginUrl);
      const user = response.ok ? await response.json() : undefined;
      setState((state) => ({
        ...state,
        user,
        error: undefined,
        isError: false,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = 'The request to get user failed';
      setState((state) => ({
        ...state,
        user: null,
        error: errorMessage,
        isError: true,
      }));
    }
  }, [loginUrl]);

  useEffect(() => {
    // Call the async Login function
    if (!state.user) (async () => await login())();
  }, [state.user]);

  return (
    <UserContext.Provider value={{ ...state }}>{children}</UserContext.Provider>
  );
}

// Hooks
const useUser = <T extends unknown>(): IUserContext<T> => {
  const context = useContext<IUserContext<T>>(UserContext);
  // Dev error message
  if (!context) {
    throw new Error('Must use this hook in the UserContext');
  }

  return context;
};

// Exports
export { useUser, UserContextProvider };
