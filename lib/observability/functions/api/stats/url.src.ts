import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { DateRangeParams } from '../../dal/types';

const cwvStats = [
  {
    name: 'TTFB',
    stats: {
      mobile: {
        value: 1565,
        variation: 1.1,
      },
      desktop: {
        value: 775,
        variation: -1.4,
      },
    },
  },
  {
    name: 'FCP',
    stats: {
      mobile: {
        value: 3504,
        variation: 1.1,
      },
      desktop: {
        value: 2109,
        variation: 2.4,
      },
    },
  },
  {
    name: 'DCL',
    stats: {
      mobile: {
        value: 28290,
        variation: 1.1,
      },
      desktop: {
        value: 2930,
        variation: 0,
      },
    },
  },
  {
    name: 'SI',
    stats: {
      mobile: {
        value: 4019,
        variation: 0,
      },
      desktop: {
        value: 3930,
        variation: 0,
      },
    },
  },
  {
    name: 'LCP',
    stats: {
      mobile: {
        value: 3504,
        variation: 0,
      },
      desktop: {
        value: 3930,
        variation: 0,
      },
    },
  },
  {
    name: 'TTI',
    stats: {
      mobile: {
        value: 11524,
        variation: 0,
      },
      desktop: {
        value: 7888,
        variation: 0,
      },
    },
  },
];

const scores = [
  {
    name: 'Performance',
    scores: {
      mobile: {
        score: 47,
        variation: 1.1,
      },
      desktop: {
        score: 64,
        variation: -1.4,
      },
    },
  },
  {
    name: 'Accessibility',
    scores: {
      mobile: {
        score: 87,
        variation: 1.1,
      },
      desktop: {
        score: 88,
        variation: 2.4,
      },
    },
  },
  {
    name: 'Best Practices',
    scores: {
      mobile: {
        score: 93,
        variation: 1.1,
      },
      desktop: {
        score: 93,
        variation: 0,
      },
    },
  },
  {
    name: 'SEO',
    scores: {
      mobile: {
        score: 100,
        variation: 0,
      },
      desktop: {
        score: 100,
        variation: 0,
      },
    },
  },
];

const main = HandleDelivery(async (event: any) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  const urlRecord = await DalClient.getURLByUUID(uuid);
  const rangeParams: DateRangeParams = (event.queryStringParameters as unknown as DateRangeParams) || {};

  const statPulses = await DalClient.listStatsPulsesByURL(urlRecord.id, rangeParams);
  console.log(JSON.stringify(statPulses));

  return { urlRecord, cwvStats, scores };
});

export { main };
