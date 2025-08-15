import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseEditComponent } from './phase-edit.component';

describe('PhaseEditComponent', () => {
  let component: PhaseEditComponent;
  let fixture: ComponentFixture<PhaseEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhaseEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhaseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
