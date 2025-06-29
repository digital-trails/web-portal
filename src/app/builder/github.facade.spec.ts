import { TestBed } from '@angular/core/testing';

import { GithubFacade } from './github.facade';

describe('FileServiceService', () => {
  let service: GithubFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GithubFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
