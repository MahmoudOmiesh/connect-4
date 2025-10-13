import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import z, { ZodError } from "zod";
import { tryCatch } from "~/lib/utils";
import { redisWrapper } from "~/lib/wrappers/redis";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const roomValidMiddleware = t.middleware(async ({ next, input }) => {
  const { success, data: validatedInput } = z
    .object({ roomId: z.string() })
    .safeParse(input);

  if (!success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid input, please provide a valid room ID.",
    });
  }

  const { data: room, error } = await tryCatch(
    redisWrapper.getRoom(validatedInput.roomId),
  );

  if (error || room === null) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message:
        "Coudln't find this room, maybe it doesn't exist or has been deleted.",
    });
  }

  return next({
    ctx: {
      room,
    },
  });
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const roomProcedure = publicProcedure
  .input(z.object({ roomId: z.string() }))
  .use(roomValidMiddleware);
