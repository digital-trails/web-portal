import { createAction, props } from "@ngrx/store";

export const setUserClaims = createAction('[User] Set Claims',props<{ claims: any }>());
export const setIsLoaded = createAction('[User] Set is loaded',props<{ isloaded: boolean }>());
