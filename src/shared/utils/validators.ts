export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Mínimo 8 caracteres, al menos una letra y un número
  return password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password);
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateCedula = (cedula: string): boolean => {
  // Validación básica de cédula ecuatoriana (10 dígitos)
  if (!/^\d{10}$/.test(cedula)) return false;
  
  const digits = cedula.split('').map(Number);
  const province = parseInt(cedula.substring(0, 2));
  
  if (province < 1 || province > 24) return false;
  
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    let product = digits[i] * coefficients[i];
    if (product >= 10) product -= 9;
    sum += product;
  }
  
  const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return verifier === digits[9];
};
