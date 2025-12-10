import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterCompComponent } from './roster-comp.component';

describe('RosterCompComponent', () => {
  let component: RosterCompComponent;
  let fixture: ComponentFixture<RosterCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RosterCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RosterCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
