var url = require("url");
import { Service } from './services';

export class Route {

    public service: any;

    constructor() { 
        this.service = new Service;
    }

    public handleRequests(request: any, response: any) {
        const path = url.parse(request.url).pathname;
        const method = request.method;

        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); 
        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); 
        response.setHeader('Access-Control-Allow-Credentials', true); 

        switch (true) {
            case path == "/" && method == 'GET':
                // console.log("API");
                this.service.getResponse(response, 'Hello Api!');
                break;
            case path == "/get-users" && method == 'POST':
                this.service.getUserDetails(request, response);
                break; 
            case path == "/save-user" && method == 'POST':
                this.service.saveUserData(request, response);
                break;
            case path == "/login" && method == 'POST':
                this.service.userLogin(request, response);
                break;
            case path == "/send-password-link" && method == 'POST':
                this.service.sendPasswordLink(request, response);
                break;
            case path == "/reset-password" && method == 'POST':
                this.service.resetPassowrd(request, response);
                break;
            default: 
                this.service.getResponse(response, 'Api not found!');
        }
    }
}