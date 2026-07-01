export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  '123456789012',
  'qwertyuiop12',
  'password1234',
  'Password1234',
  'admin1234567',
  'letmein12345',
  'welcome12345',
  'iloveyou1234',
  'sunshine1234',
  'princess1234',
  'azerty123456',
  'football1234',
  'monkey123456',
  'shadow123456',
  'master123456',
  'dragon123456',
  'michael12345',
  'jennifer1234',
  'qwerty123456',
  'abc123456789',
  'password1123',
  'computer1234',
  'starwars1234',
  'trustno11234',
  'baseball1234',
  'superman1234',
  'michael12345',
  'football1234',
  'ashley123456',
  'qwerty123456',
  'iloveyou1234',
  'charlie12345',
  'jordan123456',
  'ranger123456',
  'buster123456',
  'soccer123456',
  'hockey123456',
  'george123456',
  'andrew123456',
  'charlie12345',
  'tigger123456',
  'taylor123456',
  'matrix123456',
  'william12345',
  'corvette1234',
  'robert123456',
  'thomas123456',
  'jordan123456',
  'dallas123456',
  'golfer123456',
  'phoenix123456',
  'austin123456',
  'hunter123456',
  'yankees12345',
  'merlin123456',
  'falcon123456',
  'andrea123456',
  'madison12345',
  'maggie123456',
  'cookie123456',
  'summer123456',
  'peanut123456',
  'flower123456',
  'mickey123456',
  'chevy12345678',
  'jackson12345',
  'muffin123456',
  'scooter12345',
  'secret123456',
  'dick123456789',
  'birdie123456',
  'kitty1234567',
  'pass123456789',
  'pussy12345678',
  'apples123456',
  'bigdog1234567',
  'abcdef123456',
  'abcdefg12345',
  'murphy123456',
  'sparky123456',
  'freedom12345',
  'ginger123456',
  'taylor123456',
  'silver123456',
  'dakota123456',
  'golfer123456',
  'albert123456',
  'winner123456',
  'chicken1234',
  'diamond1234',
  'forever1234',
  'nothing1234',
  'oliver123456',
  'midnight123',
  'creative123',
  'prince12345',
  'marine12345',
  'internet123',
  'stupid12345',
  'jackson1234',
  'samantha123',
  'jasmine1234',
  'computer123',
  'whatever123',
  'harley12345',
  'thunder1234',
  'pokemon1234',
  'steelers123',
  'joseph12345',
  'mercedes123',
  'toyota12345',
  'jordan12345',
]);

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  suggestions: string[];
  isAcceptable: boolean;
}

export function passwordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 1;
  else suggestions.push('Şifre en az 12 karakter olmalı');

  if (password.length >= 16) score += 1;
  else suggestions.push('Daha uzun bir şifre daha güvenlidir (16+ karakter)');

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('En az bir büyük harf ekleyin');

  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('En az bir küçük harf ekleyin');

  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('En az bir rakam ekleyin');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('En az bir özel karakter ekleyin (!@#$%^&*)');

  if (COMMON_PASSWORDS.has(password)) {
    score = 0;
    suggestions.push('Bu şifre çok yaygın, lütfen farklı bir şifre seçin');
  }

  const clampedScore = Math.max(0, Math.min(4, score)) as 0 | 1 | 2 | 3 | 4;
  return {
    score: clampedScore,
    suggestions,
    isAcceptable: clampedScore >= 4 && !COMMON_PASSWORDS.has(password),
  };
}

export const STRONG_PASSWORD_MIN_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;
