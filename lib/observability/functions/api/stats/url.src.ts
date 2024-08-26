import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ListRenderingParams } from '../../dal/types';

const main = HandleDelivery(async (event: any) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  const urlRecord = await DalClient.getURLByUUID(uuid);
  return { urlRecord };
});

export { main };
