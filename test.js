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
// Mock employee data for createEmployee
const createEmployeeCertificateData = {
  empId: "25",
  certificateDetails: {
    TechnologyName: "AWS",
    CertificationAuthority: "hello",
    CertifiedDate: "2022-10-04",
    CertificationValidLastDate: "2023-10-05",
    IsActive: true
  }
};
// Mock employee data for updateEmployee
const updateEmployeeCertificateData = {
  certificateDetails: {
    TechnologyName: "AWr",
    CertificationAuthority: "hello",
    CertifiedDate: "2022-10-04",
    CertificationValidLastDate: "2023-10-05",
    IsActive: true
  }
};
// Successfully create an employee
describe('createEmployee unit tests', () => {
  let originalDynamoDBClient;
  before(() => {
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });
  after(() => {
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });
  it('successfully create an employee', async () => {
    // Mock event object with employee data
    let event = {
      body: JSON.stringify(createEmployeeCertificateData),
    };
    const response = await createEmpCertificate(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Successfully created certificate details.');
  });
  // it('fails to create an employee with missing data', async () => {
  //   // Mock event object with missing data
  //   let event = {
  //     body: JSON.stringify({}), // Missing required data
  //   };
  //   const response = await createEmployee(event);
  //   expect(response.statusCode).to.equal(400); // Expecting a 400 Bad Request for missing data
  // });
  it('fails to create an employee with invalid certificate data', async () => {
    // Mock event object with invalid data
    let event = {
      body: JSON.stringify({
        certificateDetails : {
        // Invalid data that should fail validation
        TechnologyName: 'AB', // Too short
        }
      }),
    };
    const response = await createEmpCertificate(event);
    expect(response.statusCode).to.equal(500); // Expecting a 400 Bad Request for invalid data
    const responseBody = JSON.parse(response.body);
    expect(responseBody.errorMsg).to.equal('Required fields are missing.');
  });
});
// Successfully update an employee
describe('updateEmployee unit tests', () => {
  let originalDynamoDBClient;
  before(() => {
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });
  after(() => {
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });
  it('successfully update an employee certificate details', async () => {
    // Mock event object with the employee ID and updated data
    let event = {
      pathParameters: {
        empId: '25', // Assuming this postId exists
      },
      body: JSON.stringify(updateEmployeeCertificateData),
    };
    const response = await updateEmpCertificate(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Successfully updated certificate details.'); // Update the message if necessary
  });
  it('fails to update an employee with invalid certificate data', async () => {
    // Mock event object with invalid data
    let event = {
      pathParameters: {
        empId: '25', // Assuming this postId exists
      },
      body: JSON.stringify({
        // Invalid data that should fail validation
        certificateDetails  : {
          CertifiedDate: '2022/10/04', // invalid date format
        }
      }),
    };
    const response = await updateEmpCertificate(event);
    expect(response.statusCode).to.equal(500); // Expecting a 400 Bad Request for invalid data
    const responseBody = JSON.parse(response.body);
    expect(responseBody.errorMsg).to.equal('certificateDetails is not defined');
  });
 });