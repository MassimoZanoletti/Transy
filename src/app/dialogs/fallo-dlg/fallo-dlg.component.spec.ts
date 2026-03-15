import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalloDlgComponent } from './fallo-dlg.component';

describe('FalloDlgComponent', () => {
  let component: FalloDlgComponent;
  let fixture: ComponentFixture<FalloDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalloDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FalloDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
