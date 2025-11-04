import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponentComponent } from './loading.component';

describe('LoadingComponentComponent', () => {
  let component: LoadingComponentComponent;
  let fixture: ComponentFixture<LoadingComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
