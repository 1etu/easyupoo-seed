class ValidationError extends Error {
  constructor(errors) {
    super('Validation Error');
    this.name = 'ValidationError';
    this.errors = errors;
  }

  toString() {
    return `ValidationError: ${JSON.stringify(this.errors, null, 2)}`;
  }
}

module.exports = ValidationError; 