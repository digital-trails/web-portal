import { createReducer, on } from "@ngrx/store";
import { UserActions } from "./user.actions";
import { Role } from "../../models/role";


export interface UserState {
  roles?: Record<string, Role[]>;
}

export const initialState: UserState = {
  roles: undefined,
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.setRoles, (state, { roles }) => {
    return {
      ...state,
      roles: roles
    };
  })
);