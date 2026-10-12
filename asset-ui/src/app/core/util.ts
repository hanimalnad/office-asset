import { HttpErrorResponse } from '@angular/common/http';

/** Turns the backend ErrorResponse (status/message/errors) into one readable string. */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Cannot reach the server. Is the backend running on port 8080?';
    }
    const body = err.error;
    if (body?.errors && typeof body.errors === 'object') {
      return Object.values(body.errors).join(' · ');
    }
    if (body?.message) {
      return body.message;
    }
    return `Request failed (${err.status})`;
  }
  return 'Unexpected error';
}
