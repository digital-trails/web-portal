import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user";

export namespace UserActions  {
    export const setUser = createAction('[User] Set User', props<{ user: User }>());
    export const setUsers = createAction('[User] Set Users', props<{ studyCode: string, users: User[] }>());
}
