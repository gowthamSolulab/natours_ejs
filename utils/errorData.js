module.exports = {
  errorStatus: [
    {
      status: "401",
      message: "productId  is wrong.",
    },
    {
      status: "402",
      message: "Mandatory Parameter Empty.",
    },
    {
      status: "403",
      message: "Mandatory Parameter Missing.",
    },
    {
      status: "404",
      message: "product already registered.",
    },
    {
      status: "412",
      message: "Error in password generator.",
      data: "Error in password generator.",
    },
    {
      status: "503",
      message: "Database error",
      data: "Database operation error.",
    },
    {
      status: "505",
      message: "Error in file deleteing",
      data: "File deleteing error.",
    },
    {
      status: "500",
      message: "server error please try again",
    },
  ],
};
