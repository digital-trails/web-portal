import { createReducer, on } from "@ngrx/store";
import { cloneDeep } from 'lodash';
import { StudyActions } from "./study.actions";
import { StudyMeta } from "../../models/study-meta";


export interface StudyState {
  studies?: Record<string, StudyMeta>;
}

export const initialState: StudyState = {
  studies: undefined
};

export const StudyReducer = createReducer(
  initialState,
  on(StudyActions.setStudies, (state, { studies }) => ({ ...state, studies: cloneDeep(studies) })),
);