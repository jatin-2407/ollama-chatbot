const TOKEN = "auth-token";
const USER = "auth-user";
const EVENT = "auth-change";

export interface StoredAuth {
    token: string;
    user: string;
}

const read = (key: string) => {
    try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
};

const emit = () => window.dispatchEvent(new Event(EVENT));

export const authStorage = {
    get: (): StoredAuth => ({ token: read(TOKEN), user: read(USER) }),
    set({ token, user }: StoredAuth) {
        localStorage.setItem(TOKEN, token);
        localStorage.setItem(USER, user);
        emit();
    },
    clear() {
        localStorage.removeItem(TOKEN);
        localStorage.removeItem(USER);
        emit();
    },
    /** Fires on sign-in/out in this tab and in other tabs. */
    subscribe(cb: () => void) {
        const onStorage = (e: StorageEvent) => (e.key === TOKEN || e.key === USER) && cb();
        window.addEventListener(EVENT, cb);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener(EVENT, cb);
            window.removeEventListener("storage", onStorage);
        };
    },
};
