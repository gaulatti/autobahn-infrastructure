import { isWarmup } from '../../../common/utils';

const main = (event: unknown) => {
  console.log(event);

  if (isWarmup(event)) {
    return 'Warmup Request';
  }

  return {}
};

export { main };
