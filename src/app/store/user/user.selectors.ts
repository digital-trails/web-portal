import { createSelector } from "@ngrx/store";
import { UserState } from "./user.reducer";

export namespace UserActions {
    export const selectUser = (state: UserState) => state;

    export const selectClaims = createSelector(
        selectUser,
        (state: UserState) => state.claims
    );

    export const selectIsLoaded = createSelector(
        selectClaims,
        (claims) => claims !== undefined && claims !== null
      );
}