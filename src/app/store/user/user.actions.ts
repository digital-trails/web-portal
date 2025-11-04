import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user";
import { OuraService } from "../../models/oura-service.model";

export namespace UserActions {
    export const setUser = createAction('[User] Set User', props<{ user: User }>());
    export const setStudyUsers = createAction('[User] Set Study Users', props<{ studyCode: string, users: User[] }>());
    export const setAllUsers = createAction('[User] Set All Users', props<{ users: User[] }>());
    export const setOuraService = createAction('[User] Set Oura Service', props<{ studyCode: string, ouraService: OuraService }>());
    export const updateOuraPAT = createAction('[User] Update Oura PAT', props<{ studyCode: string, userId?: string, name: string }>());
    export const updateUser = createAction('[User] Update User', props<{ path: string, value: any, userId: string }>());
}
