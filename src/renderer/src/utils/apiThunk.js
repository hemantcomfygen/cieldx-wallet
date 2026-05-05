import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosImage, axiosPrivate, axiosPublic } from "./axiosProvider"

const replacePathParams = (url, payload) => {
    if (!payload) {
        return { finalUrl: url, cleanedPayload: {}, isPathParamUsed: false };
    }

    const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

    // Don't clone FormData (it would drop the file)
    if (isFormData) {
        return { finalUrl: url, cleanedPayload: payload, isPathParamUsed: false };
    }

    const newPayload = { ...payload };
    let isPathParamUsed = false;

    const finalUrl = url.replace(/:([a-zA-Z_]+)/g, (_, key) => {
        if (!(key in newPayload)) {
            throw new Error(`Missing path param: ${key}`);
        }
        isPathParamUsed = true;
        const value = newPayload[key];
        delete newPayload[key];
        return value;
    });

    return { finalUrl, cleanedPayload: newPayload, isPathParamUsed };
};

// Helper function for creating API thunks
const createApiThunk = (axiosInstance) => {
    return (name, url, method = "POST") => {
        return createAsyncThunk(name, async (payload, { rejectWithValue }) => {
            try {
                // Prepare config depending on method (GET doesn't use data)
                const { finalUrl, cleanedPayload, isPathParamUsed } = replacePathParams(url, payload);
                const config = {
                    method,
                    url: finalUrl,
                };

                if (method === "GET") {
                    if (!isPathParamUsed) {
                        config.params = cleanedPayload; // fallback to query params
                    }
                } else {
                    config.data = cleanedPayload;
                }

                const response = await axiosInstance(config);
                return response?.data || response;
            } catch (error) {
                // Improved error handling for network issues and server errors
                const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong!";
                return rejectWithValue(errorMessage);
            }
        });
    };
};


// Creating public and private API thunks
export const createApiThunkPublic = createApiThunk(axiosPublic);
export const createApiThunkPrivate = createApiThunk(axiosPrivate);
export const createApiThunkPrivateImage = createApiThunk(axiosImage);
export const createApiThunkPublicImage = createApiThunk(axiosImage);
// Extra reducers to handle async thunk actions
export const createExtraReducersForThunk = (builder, thunkAction, sliceName) => {
    builder
        .addCase(thunkAction.pending, (state) => {
            state.loading = true;
            state.error = null;
            if (!state[sliceName]) state[sliceName] = {};
        })
        .addCase(thunkAction.fulfilled, (state, action) => {
            state.loading = false;
            if (!state[sliceName]) state[sliceName] = {};
            state[sliceName].data = action.payload || {};
        })
        .addCase(thunkAction.rejected, (state, action) => {
            state.loading = false;
            if (!state[sliceName]) state[sliceName] = {};
            state[sliceName].error = action?.payload || `Something went wrong while fetching ${sliceName} details.`;
        });
};
