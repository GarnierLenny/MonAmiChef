import { app } from "./app";

const port = Number(process.env.PORT) || 8888;

app.listen(port, "0.0.0.0", () =>
  console.log(`Example app listening on port ${port}`),
);
