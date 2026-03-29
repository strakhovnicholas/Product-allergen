export function validateEmail(email: string): string | null {
  const value = email.trim();

  if (!value) return 'Введите email';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Некорректный email';

  return null;
}

export function validatePassword(password: string): string | null {
  const value = password.trim();

  if (!value) return 'Введите пароль';
  if (value.length < 6) return 'Пароль должен быть не короче 6 символов';

  return null;
}

export function validateFullName(fullName: string): string | null {
  const value = fullName.trim();

  if (!value) return 'Введите ФИО';
  if (value.length < 3) return 'ФИО слишком короткое';

  return null;
}