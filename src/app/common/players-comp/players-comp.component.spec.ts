import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersCompComponent } from './players-comp.component';

describe('PlayersCompComponent', () => {
  let component: PlayersCompComponent;
  let fixture: ComponentFixture<PlayersCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayersCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
