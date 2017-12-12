import Koa from 'koa';
const app = new Koa();

const PORT = process.env.PORT || 3000;

// response
app.use(ctx => {
  ctx.body = 'Hello Koa on App Engine';
});

app.listen(PORT);
