export interface PasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface MailServicePort {
  sendVerification(email: string, link: string): Promise<void>;
  sendPasswordReset(email: string, link: string): Promise<void>;
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface ClockPort {
  now(): Date;
}
