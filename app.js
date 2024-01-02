const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const moment = require('moment')


const client = new DynamoDBClient();

const currentDate = Date.now();      // get the current date and time in milliseconds
const formattedDate = moment(currentDate).format('YYYY-MM-DD');    //formating date

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;   // dateformate YYYY-MM-DD
const nameRegex = /^[A-Za-z ]{3,32}$/;     // character limit min 3 to max 32

// validating the each parameter 
const validatePostData = (employee) => {
  if (employee.CertificationValidLastDate < employee.CertifiedDate) {
    return 'certificate last date cannot be less then certified date.';
  }
  if (!(dateRegex.test(employee.CertifiedDate) && dateRegex.test(employee.CertificationValidLastDate))) {
    return 'Invalid date format.';
  }
  if (!(nameRegex.test(employee.CertificationAuthority.test) && nameRegex.test(employee.TechnologyName))) {
    return 'Invalid data.';
  }
}

// creating a employee certification data
const createEmpCertificate = async (event) => {
  console.log("inside the create certification details");
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const certificateDetails = body.certificateDetails
    // Check for required fields
    if (!body.certificateDetails.TechnologyName || !body.certificateDetails.CertificationAuthority || !body.certificateDetails.CertifiedDate || !body.certificateDetails.CertificationValidLastDate || !body.certificateDetails.IsActive) {
      throw new Error('Required fields are missing.');
    }

    // Validate the incoming data
    const validationError = validatePostData(certificateDetails);
    if (validationError) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: validationError,
      })
      throw new Error(validationError);
    }
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        empId: body.empId,
        certificateDetails: {
          TechnologyName: certificateDetails.TechnologyName,                     //certified technology name object
          CertificationAuthority: certificateDetails.CertificationAuthority,
          CertifiedDate: certificateDetails.CertifiedDate,
          CertificationValidLastDate: certificateDetails.CertificationValidLastDate,
          IsActive: certificateDetails.IsActive,                                 //required boolean
          CreatedDateTime: formattedDate,
          //UpdatedDateTime: 
        }
      }, { removeUndefinedValues: true }),                                    //for remove undefined fields
    };
    const createResult = await client.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created certificate details.',
      createResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to certificate details.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

// updating the employee certification details by employee id
const updateEmpCertificate = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const certificateDetails = body.certificateDetails
    const objKeys = Object.keys(body);
    const validationError = validatePostData(certificateDetails);
    if (validationError) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: validationError,
      })
      throw new Error(validationError);
    }
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId: event.pathParameters.empId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const updateResult = await client.send(new UpdateItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully updated certificate details.',
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to update certificate details.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};


const getCertificates = async (event) => {
  const response = { statusCode: 200 };
  console.log('event', event);
  console.log('response', response);
  try {
    if (event.pathParameters && event.pathParameters.empID) {
      // If empID is provided in the path parameters, retrieve a specific certificate
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ empID: event.pathParameters.empID }),
      };
      const { Item } = await client.send(new GetItemCommand(params));
      console.log('Item', JSON.stringify(Item, null, 2));

      response.body = JSON.stringify({
        message: `Successfully retrieved empId: ${event.pathParameters.empID}`,
        data: Item ? unmarshall(Item) : {},
        rawData: Item,
      });
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get certificates.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
    console.log(response.body);
  }

  return response;
};

const getAllCertificates = async (event) => {
  const response = { statusCode: 200 };
  console.log('event', event);
  console.log('response', response);
  try {
    const { Items } = await client.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );

    response.body = JSON.stringify({
      message: 'Successfully retrieved all Certificates',
      data: Items?.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get certificates.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
    console.log(response.body);
  }

  return response;
};


const deleteCertificatesById = async (event) => {
  const response = { statusCode: 200 };
  console.log('event', event);
  console.log('response', response);
  try {
    // Define the update expression to set isActive to true
    const updateExpression = 'SET isActive = :isActive';
    // Define the expression attribute values
    const expressionAttributeValues = marshall({
      ':isActive': true,
    });
    const softDeleteParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ certificationId: certificationId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    const softDeleteResult = await client.send(new UpdateItemCommand(softDeleteParams));
    response.body = JSON.stringify({
      message: 'Certification soft-deleted successfully.',
      softDeleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get certificates.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
    console.log(response.body);
  }

  return response;
};


const deleteAllCertificates = async (event) => {
  const response = { statusCode: 200 };
  console.log('event', event);
  console.log('response', response);
  try {
    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ certificationId }),
    };
    const { Item } = await client.send(new GetItemCommand(getItemParams));
    if (!Item) {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: `Certification with certificationId ${certificationId} not found`,
      });
      return response;
    }
    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ certificationId }),
    };
    const deleteResult = await client.send(new DeleteItemCommand(deleteParams));
    response.body = JSON.stringify({
      message: 'Certification deleted successfully.',
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get certificates.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
    console.log(response.body);
  }
  return response;
};


module.exports = {
  createEmpCertificate,
  updateEmpCertificate,
  getCertificates,
  getAllCertificates,
  deleteCertificatesById,
  deleteAllCertificates
};