class Apiresponse{
    constructor(statusCode , data ,message = "success"
    ){
        this.statusCode = this.statusCode,
        thisdata = data,
        this.message =message,
        this.success = statusCode <400
    }
}

export {Apiresponse}