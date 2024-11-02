import { atom, useAtom } from "jotai";

// is authenticated
const _isAuthenticatedAtom = atom(false);

export const useAuthState = () => {
  // is authenticated
  const [isAuthenticated, setIsAuthenticated] = useAtom(_isAuthenticatedAtom);

  return {
    // is authenticated
    isAuthenticated,
    setIsAuthenticated,
  };
};
