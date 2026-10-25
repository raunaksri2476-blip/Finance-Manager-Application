const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
