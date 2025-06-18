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
        this.selectedImage = data.profile;
        console.log('stagiaire: ', data);
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  // Check if field is invalid
  isInvalidField(field: string): boolean {
    const control = this.stagiaireForm.get(field);
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }

  // Display error messages for each field
  getErrorMessage(field: string): string {
    let control = this.stagiaireForm.get(field);

    if (control?.hasError('pattern')) {
      if (field === 'email') {
        return 'Please enter a valid email address';
      }
    }

    if (field === 'supervisor.contact') {
      control = this.stagiaireForm.get(['supervisor', 'contact']);
    }

    if (control?.errors?.['required']) return 'This field is required';
    if (control?.errors?.['email']) return 'Please enter a valid email';
    if (control?.errors?.['pattern']) {
      if (field === 'number') return 'Phone must be 10 digits';
      if (field === 'supervisor.contact')
        return 'suprvisor phone must be 10 digits';
    }
    return '';
  }

  initialDataForm(data: any) {
    console.log(data);
    this.stagiaireForm = new FormGroup({
      name: new FormControl(data.name, Validators.required),
      surname: new FormControl(data.surname, Validators.required),
      profile: new FormControl(data.profile, Validators.required),
      email: new FormControl(data.email, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]),
      number: new FormControl(data.number, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
      ]),
      startDate: new FormControl(data.startDate, Validators.required),
      endDate: new FormControl(data.endDate, Validators.required),
      provenance: new FormControl(data.provenance, Validators.required),
      supervisor: new FormGroup({
        supervisorname: new FormControl(
          data.supervisor.supervisorname,
          Validators.required
        ),
        contact: new FormControl(data.supervisor.contact, Validators.required),
      }),

      theme: new FormControl(data.theme, Validators.required),
      profession: new FormControl(data.profession, Validators.required),
      // duration not included in here
    });
  }

  // Number policy rules
  restrictDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digitsOnly = input.value.replace(/\D/g, ''); // Only digits

    // Allow up to 10 digits
    if (digitsOnly.length > 0) {
      digitsOnly = digitsOnly.slice(0, 10);
    }

    // Only allow digits starting with 05 07 01
    if (digitsOnly.length >= 2 && !/^(05|07|01)/.test(digitsOnly)) {
      // Block invalid prefix
      digitsOnly = digitsOnly.slice(0, 2); // keep only first two digits
      Swal.fire({
        icon: 'warning',
        title: 'Number Invalid',
        text: 'Number must start with 05, 07, or 01',
        timer: 2000,
        showConfirmButton: false,
      });
    }

    input.value = digitsOnly;

    const controlName = input.getAttribute('formControlName');
    if (controlName === 'number') {
      this.stagiaireForm.get('number')?.setValue(digitsOnly),
        { emitEvent: false };
    } else if (controlName === 'contact') {
      this.stagiaireForm.get(['supervisor', 'contact'])?.setValue(digitsOnly),
        { emitEvent: false };
    }
  }

  // Convert image in 64 in order for db.json to get and stored the profile value
  selectedImage: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // First: check type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid File Type',
          text: 'Only image files are allowed',
          timer: 2500,
          showConfirmButton: false,
        });
        return;
      }

      // Second: check size before FileReader is called
      if (file.size > 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'Image must be less than 1MB',
          timer: 2500,
          showConfirmButton: false,
        });
        return;
      }

      // Only now: read the file
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

      reader.readAsDataURL(file);
    }
  }

  // Request confirmation from user before proceeding to changes
  onSubmit() {
    if (this.stagiaireForm.invalid) {
      this.stagiaireForm.markAllAsTouched();
      return; // Stop here if form is invalid
    }

    Swal.fire({
      title: 'Warning',
      text: 'Do you wanna apply the changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#FC6A03',
    }).then((result) => {
      if (result.isConfirmed) {
        // get values of form
        const updatedStagiaire = this.stagiaireForm.value;

        // Call the service method to update the database
        this.stagiaireService
          .updateStagiaire(this.stagiaireId, updatedStagiaire)
          .subscribe({
            // If updated
            next: () => {
              // Swal.fire({
              //   icon: 'success',
              //   title: 'updated',
              //   text: 'Stagiaire updated successfully!',
              //   timer: 2000,
              //   showConfirmButton: false,
              // });

              Swal.fire({
                icon: 'success',
                title: 'updated',
                text: 'Stagiaire updated successfully!',
                confirmButtonColor: '#ff9800',
              });
              const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.onmouseenter = Swal.stopTimer;
                  toast.onmouseleave = Swal.resumeTimer;
                },
              });
              Toast.fire({
                icon: 'success',
                title: 'Saved successfully',
              }).then(() => {
                this.stagiaireForm.reset();
                this.router.navigate(['/']);
              });
            },
            error: (errors) => {
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: `Error occurred: ${errors?.message || 'Unknown error'}`,
              });
            },
          });
      }
    });
  }
}
