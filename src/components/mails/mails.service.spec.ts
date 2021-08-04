import { expect } from "chai";
import mailsService, { MailService } from "./mails.service";

describe("MailsService", () => {
  it("should create only one instance", () => {
    expect(mailsService).to.equals(MailService.getInstance());
  });
});
