import bcrypt from "bcrypt";

/**
 * Hash password function for authetication
 * 
 * @param password: string
 * @returns 
 */
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Password check function for authetication
 * 
 * @param password: string
 * @param hash: string
 * @returns 
 */
export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};