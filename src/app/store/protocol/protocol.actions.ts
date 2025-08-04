import { createAction, props } from "@ngrx/store";
import { StudyCodes } from "../../models/study-codes";

export namespace ProtocolActions {
    export const setStudyCodes = createAction('[Protocol] Set StudyCodes', props<{  studyCodes?: { [studyCode: string]: StudyCodes } }>());
}