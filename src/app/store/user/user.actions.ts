import { createAction, props } from "@ngrx/store";
import { ClientPrincipal } from "../../models/user";

export namespace UserActions  {
    export const setClientPrincipal = createAction('[User] Set ClientPrincipal', props<{ clientPrincipal?: ClientPrincipal }>());
    export const setIsLoaded = createAction('[User] Set is loaded',props<{ isloaded: boolean }>());
}
