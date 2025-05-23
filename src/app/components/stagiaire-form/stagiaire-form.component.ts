import { Component } from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stagiaire-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './stagiaire-form.component.html',
  styleUrl: './stagiaire-form.component.css'
})

export class StagiaireFormComponent {
      stagiaireForm = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      profile: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      number: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      provenance: new FormControl(''),
      supervisor: new FormGroup({
        name: new FormControl(''),
        contact: new FormControl('')
      }),

      theme: new FormControl(''),
      profession: new FormControl('')
      // duration not included in here
    });


    get duree(): number {
      const start = this.stagiaireForm.get('startDate')?.value;
      const end = this.stagiaireForm.get('endDate')?.value;

      if (!start || !end) return 0;

      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays > 0 ? diffDays : 0;
    }

    onSubmit() {
      const formValue = this.stagiaireForm.value;
      console.log('Submitted:', formValue);
      console.log('Stage duration:', this.duree, 'days');
    }   
}
