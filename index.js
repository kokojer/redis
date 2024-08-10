import Fastify from "fastify";
import { client } from "./redis.js";
import { Queue, Worker } from "bullmq";

const fastify = Fastify({
  logger: true,
});

const myQueue = new Queue("QUEUE", { connection: client });

const myWorker = new Worker(
  "QUEUE",
  async (job) => {
    return "bibaras";
  },
  {
    connection: client,
  }
);

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.post(
  "/data/:id",
  {
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      body: {
        anyOf: [{ type: "object" }, { type: "null" }, { type: "string" }],
      },
    },
  },
  async (request, reply) => {
    const userId = request.params.id;

    await myQueue.add("myJobName", { foo: "bar" });

    const cachedValue = await client.get(userId);

    if (!cachedValue || request.body) {
      await client.set(userId, JSON.stringify(request.body));
      reply.send("data was cached successfully.");
    }

    reply.send(JSON.parse(cachedValue));
  }
);

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
