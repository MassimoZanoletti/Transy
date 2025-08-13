import { TestBed } from '@angular/core/testing';

import { CampionatiService } from './campionati.service';

describe('CampionatiService', () => {
  let service: CampionatiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampionatiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
