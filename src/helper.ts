// const jwt = require("jsonwebtoken");
// const formidable = require('formidable');
// const fs = require('fs');

export class Helper {


    public getRequest(req: any) {
        return new Promise(function (resolve, reject) {
            var body: any = [];
            req.on('data', (data: any) => {
                body.push(data);
            });

            // req.on('end', function() {
            //     try {
            //         body = JSON.parse(Buffer.concat(body).toString());
            //     } catch(e) {
            //         reject(e);
            //     }
            //     resolve(body);
            // });

            req.on('end', () => {
                // console.log(body); return false;
                var obj = JSON.parse(body);
                // obj.token = req.headers.authorization;
                return resolve(obj);
            });
        });
    }

    public getResponse(res: any, data: any) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    }

    public checkEmpty(data: any, fields: any) {
        var msg: any = [];
        fields.forEach((element: any) => {
            if (data[element] == undefined || data[element] == null || data[element] == " ") {
                msg.push(element + " field is required.");
            }
        });
        return msg;
    }

    public isEmptyObject(obj: any) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                return false;
            }
        }
        return true;
    }

}