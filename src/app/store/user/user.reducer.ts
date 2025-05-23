import { createReducer, on } from "@ngrx/store";
import { UserActions } from "./user.actions";
import { ClientPrincipal } from "../../models/user";

export interface UserState {
  clientPrincipal?: ClientPrincipal;
}

export const initialState: UserState = {
  clientPrincipal: undefined
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.setClientPrincipal, (state, { clientPrincipal }) => {
    return {
      ...state,
      clientPrincipal: clientPrincipal
    };
  })
);