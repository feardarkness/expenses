import * as randomString from "randomstring";

export default class RandomString {
  static generateRandomString(length: number) {
    return randomString.generate({
      length,
      readable: true,
    });
  }
}
