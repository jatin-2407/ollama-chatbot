import { useCallback, useSyncExternalStore } from "react";
import { authStorage, type StoredAuth } from "@/lib/authStorage";

let cache: StoredAuth = authStorage.get();
const snapshot = () => {
    const next = authStorage.get();
    if (next.token !== cache.token || next.user !== cache.user) cache = next;
    return cache;
};

/** Auth state backed by localStorage; stays in sync across tabs and on 401s. */
export const useAuth = () => {
    const { token, user } = useSyncExternalStore(authStorage.subscribe, snapshot);
    return {
        token,
        user,
        isLoggedIn: Boolean(token && user),
        login: useCallback((auth: StoredAuth) => authStorage.set(auth), []),
        logout: useCallback(() => authStorage.clear(), []),
    };
};
