import createApp from "./src/source/createApp";

const router = createApp.createRouter();

router.get("/test", (req, res) => {
  res.json({
    status: true,
  });
});

createApp.createApp({
  router,
});
