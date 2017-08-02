var hbs = require('handlebars');

hbs.registerHelper('jsObject', (opts) => {
  return new hbs.SafeString(opts.data.root.staticProps.reduce((str1,str2) => str1 + str2, ''));
})

module.exports = function(template,data) {
  var render = hbs.compile(template);
  return render(data);
};