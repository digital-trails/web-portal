import { createSelector } from "@ngrx/store";
import { appState, AppState } from "../../app.module";


export namespace StudySelectors {
    export const selectStudies = createSelector(
        appState,
        (state: AppState) => state.studyState?.studies
    );
}
