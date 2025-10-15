import { useEffect } from "react";

const useRealTimeUpdates = (callback, interval = 5000) => {
  useEffect(() => {
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval]);
};

export default useRealTimeUpdates;
