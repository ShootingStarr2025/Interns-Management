import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StagiaireService } from '../../services/stagiaire.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stagiaire-edit',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './stagiaire-edit.component.html',
  styleUrl: './stagiaire-edit.component.css',
})
export class StagiaireEditComponent implements OnInit {
  constructor(
    private stagiaireService: StagiaireService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  stagiaireId!: string;
  stagiaireForm!: FormGroup;

  ngOnInit(): void {
    this.stagiaireId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.stagiaireId) {
      this.router.navigate(['/']);
      return;
    }

    this.stagiaireService.getStagiaireById(this.stagiaireId).subscribe({
      next: (data) => {
        if (!data) {
          this.router.navigate(['/']);
          return;
        }

        this.initialDataForm(data);
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  initialDataForm(data: any) {
    console.log(data);
    this.stagiaireForm = new FormGroup({
      name: new FormControl(data.name, Validators.required),
      surname: new FormControl(data.surname, Validators.required),
      profile: new FormControl(data.profile, Validators.required),
      email: new FormControl(data.email, [
        Validators.required,
        Validators.email,
      ]),
      number: new FormControl(data.number, [Validators.pattern('^[0-9]{10}$')]),
      startDate: new FormControl(data.startDate, Validators.required),
      endDate: new FormControl(data.endDate, Validators.required),
      provenance: new FormControl(data.provenance, Validators.required),
      supervisor: new FormGroup({
        name: new FormControl(data.supervisor.name, Validators.required),
        contact: new FormControl(data.supervisor.contact, Validators.required),
      }),

      theme: new FormControl(data.theme, Validators.required),
      profession: new FormControl(data.profession, Validators.required),
      // duration not included in here
    });
  }

  // Convert image in 64 in order for db.json to get and stored the profile value
  selectedImage: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.selectedImage = reader.result;
          this.stagiaireForm.patchValue({ profile: this.selectedImage });
        } else {
          console.log('Unexpected non-string image result');
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Could not read the image, please try again.',
            customClass: {
              popup: 'swal-error-red',
              confirmButton: '',
            },
          });
        }
      };

      console.log('file', this.stagiaireForm);
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      if (file.size > 1024 * 1024) {
        alert('Image must be less than 1MB');
        return;
      }

      reader.readAsDataURL(file);
    }
  }

  // Request confirmation from user before proceeding to changes
  onSubmit() {
    const confirmation = confirm('Do you wanna proceed with the changes?');

    // If cancelled, gets out of the function
    if (!confirmation) return;

    // Get Values entered in the form
    const updatedStagiaire = this.stagiaireForm.value;

    // Call a service method to update the database
    this.stagiaireService
      .updateStagiaire(this.stagiaireId, updatedStagiaire)
      .subscribe({
        // If updated
        next: () => {
          //Display an alert
          alert('Data updated');
          //Redirect to the homepage / intern List
          this.router.navigate(['/']);
        },
        // If error occurred during update
        error: (errors) => {
          // Display alert through a message
          alert(
            'Error occurred during update:' + (errors?.message || 'Unknown')
          );
        },
      });
  }
}
