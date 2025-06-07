import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { StagiaireService } from '../../services/stagiaire.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stagiaire-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './stagiaire-form.component.html',
  styleUrl: './stagiaire-form.component.css',
})
export class StagiaireFormComponent {
  constructor(
    private stagiaireService: StagiaireService,
    private router: Router
  ) {}

  stagiaireForm = new FormGroup({
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    profile: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    number: new FormControl('', Validators.pattern(/^(05|01|07)[0-9]{8}$/)),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    provenance: new FormControl('', Validators.required),
    supervisor: new FormGroup({
      name: new FormControl('', Validators.required),
      contact: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(05|07|01)[0-9]{8}$/),
      ]),
    }),

    theme: new FormControl('', Validators.required),
    profession: new FormControl('', Validators.required),
    // duration not included in here
  });

  // Check if field is invalid
  isFieldInvalid(field: string): boolean {
    const control = this.stagiaireForm.get(field);
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }

  // Returns the appropriate error message per field
  getErrorMessage(field: string): string {
    let control = this.stagiaireForm.get(field);

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

  emailExists = false;
  formIsCompletelyEmpty = false;

  onSubmit() {
    if (this.stagiaireForm.invalid) {
      // Display an error if submitting the form is incomplete
      const formValue = this.stagiaireForm.value;

      const allFieldsEmpty = Object.values(formValue).every((value) => {
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).every((v) => v === '' || v === null);
        }
        return value === '' || value === null;
      });

      this.formIsCompletelyEmpty = allFieldsEmpty;
      this.stagiaireForm.markAllAsTouched();

      // Auto-hide the message after 1 minute
      if (this.formIsCompletelyEmpty) {
        setTimeout(() => {
          this.formIsCompletelyEmpty = false;
        }, 3000);
      }
      return;
    }

    this.formIsCompletelyEmpty = false;
    const formValue = this.stagiaireForm.value;

    // Check if email already exists
    this.stagiaireService.emailExists(formValue.email!).subscribe({
      next: (exists) => {
        if (exists) {
          console.log('This email has already been used');
          this.emailExists = true;

          // Using customizable pop ups to show message of existing email
          Swal.fire({
            icon: 'warning',
            title: 'Email Already Exists',
            text: 'The email address is already in use. Please use a different one.',
            confirmButtonColor: '#b71c1c',
          });
        } else {
          this.emailExists = false;
          this.stagiaireService.addStagiaire(formValue).subscribe({
            next: () => {
              // Using customizable sweetalert2 popups to display message of success
              Swal.fire({
                icon: 'success',
                title: 'Saved Successfully',
                text: 'Trainee has been successfully registered.',
                confirmButtonColor: '#ff9800',
              });
              this.stagiaireForm.reset();
              this.selectedImage = null;
              this.router.navigate(['/']);
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: 'Submission Error',
                text: 'An error occurred during trainee registration.',
                confirmButtonColor: '#d32f2f',
              });
            },
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Email Check Failed',
          text: 'Unable to verify email. Please try again later.',
          confirmButtonColor: '#d32f2f',
        });
      },
    });
  }

  // Number policy rules
  restrictDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(input);
    let digitsOnly = input.value.replace(/\D/g, ''); // Only digits
    console.log(digitsOnly);

    // Allow up to 10 digits
    if (digitsOnly.length > 10) {
      digitsOnly = digitsOnly.slice(0, 10);
    }

    //  Only allow starting with 05, 07, or 01
    if (digitsOnly.length >= 2 && !/^(05|07|01)/.test(digitsOnly)) {
      // Block invalid prefix
      digitsOnly = digitsOnly.slice(0, 2); // keep only first two digits
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Start',
        text: 'Number must start with 05, 07, or 01',
        timer: 2000,
        showConfirmButton: false,
      });
    }

    input.value = digitsOnly;

    const controlName = input.getAttribute('formControlName');
    if (controlName === 'number') {
      this.stagiaireForm
        .get('number')
        ?.setValue(digitsOnly, { emitEvent: false });
    } else if (controlName === 'contact') {
      this.stagiaireForm
        .get(['supervisor', 'contact'])
        ?.setValue(digitsOnly, { emitEvent: false });
    }
  }

  // Convert image in 64....................................................
  selectedImage: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Type validation-----------------------------------------------------
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only JPG and PNG image formats are allowed.',
          confirmButtonColor: '#d32f2f',
          customClass: {
            popup: 'small-popup',
          },
        });
        return;
      }

      // Size validation
      if (file.size > 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'Image must be less than 1MB.',
          confirmButtonColor: '#d32f2f',
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.selectedImage = reader.result;
          this.stagiaireForm.patchValue({ profile: this.selectedImage });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not read the image, please try again',
          });
        }
      };

      reader.readAsDataURL(file);
    }
  }
  dismissFormError(): void {
    this.formIsCompletelyEmpty = false;
  }
}
