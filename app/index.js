var component = require('./component');
var app = document.createElement('div');
require('./styles/main.css');

document.body.appendChild(app);

app.appendChild(component());
