const appPlugins = require("../app/plugins");
const routes = require("./routes");
const { flatten } = require("ramda");

module.exports = async function manifest() {
  try {
    let plugins = await Promise.all([appPlugins, routes]);

    plugins = flatten(plugins);

    const manifest = {
      server: {
        router: {
          stripTrailingSlash: true,
          isCaseSensitive: false
        },
        routes: {
          // TODO: Security measures that needs to be added later
          // security: {
          //     hsts: false,
          //     xss: true,
          //     noOpen: true,
          //     noSniff: true,
          //     xframe: false
          // },
          validate: {
            options: {
              abortEarly: false
            }
          }
        },
        host: process.env.HOST,
        port: process.env.PORT
      },
      register: {
        plugins
      }
    };
    return manifest;
  } catch (e) {
    throw new Error(e);
  }
};
