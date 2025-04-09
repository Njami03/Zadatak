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
  rl.question('Unesi ime: ', (name) => {
    rl.question('Unesi email: ', (email) => {
      client.CreateUser({ name, email }, (err, response) => {
        if (err) {
          console.error('Error pri kreiranju korisnika:', err.message);
        } else {
          console.log('Korisnik kreiran:', response);
        }
        showMenu();
      });
    });
  });
}

function listUsers() {
  client.GetUsers({}, (err, response) => {
    if (err) {
      console.error('Greska:', err.message);
    } else if(!response.users){
      console.log('Nema korisnika za prikazivanje.')
    }else {
      console.log('Lista korisnika:');
      response.users.forEach((u) => {
        console.log(`- [${u.id}] ${u.name} <${u.email}>`);
      });
    }
    showMenu();
  });
}

function deleteUser() {
  rl.question('Unesi ID korisnika kog zelis da obrises: ', (id) => {
    client.DeleteUser({ id: parseInt(id) }, (err, _) => {
      if (err) {
        console.error('Error pri brisanju:', err.message);
      } else {
        console.log(`Korisnik sa ID-om ${id} obrisan.`);
      }
      showMenu();
    });
  });

}

function showMenu() {
  console.log('1. Kreiraj korisnika ');
  console.log('2. Lista korisnika ');
  console.log('3. Obrisi korisnika ');
  console.log('0. Exit');
  rl.question('Izaberi opciju: ', (choice) => {
    switch (choice) {
      case '1':
        createUser();
        break;
      case '2':
        listUsers();
        break;
      case '3':
        deleteUser();
        break;
      case '0':
        rl.close();
        break;
      default:
        console.log('Nepostojeca opcija ');
        showMenu();
    }
  });
}

showMenu();