module.exports.AWS_CRED = {
  credentials: {
    accessKeyId: process.env.EVENTBRIDGE_USER,
    secretAccessKey: process.env.EVENTBRIDGE_PASSWORD,
  },
  region: 'us-east-1', 
  lambdaMdi: 'LAMBDA_MDI',
  role: 'EVENTBRIDGE_ROLE',
};
