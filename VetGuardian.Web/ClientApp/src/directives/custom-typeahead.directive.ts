import {Directive, Input, OnInit, OnChanges, SimpleChange, SimpleChanges} from '@angular/core';
import {TypeaheadDirective} from 'ngx-bootstrap';
import {getValueFromObject, latinize} from 'ngx-bootstrap/typeahead';

// Reference: https://github.com/valor-software/ngx-bootstrap/issues/2563
@Directive({
  selector: '[customTypeahead]'
})
export class CustomTypeaheadDirective extends TypeaheadDirective implements OnInit, OnChanges {
  @Input() customTypeahead;
  @Input() typeaheadSearchFields = [];
  @Input() typeaheadScrollable = true;
  @Input() typeaheadMinLength = 0;
  @Input() typeaheadOptionsInScrollableView = 11;
  @Input() typeaheadWaitMs = 150;

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customTypeahead) {
      const dataSource: SimpleChange = changes.customTypeahead;
      this.typeahead = dataSource.currentValue || [];
    }
  }

  // Allows searching by any property of the item
  normalizeOption(option: any): any {
    let normalized: string = '';
    if (!this.typeaheadSearchFields) {
      this.typeaheadSearchFields = Object.keys(option);
    }

    this.typeaheadSearchFields.forEach((searchField) => {
      const optionValue: string = getValueFromObject(
        option,
        searchField
      );
      normalized += `${this.typeaheadLatinize ? latinize(optionValue) : optionValue} `;
    });
    return normalized.trim().toLowerCase();
  }

}