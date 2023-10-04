const {
    DynamoDBClient,
    PutItemCommand,
    ScanCommand,
    UpdateItemCommand,
  } = require('@aws-sdk/client-dynamodb');
  const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
  
  const client = new DynamoDBClient();

  var currentDate = Date.now(); // get the current date and time in milliseconds
  var formattedDate = moment(currentDate).format('YYYY/MM/DD');


  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  var nameRegex = /^[A-Za-z ]{3,32}$/;

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
        IsActive: certificateDetails.IsActive,                  //required boolean
        CreatedDateTime: formattedDate, 
        //UpdatedDateTime: 
      }}, { removeUndefinedValues: true }),                       //for remove undefined fields
    };
    const createResult=await client.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created post.',
      createResult,
    });
     } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to create post.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  };
  // ... rest of your code ...
  
  module.exports = {
    createEmpCertificate
  };