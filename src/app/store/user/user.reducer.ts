import { createReducer, on } from "@ngrx/store";
import { User } from "../../models/user";
import { UserActions } from "./user.actions";

export interface UserState {
  user?: User;
  users?: { [studyCode: string]: User[] };
}

export const initialState: UserState = {
  user: undefined,
  users: undefined
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.setUser, (state, { user }) => {
    return {
      ...state,
      user: user
    };
  }),
  on(UserActions.setUsers, (state, { studyCode, users }) => {
    return {
      ...state,
      users: {
        ...state.users,
        [studyCode]: users
      }
    };
  })
);