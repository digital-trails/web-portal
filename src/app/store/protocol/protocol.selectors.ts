import { createSelector } from "@ngrx/store";
import { appState, AppState } from "../../app.module";

export namespace ProtocolSelectors {
    export const selectStudyCodes = createSelector(
        appState,
        (state: AppState) => state.protocolState?.studyCodes
    );

    export const selectProtocols = createSelector(
        appState,
        (state: AppState) => state.protocolState?.protocols ?? []
    );

    export const selectProtocolById = (id: string) => createSelector(
        selectProtocols,
        (protocols) => protocols.find(p => p.id === id)
    );
}
