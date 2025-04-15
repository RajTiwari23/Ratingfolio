import {create} from 'zustand';

export const useUserStore = create<State & Actions>((set)=>({
    user:null,
    setUserData:(user)=>set({user}),
    clearUserData:()=>set({user:null})
}))