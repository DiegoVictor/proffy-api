import nodemailer, { Transporter } from 'nodemailer';

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

export class MailProvider {
  private client: Transporter;

  constructor() {
    const transporter = nodemailer.createTransport(
      `smtp://${process.env.MAIL_USER}:${process.env.MAIL_PASSWORD}@${process.env.MAIL_HOST}:${process.env.MAIL_PORT}/`,
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
