import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagiaireEditComponent } from './stagiaire-edit.component';

describe('StagiaireEditComponent', () => {
  let component: StagiaireEditComponent;
  let fixture: ComponentFixture<StagiaireEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagiaireEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagiaireEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
