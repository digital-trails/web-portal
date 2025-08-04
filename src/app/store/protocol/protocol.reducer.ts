import { createReducer, on } from "@ngrx/store";
import { StudyCodes } from "../../models/study-codes";
import { ProtocolActions } from "./protocol.actions";

export interface ProtocolState {
    studyCodes?: { [studyCode: string]: StudyCodes };
}

export const initialState: ProtocolState = {
    studyCodes: undefined,
};


export const ProtocolReducer = createReducer(
    initialState,
    on(ProtocolActions.setStudyCodes, (state, { studyCodes }) => {
        return {
            ...state,
            studyCodes
        };
    }),
);
