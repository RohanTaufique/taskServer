exports.userSignupValidator = (req, res, next) => {
  //First Name Validation
  req.check("fname", "First name required!").notEmpty();
  req
    .check("fname", "First name must be in between 3 to 20 characters")
    .matches(/^[A-Z][a-zA-Z]*$/)
    .withMessage(
      "First Letter must be capital / no special characters allowed!"
    )
    .isLength({ min: 3, max: 20 });

  //Last Name Validation
  req.check("lname", "Last name required!").notEmpty();
  req
    .check("lname", "Last name must be in between 3 to 20 characters")
    .matches(/^[A-Z][a-zA-Z]*$/)
    .withMessage(
      "First Letter must be capital / no special characters allowed!"
    )
    .isLength({ min: 3, max: 20 });

  //Email is not null, valid and normalized
  req.check("email", "Email required!").notEmpty();
  req
    .check("email", "Email must be between 3 to 32 characters")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    .withMessage("Invalid Email Address")
    .isLength({
      min: 4,
      max: 32,
    });

  //check for password
  //Minimum eight characters, at least one letter and one number
  //No special characters are allowed
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .withMessage(
      "Password must contain minimum eight characters, at least one letter and one number.(no special characters are allowed)"
    );

  //check for errors
  const errors = req.validationErrors();
  //if erro show the first one as they happen
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  //   proceed to next middleware
  next();
};
