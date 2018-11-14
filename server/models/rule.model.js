// const mongoose = require('mongoose');
// // const PostProcess = require('./postProcess.model');

// const RuleSchema = new mongoose.Schema({
//   hostname: {
//     type: String,
//     required: true
//   },
//   element: {
//     type: String,
//     required: true//,
//     // unique: true,
//     // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
//     // match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
//   },
//   searchKey: {
//     type: String,
//     required: true
//   },
//   label: {
//     type: String/*,
//     default: Date.now*/
//   },
//   priority: {
//     type: Boolean
//   },
//   postProcess: [{
//     type: PostProcess,
//   }]
// }, {
//   versionKey: false
// });


// module.exports = mongoose.model('Rule', RuleSchema);
