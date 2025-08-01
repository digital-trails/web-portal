import { createReducer, on } from "@ngrx/store";
import { User } from "../../models/user";
import { UserActions } from "./user.actions";
import { OuraService } from "../../models/oura-service.model";

export interface UserState {
  user?: User;
  users?: { [studyCode: string]: User[] };
  ouraServices?: { [studyCode: string]: OuraService };
}

export const initialState: UserState = {
  user: undefined,
  users: undefined,
  ouraServices: undefined
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
  }),
  on(UserActions.setOuraService, (state, { studyCode, ouraService }) => {
    return {
      ...state,
      ouraServices: {
        ...state.ouraServices,
        [studyCode]: ouraService
      }
    };
  }),
  on(UserActions.updateOuraPAT, (state, { studyCode, userId, name }) => {
    var existingService = state.ouraServices?.[studyCode];
    var existingTokens = existingService?.tokens;

    return {
      ...state,
      ouraServices: {
        ...state.ouraServices,
        [studyCode]: {
          ...existingService,
          tokens: {
            ...existingTokens,
            [name]: userId
          }
        }
      }
    };
  }),
);