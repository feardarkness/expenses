import sgMail from "@sendgrid/mail";
import { MailWithTextInterface } from "./interfaces/email-message";

export default class Mail {
  /* istanbul ignore next */
  static async sendEmailWithTextBody(data: MailWithTextInterface, apiKey: string) {
    sgMail.setApiKey(apiKey);
    return sgMail.send(data as sgMail.MailDataRequired);
  }
}
