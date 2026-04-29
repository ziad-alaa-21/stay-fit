import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Database, Action } from "../types";
import { reducer } from "../data/reducer";
import { generateDemoData } from "../data/demoData";
import { dbKey } from "../utils/constants";

const StoreContext = createContext<{ db: Database; dispatch: React.Dispatch<Action> } | null>(null);

export { StoreContext };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, dispatch] = useReducer(reducer, undefined, () => {
    const saved = localStorage.getItem(dbKey);
    if (saved) return JSON.parse(saved) as Database;
    const demo = generateDemoData();
    localStorage.setItem(dbKey, JSON.stringify(demo));
    return demo;
  });
  
  useEffect(() => localStorage.setItem(dbKey, JSON.stringify(db)), [db]);
  
  return (
    <StoreContext.Provider value={{ db, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
