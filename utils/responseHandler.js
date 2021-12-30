const { errorData } = require("./errorData");
const { logger } = require("../log/logger");

module.exports = {
  handleResponse: (statusCode, data, res) => {
    res.status(statusCode).json({
      status: "Success",
      data,
    });
  },
  handleError: (statusCode, res) => {
    const error = errorData.find(
      (statusobj) => statusobj.status === statusCode
    );
    logger.error(`${error.statusCode} - ${err.message}`);
    return res.status(statusCode).json(error);
  },
};
