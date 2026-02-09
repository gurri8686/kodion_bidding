// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  userId: null,
  user: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
 setCredentials: (state, action) => {
  const { token, userId, user } = action.payload;

  // ✅ If the state is null (due to bad localStorage), replace it entirely
  if (!state) {
    return { token, userId, user };
  }

  // ✅ If state is valid, mutate it normally
  state.token = token;
  state.userId = userId;
  state.user = user;
}
,
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
