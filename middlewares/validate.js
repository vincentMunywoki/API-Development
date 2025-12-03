/* // middlewares/validate.js
const { validationResult } = require('express-validator');

const validate = (schemas) => async (req, res, next) => {
  // Run each schema validator
  for (let schema of schemas) {
    await schema.run(req);
  }

  // Collect validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

module.exports = validate;
 */