import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerCompComponent } from './timer-comp.component';

describe('TimerCompComponent', () => {
  let component: TimerCompComponent;
  let fixture: ComponentFixture<TimerCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimerCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
