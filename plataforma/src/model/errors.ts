class UniqueError extends Error {
    constructor(message: string){
        super(message)
        this.name = "UniqueError"
    }
}

class FormFill extends Error {
    constructor(message: string){
        super(message)
        this.name = "FormFill"
    }
}

class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export {UniqueError, FormFill, AppError}