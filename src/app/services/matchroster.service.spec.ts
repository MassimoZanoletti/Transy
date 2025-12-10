import { TestBed } from '@angular/core/testing';

import { MatchrosterService } from './matchroster.service';

describe('MatchrosterService', () => {
  let service: MatchrosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchrosterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
