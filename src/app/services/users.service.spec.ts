import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './users.service';

// Nessuna chiamata reale: le richieste vanno al backend finto di HttpTestingController
describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAllData chiede operation=all', () => {
    service.getAllData().subscribe();
    const req = http.expectOne(r => r.url.includes('api_users.php') && r.url.includes('operation=all'));
    expect(req.request.method).toBe('GET');
    req.flush({ elements: [] });
  });
});
