import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsCompComponent } from './points-comp.component';

describe('PointsCompComponent', () => {
  let component: PointsCompComponent;
  let fixture: ComponentFixture<PointsCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointsCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PointsCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
