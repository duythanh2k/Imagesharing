const swaggerAutogen = require('swagger-autogen')();
const YAML = require('yamljs');

const doc = {
  info: {
    version: '1.0.0',      
    title: 'API post management ',        
    description: 'Swagger api documentation',  
  },
  host: process.env.PORT,      
  basePath: '/',  
  schemes: ['http','https'],   
  consumes: ['application/json'],  
  produces: ['application/json'],  
  tags: [        
    {
      name: 'Users',         
      description: 'Endpoint api',  
    },  
  ]         
};

const outputFile = YAML.load("./swagger-output.yaml");
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);