class ApiError extends Error {
    constructor(
        
        statusCode,
        message="Error Occured",
        errors=[],//Error could be multiple
        stack="" //Location of errors
    ){
        super(message)//Invoke super class constructor
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors;

        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}