import { DalClient } from '../dal/client';

const main = async (event: any) => {
  // TODO: Create type for this. It should come from GraphQL/Appsync with some user metadata.
  console.log({ event });

  try {
    const response = await DalClient.getUser(123);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

export { main };
