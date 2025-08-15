import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCompComponent } from './player-comp.component';

describe('PlayerCompComponent', () => {
  let component: PlayerCompComponent;
  let fixture: ComponentFixture<PlayerCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
