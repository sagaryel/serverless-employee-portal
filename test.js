const { expect } = require('chai');
const { createEmpCertificate, updateEmpCertificate } = require('./app');
const {
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({}),
};

// Mock employee data for createEmployeecertificate
const createCertificateDetails = {
    empId: "7",
    certificateDetails: {
        "TechnologyName":"AWS",
        "CertificationAuthority": "hello",
        "CertifiedDate": "2022-10-04",
        "CertificationValidLastDate": "2023-10-05",
        "IsActive":true
    }
  };


// Mock employee data for updateEmployee
const updateEmployeeData = {
    "TechnologyName":"sagar",
    "CertificationAuthority": "hello",
    "CertifiedDate": "2022-10-05",
    "CertificationValidLastDate": "2023-10-06",
    "IsActive":true
};

// Successfully create an employee certification
describe('createEmployee unit tests', () => {
    let originalDynamoDBClient;
    before(() => {
        originalDynamoDBClient = DynamoDBClient;
        DynamoDBClient.prototype.send = () => mockClient.send();
      });
    after(() => {
        DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
      });
    });

    it('successfully create an employee certification', async () => {
      // Mock event object with employee data
      let event = {
        body: JSON.stringify(createCertificateDetails),
      };
      const response = await createEmpCertificate(event);
      expect(response.statusCode).to.equal(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).to.equal('Successfully created certificate details.');  // Correct the message if necessary
    });

    it('fails to create an employee with missing data', async () => {
      // Mock event object with missing data
      const event = {
        body: JSON.stringify({}), // Simulating missing required data in the request body
      };
    
      // Call the createEmpCertificate function and await its response
      const response = await createEmpCertificate(event);
    
      // Expecting an error response with a status code of 500
      expect(response.statusCode).to.equal(500);
    });
    

    it('fails to create an employee with invalid data', async () => {
      // Mock event object with invalid data
      const event = {
        body: JSON.stringify({
          // Invalid data that should fail validation
          technologyName: 'sagar', // Example: Technology name is too short
        }),
      };
    
      // Call the createEmpCertificate function and await its response
      const response = await createEmpCertificate(event);
    
      // Expecting an error response with a status code of 500
      expect(response.statusCode).to.equal(500);
    });
    


  // Successfully updated an employee
  describe('Unit tests for updateEmployee', () => {
    let originalDynamoDBClient;
  
    // Before running the tests, we temporarily override the DynamoDBClient's send method with a mockClient's send method.
    before(() => {
      originalDynamoDBClient = DynamoDBClient;
      DynamoDBClient.prototype.send = () => mockClient.send(); // Mocking DynamoDBClient send method
    });
  
    // After the tests, we restore the original send method to avoid affecting other parts of the code.
    after(() => {
      DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
    });
  
    
    it('successfully updates an employee', async () => {
      // Mock event object with the employee ID and updated data
      const event = {
        pathParameters: {
          empId: '2', // Assuming this empId exists
        },
        body: JSON.stringify(updateEmployeeData), // Provide the updated employee data
      };
    
      // Call the updateEmpCertificate function and await its response
      const response = await updateEmpCertificate(event);
    
      // Expecting a successful response with a status code of 200
      expect(response.statusCode).to.equal(200);
    
      // Parse the response body to access its properties
      const responseBody = JSON.parse(response.body);
    
      // Expecting a specific success message in the response body (adjust as needed)
      expect(responseBody.message).to.equal('Successfully updated certificate details.');
    });
    


    it('fails to update an employee with an invalid employee ID', async () => {
      // Mock event object with an invalid employee ID
      const event = {
        pathParameters: {
          empId: '8', // Assuming this empId does not exist or is invalid
        },
        body: JSON.stringify(updateEmpCertificate), // Provide the data for updating an employee
      };
    
      // Call the updateEmpCertificate function and await its response
      const response = await updateEmpCertificate(event);
    
      // Expecting an error response with a status code of 500
      expect(response.statusCode).to.equal(500);
    });
    


    it('fails to update an employee with invalid data', async () => {
      // Mock event object with an employee ID and invalid data
      const event = {
        pathParameters: {
          empId: '10',                      // Assuming this empId exists
        },
        body: JSON.stringify({
          // Invalid data that should fail validation
          CertifiedDate: "10-03-2023",         // Example: Technology name is too short
        }),
      };
    
      // Call the updateEmpCertificate function and await its response
      const response = await updateEmpCertificate(event);
    
      // Expecting an error response with a status code of 500
      expect(response.statusCode).to.equal(500);
    });
  });