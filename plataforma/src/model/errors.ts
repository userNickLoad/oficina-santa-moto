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

export {UniqueError, FormFill}