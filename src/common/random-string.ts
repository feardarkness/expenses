import * as randomString from "randomstring";
import { nanoid } from "nanoid";

export default class RandomString {
  static generateRandomString(length: number) {
    return randomString.generate({
      length,
      readable: true,
    });
  }

  static async generateSecureRandomString() {
    return nanoid();
  }
}
