import { createContext, useContext } from "react";
import type { IAuthContext } from "../types/auth";


export const authContext = createContext<IAuthContext>({
    authToken: '',
    authUser: '',
    isLoggedIn: false,
});


export const useAuth = () => {
    const auth = useContext(authContext);
    if (!auth) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return auth;
}

