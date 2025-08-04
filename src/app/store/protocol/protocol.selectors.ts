import { createSelector } from "@ngrx/store";
import { appState, AppState } from "../../app.module";

export namespace ProtocolSelectors {
    export const selectStudyCodes = createSelector(
        appState,
        (state: AppState) => state.protocolState?.studyCodes
    );
}
