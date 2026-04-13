import { HttpInterceptorFn } from '@angular/common/http';

// Lee la cookie erp_token y la agrega como Bearer token
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getCookie('erp_token');
  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}
