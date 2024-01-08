import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Route } from './route';

const hostname = 'localhost'; 
const port = 5000;
let route = new Route;


const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    route.handleRequests(request, response);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});