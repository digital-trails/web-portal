// console.component.ts
import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable, take } from 'rxjs';
import { User } from '../models/user';
import { StudyCodes } from '../models/study-codes';
import { RoleAssignment, RoleAssignmentState } from '../models/role-assignment-state.model';
import { UserFacade } from '../store/user/user.facade';
import { LoadingService } from '../services/loading.service';
import { ProtocolFacade } from '../store/protocol/protocol.facade';
import { tap } from 'lodash';

@Component({
  selector: 'app-console',
  standalone: false,
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent implements OnInit {
  activeTab: string = 'studies'
  selectedStudy: string = '';
  roleAssignment: RoleAssignment = {
    state: RoleAssignmentState.NotStarted
  };
  RoleAssignmentState = RoleAssignmentState
  roles: string[] = ['Admin']
  pageData$?: Observable<{
    user: User | undefined;
    allUsers: User[] | undefined;
    studyCodes: {
      [studyCode: string]: StudyCodes;
    };
  }>;

  constructor(private protocolFacade: ProtocolFacade, private userFacade: UserFacade, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.pageData$ = combineLatest([
      this.userFacade.getUser$(),
      this.userFacade.getAllUsers$(),
      this.protocolFacade.getStudyCodes$()]).pipe(
        map(([user, allUsers, studyCodes]) => {
          if (!user?.super_admin) {
            studyCodes = Object.fromEntries(
              Object.entries(studyCodes).filter(([studyCode]) => {
                return user?.admin?.studies[studyCode.toLocaleLowerCase()]?.super_admin;
              })
            );
          }
          if (user?.super_admin && !this.roles.includes('Super Admin')) this.roles.push('Super Admin');
          this.roleAssignment = {
            state: RoleAssignmentState.NotStarted
          }

          return {
            user,
            allUsers,
            studyCodes
          }
        })
      );
  }

  showSection(section: string): void {
    this.activeTab = section;
  }

  studyAdmins(allUsers: User[] | undefined) {
    return allUsers?.filter(u => u.admin?.studies[this.selectedStudy]);
  }

  assignRole() {
    if (this.roleAssignment.selectedUser) {
      this.loadingService.loadingOn();
      const path: string = `/admin/studies/${this.selectedStudy}`
      var val: any;
      if (this.roleAssignment.selectedRole == 'Admin') {
        val = {};
      }

      if (this.roleAssignment.selectedRole == 'Super Admin') {
        val = {
          super_admin: true
        }
      }

      this.userFacade.updateUser$(this.roleAssignment.selectedUser, 'set', path, val).pipe(
        take(1)
      ).subscribe(_ => this.loadingService.loadingOff());
    }
  }

  removeRole(userId: string) {
   this.loadingService.loadingOn();
      const path: string = `/admin/studies/${this.selectedStudy}`
      this.userFacade.updateUser$(userId, 'remove', path).pipe(
        take(1)
      ).subscribe(_ => this.loadingService.loadingOff());
  }
}