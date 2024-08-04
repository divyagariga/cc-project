import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

const ses = new SESClient({ region: "us-east-2" });
const s3 = new S3Client({ region: "us-east-2" });
const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

export const handler = async (event, context) => {
  try {
    console.log("event", event);
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    const fileUrl = `https://${bucketName}.s3.${record.awsRegion}.amazonaws.com/${objectKey}`;
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: srcKey
    });
    const response = await s3.send(command);
    console.log('Metadata:', response.Metadata);
  
    // Extract the emails string
    const emailsString = response.Metadata.emails;

    // Parse the JSON string into an array
    const emailList = JSON.parse(emailsString);

    // Log the email list
    console.log(emailList);

    // Store file metadata in DynamoDB
    await storeFileMetadata(objectKey, bucketName, response.Metadata);

    for (const email of emailList) {
      await sendMail("CC-Multiweek project", fileUrl, email);
    }

    return {
      statusCode: 200,
      body: JSON.stringify('Email sent successfully'),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Failed to send email'),
    };
  }
};

async function sendMail(subject, data, email) {
  const emailParams = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: { Data: data },
      },
      Subject: { Data: subject },
    },
    Source: "divdiya20@gmail.com",
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await ses.send(command);
    console.log("MAIL SENT SUCCESSFULLY!!");
  } catch (e) {
    console.error("FAILURE IN SENDING MAIL!!", e);
    throw e;
  }
}

async function storeFileMetadata(objectKey, bucketName, metadata) {
  const params = {
    TableName: 'Files', 
    Item: {
      FileID: randomUUID(), 
      BucketName: bucketName,
      ObjectKey: objectKey,
      Metadata: metadata, 
      UploadDate: new Date().toISOString(),
    },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log('File metadata saved successfully to DynamoDB');
  } catch (error) {
    console.error('Error saving file metadata to DynamoDB:', error);
    throw error;
  }
}
