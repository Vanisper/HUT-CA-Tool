import { Type, validateBody } from "h3-typebox";
import { isToken } from "~~/utils/secret";

export default defineHandle(async (event) => {
  const body = await validateBody(
    event,
    Type.Object({
      token: Type.String(),
    })
  );
  const { token } = body;

  return isToken(token);
});
