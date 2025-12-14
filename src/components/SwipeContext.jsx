// components/SwipeContext.jsx
import { createContext, useContext, useState } from "react";

const SwipeContext = createContext();

export function SwipeProvider({ children }) {
  const [swipeEnabled, setSwipeEnabled] = useState(true);

  return (
    <SwipeContext.Provider value={{ swipeEnabled, setSwipeEnabled }}>
      {children}
    </SwipeContext.Provider>
  );
}

export function useSwipe() {
  return useContext(SwipeContext);
}
