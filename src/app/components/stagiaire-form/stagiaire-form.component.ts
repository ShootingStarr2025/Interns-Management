import { Component } from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { StagiaireService } from '../../services/stagiaire.service';

@Component({
  selector: 'app-stagiaire-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stagiaire-form.component.html',
  styleUrl: './stagiaire-form.component.css'
})

export class StagiaireFormComponent {

      constructor (private stagiaireService: StagiaireService) {}



      stagiaireForm = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      profile: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      number: new FormControl('', [Validators.pattern('^[0-9]{10}$')]),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      provenance: new FormControl('', Validators.required),
      supervisor: new FormGroup({
        name: new FormControl('', Validators.required),
        contact: new FormControl('', Validators.required)
      }),

      theme: new FormControl('', Validators.required),
      profession: new FormControl('', Validators.required)
      // duration not included in here
    });


    // get duree(): number {
    //   const start = this.stagiaireForm.get('startDate')?.value;
    //   const end = this.stagiaireForm.get('endDate')?.value;

    //   if (!start || !end) return 0;

    //   const startDate = new Date(start);
    //   const endDate = new Date(end);
    //   const diffTime = endDate.getTime() - startDate.getTime();
    //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    //   return diffDays > 0 ? diffDays : 0;
    // }
    
    onSubmit() {
      const formValue = this.stagiaireForm.value;
      console.log('Submitted:', formValue);
      this.stagiaireService.addStagiaire(formValue).subscribe({
        next:() => {
          alert('Trainee saved');
          this.stagiaireForm.reset()
        },
        error:() => {
          alert('Error occurred during trainee registration')
        }
      })
    }
    
    
}
