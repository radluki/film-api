import { url } from "../tests/common";
import supertest from 'supertest';


async function validateServerListens() {
  try {
    const request = supertest(url);
    const healthCheckPath = '/healthcheck';
    const response = await request.get(healthCheckPath);

    if (response.status === 200) {
      console.log(`Healthcheck passed!!! - ${healthCheckPath} is reachable`);
    } else {
      console.error('/healthcheck response:', response.status, response.body);
      console.error(`Server health check failed. Make sure the server is running on ${url}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during health check:', error.message);
    console.error(`Make sure the server is running on ${url}`);
    process.exit(1);
  }
}

validateServerListens();
