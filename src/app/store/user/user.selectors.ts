import { createSelector } from "@ngrx/store";
import { appState, AppState } from "../../app.module";


export namespace UserSelectors {
    export const selectUser = createSelector(
        appState,
        (state: AppState) => state.userState?.user
    );
    export const selectUsers = (studyCode: string) =>
        createSelector(
            appState,
            (state: AppState) => state.userState?.users?.[studyCode]
        );

    export const selectOuraService = (studyCode: string) =>
        createSelector(
            appState,
            (state: AppState) => state.userState?.ouraServices?.[studyCode]
        );
}
