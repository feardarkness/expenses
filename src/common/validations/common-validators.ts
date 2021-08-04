import validator from "validator";

class CommonValidators {
  private static instance: CommonValidators;

  constructor() {}

  /* istanbul ignore next */
  static getInstance() {
    if (!CommonValidators.instance) {
      CommonValidators.instance = new CommonValidators();
    }
    return CommonValidators.instance;
  }

  isUUID(uuid: string) {
    return validator.isUUID(uuid);
  }
}

export default CommonValidators.getInstance();
