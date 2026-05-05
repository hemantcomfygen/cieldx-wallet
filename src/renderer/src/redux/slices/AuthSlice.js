import { createSlice } from "@reduxjs/toolkit";
import { createApiThunkPrivate, createApiThunkPublicImage, createApiThunkPublic, createExtraReducersForThunk } from "../../utils/apiThunk";
import { sessionStorageRemoveItem } from "../../utils/GlobalFunction";
const initialState = {
    generatePassphraseData: {},
    getAddressAndBalanceOfPassphraseData: {},
    getExistingWalletData: {},
    removeWalletData: {},
    activeWalletData: {},
    walletBackupData: {},

    // coin api
    getCoinListData: {},
    getCoinListOfWalletData: {},
    getCoinDetailsData: {},
    getPassPhraseOfWalletData: {},
    getPrivateKeOfWalletData: {},

    // wallet api
    getWalletOfUserData: {},
    getAllWalletListData: {},

    // community
    getAllPostsData: {}
}

//  https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd   real time coin market value

export const generatePassphrase = createApiThunkPublic('generatePassphrase', 'data/generatePassphrase', 'POST')
export const getExistingWallet = createApiThunkPublic('getExistingWallet', 'data/getExistingWallet', 'POST')
export const getAllWalletList = createApiThunkPublic('getAllWalletList', 'data/getPassphraseList', 'POST')
export const removeWallet = createApiThunkPublic('removeWallet', 'data/removeWallet', 'POST')
export const activeWallet = createApiThunkPublic('activeWallet', 'coin/activeWallet', 'POST')
export const editWalletName = createApiThunkPublic('editWalletName', 'data/editWalletName', 'POST')
export const walletBackup = createApiThunkPublic('walletBackup', 'data/walletBackup', 'POST')

export const bulkImport = createApiThunkPublic('bulkImport', 'data/bulkImportWallet', 'POST')


export const getAddressAndBalanceOfPassphrase = createApiThunkPublic('getAddressAndBalanceOfPassphrase', 'data/getAddressAndBalanceOfPassphrase', 'POST')
export const getAddressAndBalanceOfPassphraseV2 = createApiThunkPublic('getAddressAndBalanceOfPassphraseV2', 'data/getAddressAndBalanceOfPassphraseV2', 'POST')

// coin api
export const getCoinList = createApiThunkPublic('getCoinList', 'coin/getCoinList', 'GET')
export const getCoinListOfWallet = createApiThunkPrivate('getCoinListOfWallet', 'coin/getCoinListOfWallet', 'GET')
export const getCoinDetails = createApiThunkPrivate('getCoinDetails', 'coin/getCoinDetails', 'GET')
export const getWalletOfUser = createApiThunkPrivate('getWalletOfUser', 'coin/getWalletOfUser', 'GET')
export const getPassPhraseOfWallet = createApiThunkPublic('getPassPhraseOfWallet', 'coin/getPassPhraseOfWallet', 'POST')
export const getPrivateKeOfWallet = createApiThunkPublic('getPrivateKeOfWallet', 'coin/getPrivateKeOfWallet', 'POST')

// community
export const uploadImage = createApiThunkPublicImage('uploadImage', 'community/upload', 'POST')
export const addPost = createApiThunkPublic('addPost', 'community/post', 'POST')
export const updatePost = createApiThunkPublic('updatePost', 'community/updatePost', 'POST')
export const getAllPosts = createApiThunkPublic('getAllPosts', 'community/getAllPosts', 'GET')
export const findUniq = createApiThunkPublic('findUniq', 'community/findUniq', 'POST')
export const deletePost = createApiThunkPublic('deletePost', 'community/deletePost', 'POST')


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: () => {
            sessionStorageRemoveItem()
            window.location.href = "/login"
        }
    },
    extraReducers: builder => {
        createExtraReducersForThunk(builder, generatePassphrase, 'generatePassphraseData')
        createExtraReducersForThunk(builder, getExistingWallet, 'getExistingWalletData')
        createExtraReducersForThunk(builder, getAllWalletList, 'getAllWalletListData')
        createExtraReducersForThunk(builder, removeWallet, 'removeWalletData')
        createExtraReducersForThunk(builder, activeWallet, 'activeWalletData')
        createExtraReducersForThunk(builder, walletBackup, 'walletBackupData')


        createExtraReducersForThunk(builder, getAddressAndBalanceOfPassphrase, 'getAddressAndBalanceOfPassphraseData')
        createExtraReducersForThunk(builder, getAddressAndBalanceOfPassphraseV2, 'getAddressAndBalanceOfPassphraseData')

        // coin api
        createExtraReducersForThunk(builder, getCoinList, 'getCoinListData')
        createExtraReducersForThunk(builder, getCoinListOfWallet, 'getCoinListOfWalletData')
        createExtraReducersForThunk(builder, getCoinDetails, 'getCoinDetailsData')
        createExtraReducersForThunk(builder, getWalletOfUser, 'getWalletOfUserData')
        createExtraReducersForThunk(builder, getPassPhraseOfWallet, 'getPassPhraseOfWalletData')
        createExtraReducersForThunk(builder, getPrivateKeOfWallet, 'getPrivateKeOfWalletData')

        // community
        createExtraReducersForThunk(builder, getAllPosts, 'getAllPostsData')
    }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer