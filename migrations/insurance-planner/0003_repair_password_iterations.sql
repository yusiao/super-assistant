UPDATE users
SET password_iterations = 20000
WHERE password_iterations > 100000;
