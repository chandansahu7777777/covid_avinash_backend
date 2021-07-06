module.exports = {

  development: {

    port: process.env.PORT || 80,
    saltingRounds: 10,
    MONGO_URL: "mongodb+srv://root:root@tournaments-raem9.mongodb.net/my-test?retryWrites=true&w=majority",
    JWT_SECRET: 'Avinashcovid',
    mysql_connection_limit: 250,
    mysql_connection_host: 'veelouat.cridrmj6kpdu.ap-south-1.rds.amazonaws.com',
    mysql_user: 'veelouat',
    mysql_password: 'veelouat',
    mysql_database: 'covid_avinash',
    mysql_port: '3306',
    email: 'veelobikesindia@gmail.com',
    password: 'veelobikes@1'
  },

  production: {
    port: process.env.PORT || 80,
    saltingRounds: 10,
    MONGO_URL: "mongodb+srv://root:root@tournaments-raem9.mongodb.net/my-test?retryWrites=true&w=majority",
    JWT_SECRET: 'Avinashcovid',
    mysql_connection_limit: 250,
    mysql_connection_host: 'veelouat.cridrmj6kpdu.ap-south-1.rds.amazonaws.com',
    mysql_user: 'veelouat',
    mysql_password: 'veelouat',
    mysql_database: 'covid_avinash',
    mysql_port: '3306',
    email: 'veelobikesindia@gmail.com',
    password: 'veelobikes@1'
  },

}
