import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerEditCompComponent } from './player-edit-comp.component';

describe('PlayerEditCompComponent', () => {
  let component: PlayerEditCompComponent;
  let fixture: ComponentFixture<PlayerEditCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerEditCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerEditCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
