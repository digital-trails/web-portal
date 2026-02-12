import { createAction, props } from "@ngrx/store";
import { Role } from "../../models/role";

export namespace UserActions {
    export const setRoles = createAction('[User] Set Roles', props<{ roles: Record<string, Role[]> }>());

}
