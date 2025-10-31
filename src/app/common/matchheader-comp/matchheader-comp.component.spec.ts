import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchheaderCompComponent } from './matchheader-comp.component';

describe('MatchheaderCompComponent', () => {
  let component: MatchheaderCompComponent;
  let fixture: ComponentFixture<MatchheaderCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchheaderCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchheaderCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
