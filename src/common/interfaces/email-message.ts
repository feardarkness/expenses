export interface MailInterface {
  to: string;
  from: string;
  subject: string;
}

export interface MailWithTextInterface extends MailInterface {
  text: string;
}

export interface MailWithHtmlInterface extends MailInterface {
  text: string;
}
