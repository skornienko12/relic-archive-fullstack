import { useEffect, useState } from 'react';
import { errorMessage } from './api/client';
import type { RequestState } from './types';

export function useRequest<T>(load: () => Promise<T>, deps: readonly unknown[]): RequestState<T> {
  const [state, setState] = useState<RequestState<T>>({ status: 'loading' });
  // Caller supplies stable loaders or primitive dependencies.
  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load().then((data) => { if (active) setState({ status: 'data', data }); })
      .catch((error: unknown) => { if (active) setState({ status: 'error', message: errorMessage(error) }); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
