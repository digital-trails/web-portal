import { createAction, props } from "@ngrx/store";
import { StudyMeta } from "../../models/study-meta";

export namespace StudyActions {
export const setStudies = createAction('[Study] Set Studies', props<{ studies: Record<string, StudyMeta> }>());
}
