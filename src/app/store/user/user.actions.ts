import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user";

export namespace UserActions  {
    export const setUser = createAction('[User] Set User', props<{ user?: User }>());
}
