import BigQuery from '@google-cloud/bigquery';

const GAE_INSTANCE = process.env.GAE_INSTANCE;

export fuction genClient() {
  let bigquery;
  if (GAE_INSTANCE) {
    bigquery = BigQuery();
  } else {
    bigquery = BigQuery({
      projectId: 'grape-spaceship-123',
      keyFilename: '/Users/vampolo/Dropbox/gutenberg/gutenberg-a24ca5c4447c.json'
    });
  }
}
