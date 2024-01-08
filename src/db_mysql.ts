const dotenv = require('dotenv').config(); 
const mysql = require('mysql2');

export class MysqlDB {
    public mysqlClient: any = '';
    constructor() {       
        // create a new MySQL connection
        this.mysqlClient = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        // connect to the MySQL database
        this.mysqlClient.connect((error: any) => {
            if (error) {
            console.error('Error connecting to MySQL database:', error);
            } else {
            console.log('Connected to MySQL database!');
            }
        });
               

        // close the MySQL connection
        // this.mysqlClient.end();
    }
        /************************ Getting records *****************************************************************************/
        public async getRows (query: string){
            const _self = this;
            return new Promise (function(resolve: any, reject: any ) {
                _self.mysqlClient.query(query, (error:any, response:any) => {
                    // console.log(error); 
                    // console.log(response); return false;
                    resolve(response);
                });
            });     
        }
    
        /************************ Storing records *****************************************************************************/
        public async insertData (query: any){
            const _self = this;
            return new Promise (function(resolve: any, reject: any ) {
                _self.mysqlClient.query(query, (error:any, response:any) => {
                    if(response){
                        resolve( true );
                    }else{
                        resolve( false );
                    }
                });
            });
        }
}