import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreContext missing");
  return ctx;
}
