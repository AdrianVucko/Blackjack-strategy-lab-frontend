import { useCallback, useEffect, useRef, useState } from "react";
import type { AsyncState } from "./use-async";

/**
 * Like {@link useAsync} but triggered imperatively (e.g. a "Run" button) rather
 * than by dependency changes. Starts `idle`. Each `run` aborts any in-flight
 * call, and an unmount aborts the last one.
 */
export function useAction<T>() {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(
    async (fn: (signal: AbortSignal) => Promise<T>): Promise<void> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ status: "loading" });

      try {
        const data = await fn(controller.signal);
        if (!controller.signal.aborted) setState({ status: "success", data });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
    [],
  );

  return { state, run };
}
