import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
 
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  maxDate;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.maxDate = new Date();
    this.maxDate.getFullYear(this.maxDate.getFullYear() - 18);
  }

  onSubmit(data: NgForm) {
    this.authService.registerUser({
      email: data.value.email,
      password: data.value.password
    });
  }

}
