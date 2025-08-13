import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampEditComponent } from './champ-edit.component';

describe('ChampEditComponent', () => {
  let component: ChampEditComponent;
  let fixture: ComponentFixture<ChampEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChampEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChampEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
