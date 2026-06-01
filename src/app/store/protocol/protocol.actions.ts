import { createAction, props } from "@ngrx/store";
import { StudyCodes } from "../../models/study-codes";
import { Protocol, ProtocolStatus } from "../../models/protocol";

export namespace ProtocolActions {
    export const setStudyCodes = createAction('[Protocol] Set StudyCodes', props<{ studyCodes?: { [studyCode: string]: StudyCodes } }>());

    export const setProtocols = createAction('[Protocol] Set Protocols', props<{ protocols: Protocol[] }>());
    export const addProtocol = createAction('[Protocol] Add Protocol', props<{ protocol: Protocol }>());
    export const updateProtocol = createAction('[Protocol] Update Protocol', props<{ protocol: Protocol }>());
    export const deleteProtocol = createAction('[Protocol] Delete Protocol', props<{ id: string }>());
    export const setProtocolStatus = createAction('[Protocol] Set Status', props<{ id: string; status: ProtocolStatus }>());
}
