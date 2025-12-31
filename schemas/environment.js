const { z } = require('zod');

const EnvironmentSchema = z.object({
  API_KEY: z.string(),
  API_URL: z.string(),
  VERBOSE: z.coerce.boolean().default(false),
  RETRY_DELAY: z.coerce.number().default(10000),
  RETRY_MAX: z.coerce.number().default(30),
  PAGING_DELAY: z.coerce.number().default(1000),
  PAGING_LIMIT: z.coerce.number().default(20)
});

module.exports = {
    EnvironmentSchema
}
