import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CentroDetalleComponent } from './centro-detalle.component';

describe('CentroDetalleComponent', () => {
  let component: CentroDetalleComponent;
  let fixture: ComponentFixture<CentroDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CentroDetalleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CentroDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
