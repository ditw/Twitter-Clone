export class Validation {
   /**
    * 
    * @param email: string 
    * @returns boolean
    */
    static isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    /**
     * 
     * @param username: string
     * @returns boolean
     */
    static isValidUsername(username: string): boolean {
      const usernameRegex = /^[a-zA-Z0-9_]+$/; // No special characters or empty strings (excepts for underscore)
      return username.length > 0 && usernameRegex.test(username);
    }
  
    /**
     * 
     * @param password: string
     * @returns boolean
     */
    static isValidPassword(password: string): boolean {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\s\S])[^\s]{6,}$/;
      return passwordRegex.test(password);
    }

    /**
     * 
     * @param input: any
     * @param type: any
     * @returns boolean
     */
    static isValidInput(input: any, type: any): boolean {
      if (!input || (!input.length && typeof input === 'string') || typeof input !== type) {
        return false;
      }
      return true;
    }

    /**
     * 
     * @param content: string
     * @returns boolean
     */
    static isValidTweetContent(content: string): boolean {
      if (content.length > 280) {
        return false;
      }
      return true;
    }

    /**
     * 
     * @param input: any
     * @returns boolean
     */
    static isArrayInput(input: any): boolean {
      return Array.isArray(input)? true : false;
    }

    /**
     * 
     * @param array: Array
     * @param type: any
     * @returns boolean
     */
    static isValidArrayInputType(array: Array<any>, type: any): boolean {
      if (!array.every((input) => typeof input === type)) {
        return false;
      }
      return true;
    }

    /**
     * 
     * @param body: any
     * @param requiredFields: string[]
     * @returns 
     */
    static validateRequestBody(body: any, requiredFields: string[]) {
      if (!body || typeof body !== 'object') {
        return 'Missing/Invalid request body!';
      }
    
      for (const field of requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(body, field)) {
          return `Missing required field [${field}] from the request body!`;
        }
      }
    
      return null;
    }
  }
  