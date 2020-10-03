var express = require('express');
var router = express.Router();

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger set up
const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Xin Chào!. đây là các api đã tạo nhen tụi bây",
            version: "1.0.0",
            description:
                "Địt mẹ vào xem cần thêm cái nào báo nhé tụi lờ",
            license: {
                name: "MIT",
                url: "https://choosealicense.com/licenses/mit/"
            },
            contact: {
                name: "EZcode",
                url: "https://www.facebook.com/khoathu1729",
                email: "Info@SmartBear.com"
            }
        },
    },
    apis: [
      '../docs/acccount.js'
    ]
};

const specs = swaggerJsdoc(options);
router.use("/docs", swaggerUi.serve);
router.get(
    "/docs",
    swaggerUi.setup(specs, {
        explorer: true
    })
);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
