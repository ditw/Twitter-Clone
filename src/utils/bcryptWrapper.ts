import { hashPassword } from "./bcrypt";

/**
 * For safe-type and check compatibility
 */
export const bcryptWrapper = {
  hashPassword,
};
