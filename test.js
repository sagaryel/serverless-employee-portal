const { expect } = require('chai');
const { createEmpCertificate, updateEmpCertificate } = require('./app');
const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({}),
};

// Mock employee data for createEmployeecertificate
const certificateDetails = {
    empId: "2",
    certificateDetails: {
        "TechnologyName":"yelgond",
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
    "CertifiedDate": "2022-10-04",
    "CertificationValidLastDate": "2023-10-05",
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
        body: JSON.stringify(createEmpCertificate),
      };
      const response = await createEmpCertificate(event);
      expect(response.statusCode).to.equal(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).to.equal('Successfully created certificate details.');  // Correct the message if necessary
    });

    it('fails to create an employee with missing data', async () => {
      // Mock event object with missing data
      let event = {
        body: JSON.stringify({}), // Missing required data
      };
      const response = await createEmpCertificate(event);
      expect(response.statusCode).to.equal(500); // Expecting an error response
    });

    it('fails to create an employee with invalid data', async () => {
      // Mock event object with invalid data
      let event = {
        body: JSON.stringify({
          // Invalid data that should fail validation
          TechnologyName: 'AB', // Too short
        }),
      };
      const response = await createEmpCertificate(event);
      expect(response.statusCode).to.equal(500); // Expecting an error response
    });


  // Successfully updated an employee
  describe('updateEmployee unit tests', () => {
    let originalDynamoDBClient;
    before(() => {
        originalDynamoDBClient = DynamoDBClient;
        DynamoDBClient.prototype.send = () => mockClient.send();
      });
      after(() => {
        DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
      });
    it('successfully update an employee', async () => {
      // Mock event object with the employee ID and updated data
      let event = {
        pathParameters: {
          empId: '2',         // Assuming this postId exists
        },
        body: JSON.stringify(updateEmpCertificate),
      };
      const response = await updateEmpCertificate(event);
      expect(response.statusCode).to.equal(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.message).to.equal('Successfully updated certificate details.'); // Correct the message if necessary
    });


    it('fails to update an employee with invalid employee ID', async () => {
      // Mock event object with an invalid employee ID
      let event = {
        pathParameters: {
          empId: '8', // An invalid postId
        },
        body: JSON.stringify(updateEmpCertificate),
      };
      const response = await updateEmpCertificate(event);
      expect(response.statusCode).to.equal(500); // Expecting an error response
    });


    it('fails to update an employee with invalid data', async () => {
      // Mock event object with invalid data
      let event = {
        pathParameters: {
          empId: '2', // Assuming this postId exists
        },
        body: JSON.stringify({
          // Invalid data that should fail validation
          TechnologyName: 'he', // Too short
        }),
      };
      const response = await updateEmpCertificate(event);
      expect(response.statusCode).to.equal(500); // Expecting an error response
    });
  });