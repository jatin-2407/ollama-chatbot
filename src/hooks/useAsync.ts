import { useCallback, useEffect, useRef, useState, type DependencyList, type Dispatch, type SetStateAction } from "react";
import { errorMessage, isAbort } from "@/lib/api";

export interface AsyncState<T> {
    data: T;
    loading: boolean;
    error: string;
    reload: () => void;
    setData: Dispatch<SetStateAction<T>>;
}

/** Runs an abortable loader on mount / when deps change, with loading + error state and retry. */
export function useAsync<T>(loader: ((signal: AbortSignal) => Promise<T>) | null, initial: T, deps: DependencyList): AsyncState<T> {
    const [data, setData] = useState<T>(initial);
    const [loading, setLoading] = useState(!!loader);
    const [error, setError] = useState("");
    const [nonce, setNonce] = useState(0);
    const loaderRef = useRef(loader);
    loaderRef.current = loader;

    useEffect(() => {
        const run = loaderRef.current;
        if (!run) {
            setLoading(false);
            return;
        }
        const ctrl = new AbortController();
        setLoading(true);
        setError("");
        run(ctrl.signal)
            .then((d) => !ctrl.signal.aborted && setData(d))
            .catch((e) => !isAbort(e) && !ctrl.signal.aborted && setError(errorMessage(e)))
            .finally(() => !ctrl.signal.aborted && setLoading(false));
        return () => ctrl.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, nonce]);

    const reload = useCallback(() => setNonce((n) => n + 1), []);
    return { data, loading, error, reload, setData };
}
