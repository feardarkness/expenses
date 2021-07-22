import * as randomString from "randomstring";
import { nanoid } from "nanoid";

export default class RandomString {
  static generateRandomString(length: number) {
    return randomString.generate({
      length,
      readable: true,
    });
  }

  /**
   * Generates a random string (length 21 by default)
   */
  static async generateSecureRandomString() {
    return nanoid();
  }
}
