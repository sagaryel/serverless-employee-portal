const {
    DynamoDBClient,
    PutItemCommand,
    ScanCommand,
    UpdateItemCommand,
  } = require('@aws-sdk/client-dynamodb');
  const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
  
  const client = new DynamoDBClient();
  
  const createEmpCertificate = async (event) => {
    console.log("inside the add certification details method");
    const response = { statusCode: 200 };
    try {
      const body = JSON.parse(event.body);
      const certDetails = body.certificateDetails
    // Check for required fields
    if (!body.certDetails.TechnologyName || !body.certDetails.CertificationAuthority || !body.certDetails.CertifiedDate || !body.certDetails.CertificationValidLastDate  || !body.certDetails.IsActive) {
        throw new Error('Required fields are missing.');
      }
  
      // Validate the incoming data
      //validatePostData(body);
  
    //   const empData = {
    //     TableName: process.env.DYNAMODB_TABLE_NAME,
    //     Key: marshall({ empId: body.empId }),
    //   };
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall({
        empId: body.empId,
    certificationDetails : {
        TechnologyName: certDetails.TechnologyName,                     //certified technology name object
        CertificationAuthority: certDetails.CertificationAuthority,
        CertifiedDate: certDetails.CertifiedDate,
        CertificationValidLastDate: certDetails.CertificationValidLastDate,
        IsActive: certDetails.IsActive,                  //required boolean
        CreatedDateTime: Date.now(), 
        //UpdatedDateTime: bankDetails.IsActive, 
      }}, { removeUndefinedValues: true }),                       //for remove undefined fields
    };
    const createResult=await db.send(new PutItemCommand(params));
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