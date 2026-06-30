import _payments from '@cyberlisans/payments';

const payments = _payments as any;

export const getMailService = payments.getMailService;
export const mailTemplates = payments.mailTemplates;