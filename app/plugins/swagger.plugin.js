const { join } = require("path");

module.exports = {
  plugin: "hapi-swagger",
  options: {
    auth: "simple",
    grouping: "tags",
    // pluginOption: {
    //   hapiAclAuth: {
    //     secure: false
    //   }
    // },
    basePath:
      process.env.NODE_ENV === "development" ? "/" : `${process.env.KONG_URL}/`,
    schemes: ["https"],
    templates: join(__dirname, "../../static/swaggerTemplates"),
    info: {
      title: "Umobile App Payment API documentation",
      version: "1.0.0",
      "x-base":
        process.env.NODE_ENV === "development" ? "" : process.env.KONG_URL,
      description: `This is an API level Documentation. This containes complete API's for the Payment Module. \n
      The are various API categories are \n
      1. Payment Management
      Authentication is Must for all the routes. Auth Token can be found from App "USER MANAGEMENT" service.
      
      Response Codes 

      1. 200 OK - Successfull HTTP request.
      2. 201 Created - The request has been fulfilled, resulting in the creation of a new resource.
      3. 400 Bad Data - Invalid Input are Large Content message.
      4. 401 Unauthorized - Authentication is Required to access the route.
      5. 403 Forbidden - You don't have permission to access this route.
      6. 404 Not Found - Route not found or Resource not found.
      7. 500 Internal Server Error - Configuration data is invalid. 
            `
    },
    securityDefinitions: {
      jwt: {
        type: "apiKey",
        name: "Authorization",
        in: "header"
      }
    },
    security: [
      {
        jwt: []
      }
    ]
  }
};
