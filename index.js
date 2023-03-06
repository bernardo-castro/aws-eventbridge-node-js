require('dotenv').config();
const app = require('express')();
const { createEvent, removeEvent } = require('./aws');

app.listen(3002, async () => {  
  const eventName = 'dev-send-lambda-test';
  const processId = 'b5abccee-b2d9-45b4-b041-89da395c10f2FFFF';
  const measurementId = '54728cbc-0d4a-43c6-ad57-0c4b67a06625FFFF';
  const monthSend = 6;
 
  await createEvent({
    eventName, processId,measurementId, monthSend
  });

  await removeEvent({eventName});

  console.log('fin');
});
