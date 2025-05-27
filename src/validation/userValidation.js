import joi from "joi";

export const signup = (req, res, next) => {
  const schema = joi.object({
    username: joi.string().required().min(3).max(30),
    email: joi.string().email().required().lowercase(),
    password: joi.string().required().min(5),
    role: joi.string().valid("librarian", "customer").optional(),
  });

  schema
    .validateAsync(req.body)
    .then(() => {
      return next();
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: err.message });
    });
};

export const verifyOTP = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required().lowercase(),
    otp: joi.number().required(),
  });

  schema
    .validateAsync(req.body)
    .then(() => {
      return next();
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: err.message });
    });
};

export const resendOTP = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required().lowercase(),
  });

  schema
    .validateAsync(req.body)
    .then(() => {
      return next();
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: err.message });
    });
}

export const login = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required().lowercase(),
    password: joi.string().required(),
  });

  schema
    .validateAsync(req.body)
    .then(() => {
      return next();
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: err.message });
    });
};

export const forgotPassword = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().required().lowercase(),
  });

  schema
    .validateAsync(req.body)
    .then(() => {
      return next();
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: err.message });
    });
}

export const updateUserData = (req, res, next) => {
  const schema = joi.object({
    username: joi.string().required().min(3).max(30).optional(),
    oldPassword: joi.string().required().min(5).optional(),
    newPassword: joi.string().required().min(5).optional(),
  });

  schema
    .validateAsync(req.body)
    .then(() => {
      return next();
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: err.message });
    });
}
