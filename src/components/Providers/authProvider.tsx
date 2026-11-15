import { useState, useMemo, useEffect, type ReactNode, type FC } from "react";
import type { IAuthContext } from "../types/auth";
import { authContext } from "../Contexts/authContext";

interface IProps {
    children: ReactNode
}

export const AuthProvider: FC<IProps> = ({ children }) => {

    const [token, setToken] = useState("");
    const [user, setUser] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("auth-token");
        if (token) {
            setToken(token);
        }

        const user = localStorage.getItem("auth-user");
        if (user) {
            setUser(user);
        }



    }, []);

    const value: IAuthContext = useMemo(() => {

        return {
            authToken: token,
            authUser: user,
            isLoggedIn: Boolean(token.trim() && user.trim())
        }

    }, [user, token])

    return <authContext.Provider value={value}>
        {children}
    </authContext.Provider>

}