class  APiResponse{
    constructor(statusCode , message ="Success" ,data){
        this.data =data;
        this.message=message;
        this.statusCode =statusCode < 400;
    }
}
export {APiResponse}