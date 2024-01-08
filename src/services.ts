import { MysqlDB } from './db_mysql';
import { Helper } from './helper';
const geoip = require('geoip-lite');
const md5 = require('md5');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    //   host: "mail.capsquery.com",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    //     user: 'protap@capsquery.com',
    //     pass: 'Mondal1920'
    //   },  
    //   tls: {
    //     // do not fail on invalid certs
    //     rejectUnauthorized: false,
    //   },
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "6f2293fb337968",
        pass: "dad441175b53d7"
    }
});


export class Service extends Helper {

    public db = new MysqlDB;
    public res = {};

    public async getUserDetails(request: any, response: any) {
        // let requestData = await this.getRequest(request);
        const query = "SELECT * FROM users";
        let data = await this.db.getRows(query);
        // console.log(data); return false;
        return this.getResponse(response, data);
    }

    public async saveUserData(request: any, response: any) {
        let requestData = await this.getRequest(request);
        let data = JSON.parse(JSON.stringify(requestData));
        var ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || null;
        ip = '157.40.64.67';
        var geoData = geoip.lookup(ip);

        // let userId = uuidv4();
        // var nameString = data.name.split(" ");      
        // var userName = nameString[0].toLowerCase() + (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        let passwordToken = await md5(data.password);
        let select = 'first_name, last_name, email, password, phone';
        var validaiton = this.checkEmpty(data, ['first_name', 'last_name', 'email', 'password', 'phone']);

        /** check if user is already exists **/
        let checkDuplicate = await this.db.getRows("SELECT * FROM users where email = '" + data.email + "'");
        // console.log(checkDuplicate); return false;
        if (!this.isEmptyObject(validaiton)) {
            this.res = { status: false, message: 'Some fields are required.', data: validaiton };
        } else if (data.password != data.confirm_password) {
            this.res = { status: false, message: 'Password does not match.' };
        } else if (!this.isEmptyObject(checkDuplicate)) {
            this.res = { status: false, message: 'User is already exist in our database.' };
        } else {
            let query = "INSERT INTO users (" + select + ") " +
                " VALUES ('" + data.first_name + "', '" + data.last_name + "', '" + data.email + "'," +
                " '" + passwordToken + "', '" + data.phone + "')";

            var result = await this.db.insertData(query);

            if (result) {
                this.res = { status: true, message: 'Successfully registered.' };
            } else {
                this.res = { status: false, message: 'Please try again, someting going wrong' };
            }
        }
        return this.getResponse(response, this.res);
    }

    /* User Login  
    * @param array email, password
    * Returns true or false 
    */
    public async userLogin(request: any, response: any) {
        let requestData = await this.getRequest(request);
        let data = JSON.parse(JSON.stringify(requestData));
        // console.log(data.email); return false;
        let select = '*';
        const query = "SELECT " + select + " FROM users where email = '" + data.email + "' AND password = '" + md5(data.password) + "'";
        let rowData = await this.db.getRows(query);

        if (this.isEmptyObject(rowData)) {
            this.res = { status: false, message: 'Invalid email and password' };
        } else {
            var token = jwt.sign({ data: data.email }, 'secret', { expiresIn: '1h' });

            // jwt.verify(token, 'secret', function(err:any, decoded:any) {
            //     console.log(decoded); return false;
            //   });
            // console.log(token); 
            // return false;
            //     // const isTokenExpired = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp;
            //     // var dateString = this.unixTime(isTokenExpired);
            //     /*TODO :: update token and expiry time after successfull login. */
            this.res = { status: true, message: 'Success', data: rowData, token: token };
            // this.res = { status: true, message: 'Success' };
        }

        return this.getResponse(response, this.res);
    }

    public async sendPasswordLink(request: any, response: any) {
        let requestData = await this.getRequest(request);
        let data = JSON.parse(JSON.stringify(requestData));

        /** check if user is already exists **/
        let checkDuplicate = await this.db.getRows("SELECT * FROM users where email = '" + data.email + "'");
        if (this.isEmptyObject(checkDuplicate)) {
            this.res = { status: false, message: 'A user with this email does not exist' };
        } else {
            var token = jwt.sign({ data: data.email }, 'secret', { expiresIn: '1h' });

            // verify connection configuration
            const verify = transporter.verify(function (error: any, success: any) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            //    const info = await 
            transporter.sendMail({
                from: 'protap@capsquery.com', // sender address
                to: "protap.capsquery@gmail.com, protap@capsquery.com", // list of receivers
                subject: "Test email using Node Js", // Subject line
                text: "Hello world?", // plain text body
                html: "http://localhost:4200/change-password?token=" + token, // html body
            }).then((resp: any) => {
                console.log('Message sent: %s', JSON.stringify(resp));
            }).catch((err: any) => {
                console.log(err);
            });

            let query = "INSERT INTO password_resets (email, token) " +
                " VALUES ('" + data.email + "', '" + token + "')";
            var result = await this.db.insertData(query);
            if (result) {
                this.res = { status: true, message: 'Password reset link has been sent to your mail.' };
            } else {
                this.res = { status: false, message: 'Please try again, someting going wrong' };
            }
        }
        return this.getResponse(response, this.res);
    }

    public async resetPassowrd(request: any, response: any) {
        let requestData = await this.getRequest(request);
        let data = JSON.parse(JSON.stringify(requestData));
        const isTokenExpired = this.isTokenExpired(data.passwordToken);        
        let password = await md5(data.password);
        /** check if user is already exists **/
        var checkEmpty = await this.db.getRows("SELECT * FROM password_resets where token = '" + data.passwordToken + "'");
        var _pdata = JSON.parse(JSON.stringify(checkEmpty));
        var user_id = _pdata[0].id;

        if (this.isEmptyObject(checkEmpty)) {
            this.res = { status: false, message: 'Invalid password request.' };
        } else if(isTokenExpired){
            this.res = { status: false, message: 'Your reset password link is expired, please send again to reset your password.' };
        } else {
            let query = "UPDATE users SET password = '" + password + "' WHERE id='" + user_id + "'";            
            let result = await this.db.insertData(query);
            if (result) {
                this.res = { status: true, message: 'Your password has been successfully updated.' };
            } else {
                this.res = { status: false, message: 'Please try again, someting going wrong' };
            }
        }
        return this.getResponse(response, this.res);
    }

    public isTokenExpired(token:string) {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
        const decoded = JSON.parse(decodedJson)
        const exp = decoded.exp;
        const expired = (Date.now() >= exp * 1000)
        return expired
      }
}


