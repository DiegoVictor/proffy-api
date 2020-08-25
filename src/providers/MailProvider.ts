import nodemailer, { Transporter } from 'nodemailer';

import mail from '../config/mail';

interface Recipient {
  name: string;
  email: string;
}

interface MailProps {
  to: Recipient;
  from?: Recipient;
  subject: string;
  html: string;
}

class MailProvider {
  private client: Transporter;

  constructor() {
    const transporter = nodemailer.createTransport(
      `smtp://${mail.auth.user}:${mail.auth.pass}@${mail.host}:${mail.port}/`,
    );
    this.client = transporter;
  }

  public async sendMail({ to, subject, html }: MailProps): Promise<void> {
    await this.client.sendMail({
      from: {
        name: 'Equipe Proffy',
        address: 'noreply@proffy.com.br',
      },
      to: { name: to.name, address: to.email },
      subject,
      html,
    });
  }
}

export default MailProvider;
