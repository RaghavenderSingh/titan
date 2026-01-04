import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function run() {
  const deploymentId = "48563df2-f8a7-44c9-8c8a-797748bfc4e5";
  const prefix = `deployments/${deploymentId}/`;
  
  console.log(`Listing for prefix: ${prefix}`);
  const res = await s3.listObjectsV2({
    Bucket: process.env.S3_BUCKET || "vercel-clones",
    Prefix: prefix,
    Delimiter: "/",
  }).promise();

  console.log("Root files in S3:");
  res.Contents?.forEach(o => {
      console.log(`- ${o.Key?.replace(prefix, "")}`);
  });

  console.log("Common prefixes (directories):");
  res.CommonPrefixes?.forEach(o => {
      console.log(`- ${o.Prefix?.replace(prefix, "")}`);
  });
}

run().catch(console.error);
