export class ValidationError extends Error {
  readonly code = 'VALIDATION_ERROR';
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
