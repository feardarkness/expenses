import configs from "../../configs/index";
import { CommonServicesConfig } from "../../common/common.services.config";
import { MailWithTextInterface } from "../../common/interfaces/email-message";
import Mail from "../../common/mail";
import debug from "debug";

const debugInstance: debug.IDebugger = debug("app:mail-service");

class MailService extends CommonServicesConfig {
  private static instance: MailService;
  private apiKey: string = configs.mail.apiKey;

  static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  sendEmail(email: MailWithTextInterface, waitForEmailSent = true) {
    debugInstance("[sendEmail]", { email, waitForEmailSent });
    if (waitForEmailSent) {
      return Mail.sendEmailWithTextBody(email, this.apiKey);
    } else {
      Mail.sendEmailWithTextBody(email, this.apiKey);
      return;
    }
  }
}

export default MailService.getInstance();
