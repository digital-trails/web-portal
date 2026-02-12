import { createSelector } from "@ngrx/store";
import { appState, AppState } from "../../app.module";


export namespace UserSelectors {
    export const selectRoles = createSelector(
        appState,
        (state: AppState) => state.userState?.roles
    );
}
