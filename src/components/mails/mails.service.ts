import configs from "../../configs/index";
import { CommonServicesConfig } from "../../common/common.services.config";
import { MailWithTextInterface } from "../../common/interfaces/email-message";
import debug from "debug";
import Mail from "../../common/mail";

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

  sendEmail(email: MailWithTextInterface) {
    debugInstance("[sendEmail]", { email });
    return Mail.sendEmailWithTextBody(email, this.apiKey);
  }
}

export default MailService.getInstance();
