import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }
  
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // logged in so return true
    var isAuthenticated = next.params.isAuthenticated;
    if (isAuthenticated) {
        return true;
    }

    // not logged in so redirect to home page.
    this.router.navigate(['/home'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
