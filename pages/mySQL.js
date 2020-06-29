// https://stackoverflow.com/questions/58638651/react-native-and-mysql-connection
import {mysql} from 'mysql';
import {express} from 'express';

const connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',     
  password : '',        
  database : 'my_db' 
});

const app = express();

app.get('/users', function (req, res) {
    connection.getConnection(function (err, connection) {
    // Selects all data from users table - this is an example query
    connection.query('SELECT * FROM users', function (error, results, fields) {
      if (error) throw error;
      res.send(results)
    });
  });
});

app.listen(3000, () => {
 console.log('http://localhost:3000/users displays data.');
});

// Getting data

/*
test(){
    fetch('http://yourPCip:3000/users')
      .then(response => response.json())
      .then(users => console.warn(users))
  }
*/