import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user";
import { OuraService } from "../../models/oura-service.model";

export namespace UserActions  {
    export const setUser = createAction('[User] Set User', props<{ user: User }>());
    export const setUsers = createAction('[User] Set Users', props<{ studyCode: string, users: User[] }>());
    export const setOuraService = createAction('[User] Set Oura Service', props<{ studyCode: string, ouraService: OuraService }>());
    export const updateOuraPAT = createAction('[User] update oura pat', props<{ studyCode: string, userId: string, name: string }>());
}
