const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const PROTO_PATH = __dirname + '/../proto/user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createUser() {
  rl.question('Enter name: ', (name) => {
    rl.question('Enter email: ', (email) => {
      client.CreateUser({ name, email }, (err, response) => {
        if (err) {
          console.error('Error creating user:', err.message);
        } else {
          console.log('User created:', response);
        }
        showMenu();
      });
    });
  });
}

function listUsers() {
  client.GetUsers({}, (err, response) => {
    if (err) {
      console.error('Error fetching users:', err.message);
    } else {
      console.log('User list:');
      response.users.forEach((u) => {
        console.log(`- [${u.id}] ${u.name} <${u.email}>`);
      });
    }
    showMenu();
  });
}

function showMenu() {
  console.log('\n1. Create user\n2. List users\n0. Exit');
  rl.question('Choose option: ', (choice) => {
    switch (choice) {
      case '1':
        createUser();
        break;
      case '2':
        listUsers();
        break;
      case '0':
        rl.close();
        break;
      default:
        console.log('Invalid option');
        showMenu();
    }
  });
}

showMenu();