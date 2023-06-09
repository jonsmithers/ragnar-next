import { useEffect, useRef, useState } from 'react';

/** https://gist.github.com/csandman/cb1b9cae2334415b0b20e04b228c1016#file-use-debounce-js */
export const useDebounce = <T extends object>(
  value: T,
  delay: number
): { debouncedValue: T | 'not yet'; isDebouncing: boolean } => {
  const [state, setState] = useState<{
    debouncedValue: T | 'not yet';
    isDebouncing: boolean;
  }>({ debouncedValue: 'not yet', isDebouncing: false });
  const [prevValue, setPrevValue] = useState<T | 'not yet'>('not yet');

  if (value !== prevValue) {
    setPrevValue(value);
    setState((state) => ({ ...state, isDebouncing: true }));
    // since we updated state during render, react will rerender before commiting
  }
  useEffect(() => {
    const handler = setTimeout(() => {
      setState({ debouncedValue: value, isDebouncing: false });
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return state;
};

export const useOnDebounce = <T extends object>(
  value: T,
  handler: (value: T) => void,
  delay: number
): { isDebouncing: boolean } => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [prevValue, setPrevValue] = useState<T | typeof notYet>(notYet);
  if (value !== prevValue) {
    setPrevValue(value);
    setIsDebouncing(true);
    // since we updated state during render, react will rerender before commiting
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      handlerRef.current(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay, value]);
  return { isDebouncing };
};

const notYet = Symbol('not yet');
