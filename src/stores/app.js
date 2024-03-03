import {create} from "zustand";

export const useAppStore = create((set) => ({
    loading: true,
    updateLoadingState: (state) => set({ loading: state }),

    user: null,
    setUser: (user) => set({ user })

}))

export const useAppLoadingState = () => useAppStore(state =>  state.loading)
export const useUserInfos = () => useAppStore(state =>  state.user)