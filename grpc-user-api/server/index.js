const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const users = [];
let currentId = 1;

const server = new grpc.Server();

server.addService(userProto.UserService.service, {
  GetUsers: (_, callback) => {
    callback(null, { users });
  },

  CreateUser: (call, callback) => {
    const { name, email } = call.request;
    if (!name || !email) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Ime i email se moraju uneti ',
      });
    }

    const user = { id: currentId++, name, email };
    users.push(user);
    callback(null, user);
  },

  DeleteUser: (call, callback) => {
    const { id } = call.request;
  
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Korisnik nije pronadjen',
      });
    }
  
    users.splice(index, 1);
    callback(null, {});
  },
});

server.bindAsync(
  '127.0.0.1:50051',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('gRPC server running at http://127.0.0.1:50051');
    server.start();
  }
);