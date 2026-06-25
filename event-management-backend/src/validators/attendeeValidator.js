const { body } = require('express-validator');

exports.registerAttendeeValidator = [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('ticketType').optional().isString()
];