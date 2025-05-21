import { createSelector } from "@ngrx/store";
import { UserState } from "./user.reducer";
import { appState, AppState } from "../../app.config";

export namespace UserSelectors {
    export const selectClientPrincipal = createSelector(
        appState,
        (state: AppState) => state.userState?.clientPrincipal
    );

    export const selectIsLoaded = createSelector(
        selectClientPrincipal,
        (clientPrincipal) => clientPrincipal !== undefined && clientPrincipal?.userId !== null
    );
}