import { createSlice } from "@reduxjs/toolkit";
import { createApiThunkPublic, createExtraReducersForThunk } from "../../utils/apiThunk";
const initialState = {
    sendCoinData: {},
    getAllTransactionListData: {},
    createSwapMetaData: {},
    swapQuoteData: {},
    swapExecuteData: {},
    swapApprovalData: {},
}


export const sendCoin = createApiThunkPublic('sendCoin', 'transaction/sendCoin', 'POST')
export const getAllTransactionList = createApiThunkPublic('getAllTransactionList', 'transaction/getAllTransactionList', 'POST')
export const createSwapMetaData = createApiThunkPublic('createSwapMetaData', 'coin/createSwapMetaData', 'POST')

export const swapQuote = createApiThunkPublic('swapQuote', 'swap/quote', 'POST')
export const swapApproval = createApiThunkPublic('swapApproval', 'swap/execute-approval', 'POST')
export const swapExecute = createApiThunkPublic('swapExecute', 'swap/execute', 'POST')


export const CoinTransactionSlice = createSlice({
    name: 'CoinTransaction',
    initialState,
    extraReducers: builder => {
        createExtraReducersForThunk(builder, sendCoin, 'sendCoinData')
        createExtraReducersForThunk(builder, getAllTransactionList, 'getAllTransactionListData')
        createExtraReducersForThunk(builder, swapQuote, 'swapQuoteData')
        createExtraReducersForThunk(builder, swapExecute, 'swapExecuteData')
        createExtraReducersForThunk(builder, createSwapMetaData, 'createSwapMetaData')
        createExtraReducersForThunk(builder, swapApproval, 'swapApprovalData')
    }
})

export default CoinTransactionSlice.reducer