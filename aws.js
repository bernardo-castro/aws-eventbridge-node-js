const AWS = require('aws-sdk');
const { SchedulerClient, CreateScheduleCommand, DeleteScheduleCommand } = require("@aws-sdk/client-scheduler");
const { AWS_CRED } = require('./constants/cred');

const getLambdaInfo = async ({
  functionName,
}) => {
  try {
    const params = {
      FunctionName: functionName,
    };
    const lambdaService = new AWS.Lambda(AWS_CRED);
    const lambdaInfo = await lambdaService.getFunction(params).promise();    
    return lambdaInfo;
  } catch (error) {
    console.log(error);
  }
};

const getRoleInfo = async ({
  roleName,
}) => {
  try {
    const params = {
      RoleName: roleName
    };
    const iamService = new AWS.IAM(AWS_CRED);
    const iamRoleInfo = await iamService.getRole(params).promise();
    return iamRoleInfo;
  } catch (error) {
    console.log(error);
  }
};

const parseDateToScheduleExpression = (monthSend) => {
  const date = new Date(Date.now());
  date.setMonth(date.getMonth() + monthSend);
  const dateInText = date.toISOString();
  const dotIndex = dateInText.lastIndexOf('.');
  const timeZoneInitialIndex = dateInText.length - 1;
  const indexToSliceDate = Math.min(dotIndex, timeZoneInitialIndex);
  const parsedDate = dateInText.slice(0, indexToSliceDate);
  const scheduleExpression = `at(${parsedDate})`;
  return scheduleExpression;
};

const createEvent = async ({ eventName, processId,measurementId, monthSend }) => {
  const client = new SchedulerClient(AWS_CRED);
  const lambda = await getLambdaInfo({functionName: process.env.LAMBDA_MDI});  
  const role = await getRoleInfo({roleName: process.env.EVENTBRIDGE_ROLE});

  const input = JSON.stringify({
    processId: processId,
    measurementId: measurementId,
  });

  const params = {
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
    Name: eventName,
    ScheduleExpression: parseDateToScheduleExpression(monthSend),
    Target: {
      Arn: lambda.Configuration.FunctionArn,
      RoleArn: role.Role.Arn,
      Input: input,
    },
    State: 'ENABLED',
  };
  
  const command = new CreateScheduleCommand(params);

  try {
    const data = await client.send(command);    
    return data;
  } catch (error) {    
    console.log(error);
  } finally {
    
  }
};


const removeEvent = async ({ eventName }) => {
  try {
    const client = new SchedulerClient(AWS_CRED);
    const deleteScheduleCommand = new DeleteScheduleCommand({
      Name: eventName
    });
    
    const result = await client.send(deleteScheduleCommand);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createEvent, removeEvent }