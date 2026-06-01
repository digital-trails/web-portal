import { createReducer, on } from "@ngrx/store";
import { StudyCodes } from "../../models/study-codes";
import { Protocol } from "../../models/protocol";
import { ProtocolActions } from "./protocol.actions";

export interface ProtocolState {
    studyCodes?: { [studyCode: string]: StudyCodes };
    protocols: Protocol[];
}

export const initialState: ProtocolState = {
    studyCodes: undefined,
    protocols: [],
};

export const ProtocolReducer = createReducer(
    initialState,
    on(ProtocolActions.setStudyCodes, (state, { studyCodes }) => ({
        ...state,
        studyCodes
    })),
    on(ProtocolActions.setProtocols, (state, { protocols }) => ({
        ...state,
        protocols
    })),
    on(ProtocolActions.addProtocol, (state, { protocol }) => ({
        ...state,
        protocols: [...state.protocols, protocol]
    })),
    on(ProtocolActions.updateProtocol, (state, { protocol }) => ({
        ...state,
        protocols: state.protocols.map(p => p.id === protocol.id ? protocol : p)
    })),
    on(ProtocolActions.deleteProtocol, (state, { id }) => ({
        ...state,
        protocols: state.protocols.filter(p => p.id !== id)
    })),
    on(ProtocolActions.setProtocolStatus, (state, { id, status }) => ({
        ...state,
        protocols: state.protocols.map(p =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
        )
    })),
);
