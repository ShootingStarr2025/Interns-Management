import { Component, OnInit } from '@angular/core';
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
export class StagiaireFormComponent implements OnInit {
  constructor(
    private stagiaireService: StagiaireService,
    private router: Router
  ) {}

  stagiaireForm!: FormGroup;
  selectedImage: string | ArrayBuffer | null = null; // Line for grabbing the image
  duration: string | null = null;
  emailExists = false;

  ngOnInit(): void {
    this.stagiaireForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      surname: new FormControl(null, Validators.required),
      profile: new FormControl(null, Validators.required),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]),
      number: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(05|01|07)[0-9]{8}$/),
      ]),
      provenance: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      theme: new FormControl(null, Validators.required),
      profession: new FormControl(null, Validators.required),
      supervisor: new FormGroup({
        supervisorname: new FormControl(null, Validators.required),
        contact: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^(05|01|07)[0-9]{8}$/),
        ]),
      }),
    });

    this.stagiaireForm.get('startDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });

    this.stagiaireForm.get('endDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
  }

  calculateDuration() {
    const start = this.stagiaireForm.get('startDate')?.value;
    const end = this.stagiaireForm.get('endDate')?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate >= startDate) {
        const diffTime = endDate.getTime() - startDate.getTime(); // milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

        const months = Math.floor(diffDays / 30); // Rough month
        const days = diffDays % 30;

        if (months > 0) {
          this.duration = `${months} month${months > 1 ? 's' : ''}`;
        } else {
          this.duration = `${days} day${days !== 1 ? 's' : ''}`;
        }
      } else {
        this.duration = null; // end date is before start date
      }
    } else {
      this.duration = null;
    }
  }

  // Convert image in base64
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      //Type validation........................................................................
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

      // Check for appropriate image size
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
          console.log(this.selectedImage);
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
    console.log(this.selectedImage);
  }

  onlyAllowLetters(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, ''); // Allow letters, accents, space

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      this.stagiaireForm
        .get(controlName)
        ?.setValue(input.value, { emitEvent: false });
    }
  }

  restrictsDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('InputElement');
    let digitsOnly = input.value.replace(/\D/g, ''); // Only digits
    console.log(digitsOnly);

    // Allow up to 10 digits
    if (digitsOnly.length > 10) {
      digitsOnly = digitsOnly.slice(0, 10);
    }

    //Allow digits starting with 05 | 01 | 07
    if (digitsOnly.length >= 2 && !/^(05|07|01)/.test(digitsOnly)) {
      // Block invalid prefix
      digitsOnly = digitsOnly.slice(0, 2); // Keep only first two digits
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Start',
        text: 'Number must start with 05, 07, or 01',
        timer: 2000,
        showConfirmButton: false,
      });

      input.value = digitsOnly;
    }

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

  onSubmit() {
    console.log('submitted', this.stagiaireForm);
    if (this.stagiaireForm.invalid) {
      this.stagiaireForm.markAllAsTouched();
      return;
    }

    const email = this.stagiaireForm.get('email')?.value;
    this.stagiaireService.emailExists(email).subscribe((exists) => {
      if (exists) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Email',
          text: 'This email is already used by another trainee.',
          confirmButtonColor: '#d32f2f',
        });
        return;
      } else {
        this.saveForm();
      }
    });
  }

  //If the form is valid carry on with saving process
  saveForm() {
    Swal.fire({
      title: 'Save Trainee?',
      text: 'Do you want to save this information?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#FC6A03',
      cancelButtonColor: '#FF0000',
    }).then((result) => {
      if (result.isConfirmed) {
        // Process with saving
        const formValue = this.stagiaireForm.value;
        // Extract month and day from startDate
        const startDate = new Date(formValue.startDate);
        const month = startDate.toLocaleDateString('default', {
          month: 'long',
        });
        const day = startDate.getDate();

        // Attach them to the formvalue
        formValue.month = month;
        formValue.day = day;

        this.stagiaireService.addStagiaire(formValue).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Saved Successfully',
              text: 'Trainee saved successfully.',
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
            console.log(formValue.value);
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Failed to save',
              text: 'There was a problem saving the trainee. Try again later.',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }
}
