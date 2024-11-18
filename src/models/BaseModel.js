const ValidationError = require('./ValidationError');

class BaseModel {
  constructor(data) {
    this.data = {};
    if (data) {
      this.validate(data);
      this.data = data;
    }
  }

  validate(data) {
    const errors = {};
    const schema = this.constructor.schema;

    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !data[field]) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (data[field] !== undefined) {
        if (rules.type && typeof data[field] !== rules.type) {
          errors[field] = `${field} must be of type ${rules.type}`;
        }

        if (rules.validate) {
          const validationResult = rules.validate(data[field]);
          if (validationResult !== true) {
            errors[field] = validationResult;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return true;
  }

  toJSON() {
    return this.data;
  }
}

module.exports = BaseModel; 