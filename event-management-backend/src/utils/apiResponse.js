class ApiResponse {
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      error: null
    });
  }

  static error(res, message, error = null, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error
        ? {
            code: error.code || null,
            details: error.details || null
          }
        : null,
      data: null
    });
  }

  static paginated(res, data, page, limit, total, message = 'Success') {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      error: null
    });
  }
}

module.exports = ApiResponse;