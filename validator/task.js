exports.taskValidator = (req, res, next) => {
  const { title, description } = req.body;

  if (title.trim().length < 5 || title.trim().length > 50)
    return res.status(400).json({
      errorIn: "title",
      error: "Task must be between 5-50 characters",
    });
  else if (description.trim().length < 20 || description.trim().length > 1000)
    return res.status(400).json({
      errorIn: "description",
      error: "Description must be between 20-1000 characters",
    });
  else next();
};
