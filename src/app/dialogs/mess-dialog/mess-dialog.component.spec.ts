import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { MessDialogPrimeNgComponent } from './mess-dialog.component';

describe('MessDialogPrimeNgComponent', () => {
  let component: MessDialogPrimeNgComponent;
  let fixture: ComponentFixture<MessDialogPrimeNgComponent>;
  let ref: jasmine.SpyObj<DynamicDialogRef>;

  beforeEach(async () => {
    ref = jasmine.createSpyObj<DynamicDialogRef>('DynamicDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [MessDialogPrimeNgComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: { title: 'Titolo', message: '<b>Messaggio</b>' } } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessDialogPrimeNgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('si crea e usa "info" come tipo predefinito', () => {
    expect(component).toBeTruthy();
    expect(component.data.messtype).toBe('info');
  });

  it('il bottone principale chiude con "primary"', () => {
    component.onPrimary();
    expect(ref.close).toHaveBeenCalledWith('primary');
  });
});
