import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static validTextWithSpaces(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = (control.value || '').trim(); // Trim whiteSpace

    if (!value) return null;

    // ✅ No leading space, allows multiple words, trailing space okay
    // ❌ No multiple spaces in between words

    const regex = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/;
    return regex.test(value) ? null : { invalidTextFormat: true };
  }

  static noOnlySpaces(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    return value.trim().length === 0 ? { onlySpaces: true } : null;
  }

  // Allows letters, digits and single spaces between words
  static validTextAndDigitsWithSpaces(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = (control.value || '').trim(); // Trim WhiteSpace

    if (!value) return null;
    // ✅ Matches: "MIT 2023", "Université 2", "ESSEC123"
    // ❌ Rejects: "  Université", "MIT   2023", etc.
    const regex = /^[A-Za-zÀ-ÿ0-9]+(?: [A-Za-zÀ-ÿ0-9]+)*$/;
    return regex.test(value) ? null : { invalidTextAndDigitsFormat: true };
  }
}
