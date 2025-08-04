import { createReducer, on } from "@ngrx/store";
import { User } from "../../models/user";
import { UserActions } from "./user.actions";
import { OuraService } from "../../models/oura-service.model";
import { cloneDeep, set } from 'lodash';


export interface UserState {
  user?: User;
  studyUsers?: { [studyCode: string]: User[] };
  ouraServices?: { [studyCode: string]: OuraService };
  allUsers?: User[]
}

export const initialState: UserState = {
  user: undefined,
  studyUsers: undefined,
  ouraServices: undefined,
  allUsers: undefined
};

export const UserReducer = createReducer(
  initialState,
  on(UserActions.setUser, (state, { user }) => {
    return {
      ...state,
      user: user
    };
  }),
  on(UserActions.setStudyUsers, (state, { studyCode, users }) => {
    return {
      ...state,
      studyUsers: {
        ...state.studyUsers,
        [studyCode]: users
      }
    };
  }),
  on(UserActions.setAllUsers, (state, { users }) => {
    return {
      ...state,
      allUsers: users
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

  on(UserActions.updateUser, (state, { path, value, userId }) => {
    const normalizedPath = path.replace(/^\//, '').replace(/\//g, '.');
    const updatedUsers = state.allUsers?.map(user => {
      if (user.id !== userId) return user;
      const updatedUser = cloneDeep(user);
      set(updatedUser, normalizedPath, value);

      return updatedUser;
    });

    return {
      ...state,
      allUsers: updatedUsers
    };
  })
);