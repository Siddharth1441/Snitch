import { createSlice } from "@reduxjs/toolkit";


const cartSlice = createSlice({
    name:"cart",
    initialState:{
        items:[]

    },
    reducers:{
        setItems:(state,action)=>{
            state.items = action.payload
        },
        addItem:(state,action)=>{
            state.items.push(action.payload)
        },
        removeItem:(state,action)=>{
            state.items = state.items.filter(item => item._id !== action.payload)
        },
        clearCart:(state)=>{
            state.items = []
        },
    }
})

export const {setItems,addItem,removeItem,clearCart} = cartSlice.actions

export default cartSlice.reducer
