import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { UserState } from "../../types/redux";
import { getUser } from "../../services/AuthService";

const user = getUser();
const initialState: UserState = {
  profileImage: user?.profileImage,
};

const userSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    updateProfileImage(state, action) {
      state.profileImage = action.payload;
    },
  },
});

export default userSlice.reducer;
export const userActions = userSlice.actions;
