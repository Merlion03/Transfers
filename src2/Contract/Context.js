import { useContext, createContext } from "react"
export const Context = createContext()
export const UseContext = () => useContext(Context)