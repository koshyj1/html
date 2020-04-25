import { FormGroup, AbstractControl } from '@angular/forms';
import { ApiError } from './api-error';

export class FormGroupCustom extends FormGroup {
    public submitted: boolean = false;

    addErrors(errors?: ApiError) {
        if (errors) {
            Object.keys(errors).forEach(key => {
                let control = key == '' ? this : this.get(key);
                if (control) {
                    control.setErrors({
                        messages: errors[key]
                    });
                }
            });
        }
    }

    getFormControl(formControlName?: string): AbstractControl {
        return formControlName ? this.get(formControlName) : this;
    }

    showErrors(formControlName?: string): boolean {
        let control = this.getFormControl(formControlName);
        if (control) {
            return control.invalid && (this.submitted || control.dirty || control.touched);
        }
        return false;
    }
}