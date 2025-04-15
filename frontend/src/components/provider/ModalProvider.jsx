import {createContext, useContext, useState} from "react"; 


const ModalContext = createContext(false)

export function useModal(){
    const context = useContext(ModalContext)
    if(!context) throw new Error("useModal must be used within a ModalProvider")
    return context
}

export default function ModalProvider({children}){
    const [isOpen, setIsOpen] = useState(false);
    function toggleModal(){
        setIsOpen(!isOpen)
    }
    return (
        <ModalContext.Provider value={{isOpen, toggleModal}}>
            {children}
        </ModalContext.Provider>
    )
}