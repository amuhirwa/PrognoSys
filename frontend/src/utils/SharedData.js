import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  usersLogin: {
    user: null,
    token: null
  },
  page: "dashboard",
  profile: null
};

const sharedDataSlice = createSlice({
  name: "PrognoSys",
  initialState,
  reducers: {
    addUserLogin: (state, action) => {
      state.usersLogin = action.payload;
    },
    changepage: (state, action) => {
      state.page = action.payload;
    },
    addProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile.patient = { ...state.profile.patient, ...action.payload };
    },
    resetStateToDefault: (state) => {
      state.usersLogin = {
        user: null,
        token: null
      };
      state.page = "dashboard";
      state.profile = null;
    },
  },
});

export const selectCurrentUser = (state) => state.sharedData.usersLogin.user;
export const selectCurrentToken = (state) => state.sharedData.usersLogin.token;

export const {
  addUserLogin,
  changepage,
  addProfile,
  updateProfile,
  resetStateToDefault,
} = sharedDataSlice.actions;

export default sharedDataSlice.reducer;
