const {
    DynamoDBClient,
    PutItemCommand,
    ScanCommand,
    UpdateItemCommand,
  } = require('@aws-sdk/client-dynamodb');
  const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
  
  const moment= require('moment')

  
  const client = new DynamoDBClient();

  const currentDate = Date.now();      // get the current date and time in milliseconds
  const formattedDate = moment(currentDate).format('YYYY-MM-DD');    //formating date


  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;   // dateformate YYYY-MM-DD
  const nameRegex = /^[A-Za-z ]{3,32}$/;     // character limit min 3 to max 32

  // validating the each parameter 
  const validatePostData = (employee) => {
    if( employee.CertificationValidLastDate < employee.CertifiedDate ){
      throw new Error('certificate last date cannot be less then certified date.');
    }
    if(!(dateRegex.test(employee.CertifiedDate) && dateRegex.test(employee.CertificationValidLastDate))){
      throw new Error('Invalid date format.');
    }
    if(!(nameRegex.test(employee.CertificationAuthority.test) && nameRegex.test(employee.TechnologyName))){
      throw new Error('Invalid data.');
    }
  }
  
  // creating a employee certification data
  const createEmpCertificate = async (event) => {
    console.log("inside the add certification details method");
    const response = { statusCode: 200 };
    try {
      const body = JSON.parse(event.body);
      const certificateDetails = body.certificateDetails
    // Check for required fields
    if (!body.certificateDetails.TechnologyName || !body.certificateDetails.CertificationAuthority || !body.certificateDetails.CertifiedDate || !body.certificateDetails.CertificationValidLastDate  || !body.certificateDetails.IsActive) {
        throw new Error('Required fields are missing.');
      }
  
      // Validate the incoming data
      validatePostData(certificateDetails);
  
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        empId: body.empId,
        certificateDetails : {
        TechnologyName: certificateDetails.TechnologyName,                     //certified technology name object
        CertificationAuthority: certificateDetails.CertificationAuthority,
        CertifiedDate: certificateDetails.CertifiedDate,
        CertificationValidLastDate: certificateDetails.CertificationValidLastDate,
        IsActive: certificateDetails.IsActive,                                 //required boolean
        CreatedDateTime: formattedDate, 
        //UpdatedDateTime: 
      }}, { removeUndefinedValues: true }),                                    //for remove undefined fields
    };
    const createResult=await client.send(new PutItemCommand(params));
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
      const objKeys = Object.keys(body);
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
  
  module.exports = {
    createEmpCertificate,
    updateEmpCertificate
  };