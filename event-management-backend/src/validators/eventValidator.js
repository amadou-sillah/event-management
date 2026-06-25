const { body } = require('express-validator');

/**
 * CREATE EVENT VALIDATOR (STRICT + SAFE)
 */
exports.createEventValidator = [
  body('title')
    .notEmpty().withMessage('Title required')
    .trim(),

  body('description')
    .notEmpty().withMessage('Description required')
    .trim(),

  body('startDate')
    .isISO8601().withMessage('Valid start date required'),

  body('endDate')
    .isISO8601().withMessage('Valid end date required')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('venue')
    .notEmpty().withMessage('Venue required')
    .trim(),

  body('city')
    .notEmpty().withMessage('City required')
    .trim(),

  body('capacity')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),

  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Ticket price must be >= 0')
];

/**
 * UPDATE EVENT VALIDATOR (SAFE PARTIAL UPDATES)
 */
exports.updateEventValidator = [
  body('title').optional().notEmpty().trim(),
  body('description').optional().notEmpty().trim(),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Valid start date required'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('Valid end date required'),

  body('venue').optional().notEmpty().trim(),
  body('city').optional().notEmpty().trim(),

  body('capacity')
    .optional()
    .isInt({ min: 1 }),

  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 })
];