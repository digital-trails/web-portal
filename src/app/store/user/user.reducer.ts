import { createReducer, on } from "@ngrx/store";
import { setIsLoaded, setUserClaims } from "./user.actions";

export interface UserState {
  claims: any;
}

export const initialState: UserState = {
  claims: null,
};

export const UserReducer = createReducer(
  initialState,
  on(setUserClaims, (state, { claims }) => {
    return {
      ...state,
      claims
    };
  })
);