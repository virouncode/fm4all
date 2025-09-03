import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  //global error handler during execution of a server action
  handleServerError(error, utils) {
    const { clientInput, metadata } = utils;
    console.log("Server error", error.message, clientInput, metadata);
    //TODO: use Sentry or other error tracking service
    if (error.constructor.name === "NeonDbError") {
      //if it's a database error don't expose to much information
      return "Database error: Your data did not save";
    }
    return error.message;
  },
});
