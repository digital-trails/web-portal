import { createReducer, on } from "@ngrx/store";
import { User } from "../../models/user";
import { UserActions } from "./user.actions";

export interface UserState {
  user?: User;
}

export const initialState: UserState = {
  user: undefined
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.setUser, (state, { user }) => {
    return {
      ...state,
      user: user
    };
  })
);