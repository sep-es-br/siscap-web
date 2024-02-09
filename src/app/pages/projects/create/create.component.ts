import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent implements OnInit {
  public projectForm!: FormGroup;

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {}

  initForm() {
    this.projectForm = this._fb.group({});
  }
}
