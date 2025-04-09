export const register = async (firstName, lastName, email, password) => {
  // This is a placeholder. The actual implementation should
  // call the register API and handle success/failure.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a successful registration
      resolve({
        firstName,
        lastName,
        email,
        // In a real implementation, you wouldn't return the password
      })
    }, 500)
  })
}
