import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Version } from "../models/version";
import { Observable } from "rxjs";

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(private httpClient: HttpClient) {
  }

  getVersion(): Observable<Version> {
    return this.httpClient.get<Version>(environment.baseUrl + '/api/version');
  }

}
