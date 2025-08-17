import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchCompComponent } from './bench-comp.component';

describe('BenchCompComponent', () => {
  let component: BenchCompComponent;
  let fixture: ComponentFixture<BenchCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BenchCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
