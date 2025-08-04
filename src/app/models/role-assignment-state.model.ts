import { KeyValue } from "@angular/common";

export interface RoleAssignment {
    selectedRole?: string;
    selectedUser?: string;
    state: RoleAssignmentState;
}

export enum RoleAssignmentState {
    NotStarted,
    SelectingAssignment,
    SelectingUser,
    Finalize
}