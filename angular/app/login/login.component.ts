import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  cheakName: string
  cheakPassword: string

  constructor(private http: HttpClient){}

  cheak(){
    if (this.cheakName && this.cheakPassword)
      this.http.post('https://immense-fortress-17915.herokuapp.com/login', {name: this.cheakName, password: this.cheakPassword}).subscribe((response: any) => {
        if (response.status) alert('you logined')
        else alert('wrong login or password')
      })
    else alert('wrong input')
  }

  ngOnInit(): void {
  }

}
